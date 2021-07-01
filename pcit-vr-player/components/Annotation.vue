<template>
  <a-entity>
    <template v-if="annotation.options.length > 0 && !feedbackActive">
      <template>
        <Tooltip
          :text="annotation.annotation"
          :row="1"
          :of="totalRows"
        />

        <template v-if="annotation.type == 0">
          <Button
            v-for="(option, i) in annotation.options"
            :key="i"
            :row="i + 2"
            :of="totalRows"
            :text-value="option.option"
            @click="selectOption(option)"
          />
        </template>

        <template v-else-if="annotation.type == 1">
          {{ handleMovement() }}
        </template>

        <template v-else-if="annotation.type == 2">
          {{ handleBlowing() }}
        </template>

        <template v-else-if="annotation.type == 3">
          {{ handleGeneral() }}
        </template>
      </template>
    </template>

    <template v-else-if="selectedOption !== null && feedbackActive">
      <Tooltip
        :text="selectedOption.feedback"
        :row="1"
        :of="totalRows"
      />

      <Button
        :row="2"
        :of="totalRows"
        :text-value="'Verdergaan'"
        @click="switchSegment(selectedOption)"
      />
    </template>

    <!-- If there's no options, this is a message annotation -->
    <Button
      v-else
      :row="2"
      :of="totalRows"
      :text-value="'Verdergaan'"
      @click="$emit('continue')"
    />
  </a-entity>
</template>

<script>
import { mapActions } from 'vuex'
import Button from './Button'
import Tooltip from './Tooltip'

function isEvenlyDistributed (array, sliceAmount, margin, threshold) {
  const sliceSize = Math.floor(array.length / sliceAmount)
  const repetitions = sliceSize * sliceAmount
  const averages = []

  let sliceSum = 0.0
  let sum = 0.0

  /* Calculate the sum of the values in the array, which is used later to
   * calculate the average, and the average of slices of the array of size
   * sliceSize.
   */
  for (let i = 0; i < repetitions; i++) {
    sum += array[i]
    sliceSum += array[i]
    if (i > 0 && i % sliceSize === 0) {
      averages.push(sliceSum / sliceSize)
      sliceSum = 0
    }
  }

  const average = sum / repetitions

  /* If the average isn't bigger than or equal to the threshold, the volume
   * isn't high enough so return false.
   */
  if (average < threshold) {
    return false
  }

  /* For each slice average, check if the difference between the slice average
   * and the average of the whole array is bigger than the margin.
   */
  for (let i = 0; i < averages.length; i++) {
    if ((Math.abs(averages[i] - average) / average) > margin) {
      return false
    }
  }

  return true
}

export default {
  components: {
    Button,
    Tooltip
  },
  props: {
    annotation: {
      type: Object,
      required: true
    },
    pushAnalytics: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      feedbackActive: false,
      selectedOption: null
    }
  },
  computed: {
    totalRows () {
      if (this.annotation.options.length > 0) {
        return this.annotation.options.length + 1
      } else {
        return 2 // If there's no options, this is a message annotation, only show the text and a continue button
      }
    }
  },
  methods: {
    handleMovement () {
      /* Define the time interval which indicates the time between measurements.
       * Also define the margin for how much the user is allowed to move
       * without it actually counting as moving. Then, define a threshold
       * which defines the minimum rotation which is required in a single
       * time interval to acknowledge movement. This threshold is
       * multiplied by 0.001 because time is measured in milliseconds, so
       * divide by 1000 to get a number that isn't too large. Finally,
       * define the threshold for how much the camera has to have moved
       * in a direction to make the movement count as the user nodding or
       * shaking their head.
       */
      const interval = 50
      const speedThreshold = interval * 0.01
      const horThreshold = 9
      const verThreshold = 7
      const maxCount = 400 / interval
      const camera = document.getElementById('camera')

      let count = 0
      let horMargin = 3.5
      let verMargin = 4.5
      let firstRotation = []
      let prevRotation = []
      let prevDirection = []
      let maxDeviation = [0, 0]
      let directionChanges = [0, 0]
      let timeout = null

      return new Promise((resolve) => {
        const timer = setInterval(() => {
          /* Resets all variables to start over the algorithm. */
          function reset () {
            firstRotation = []
            prevDirection = []
            maxDeviation = [0, 0]
            directionChanges = [0, 0]
            horMargin = 3.5
            verMargin = 4.5
            count = 0
          }

          /* If no nodding or shaking is detected for 10 seconds, return
           * "Geen reactie".
           */
          if (!timeout) {
            timeout = setTimeout(() => {
              clearInterval(timer)
              resolve('Geen reactie')
            }, 10000)
          }

          const rotationVec = camera.getAttribute('rotation')
          const rotation = [rotationVec.y, rotationVec.x]

          if (!firstRotation.length) {
            firstRotation = rotation
          } else {
            const horDirection = rotation[0] - prevRotation[0]
            const verDirection = rotation[1] - prevRotation[1]
            const horDeviation = rotation[0] - firstRotation[0]
            const verDeviation = rotation[1] - firstRotation[1]

            /* Keep track of the maximum amount the camera has rotated in both
             * directions in order to check whether it has moved enough to count
             * as the user nodding or shaking their head and whether the user
             * isn't moving randomly. Also update the margins if maxDeviation
             * exceeds the threshold of the corresponding direction.
             */
            if (Math.abs(horDeviation) > maxDeviation[0]) {
              maxDeviation[0] = Math.abs(horDeviation)
              /* Update margin so it is a third of the maximum deviation from
               * the first rotation.
               */
              if (maxDeviation[0] > horThreshold) {
                horMargin = 3.5 + (maxDeviation[0] - horThreshold) * 0.3
              }
            }
            if (Math.abs(verDeviation) > maxDeviation[1]) {
              maxDeviation[1] = Math.abs(verDeviation)
              if (maxDeviation[1] > verThreshold) {
                verMargin = 4.5 + (maxDeviation[1] - verThreshold) * 0.3
              }
            }

            /* If the camera is about to change direction, ignore speedThreshold
             * for a maximum of maxCount times.
             */
            if ((Math.abs(horDirection) < speedThreshold &&
                 Math.abs(horDeviation) > Math.max(maxDeviation[0] - speedThreshold, horThreshold)) ||
                (Math.abs(verDirection) < speedThreshold &&
                 Math.abs(verDeviation) > Math.max(maxDeviation[1] - speedThreshold, verThreshold))) {
              if (count < maxCount) {
                count++
                return
              } else {
                reset()
              }
            }

            /* If the camera exceeds the margins in both directions or doesn't
             * exceed the speed threshold, the user isn't shaking their head or
             * nodding, so reset all variables used for the detection and
             * continue trying to detect head-shaking or nodding.
             */
            if ((maxDeviation[0] > horMargin &&
                 maxDeviation[1] > verMargin) ||
                (Math.abs(horDirection) < speedThreshold &&
                 Math.abs(verDirection) < speedThreshold)) {
              reset()
            } else {
              /* Check if the camera movement changes direction while the speed
               * exceeds the minimum speed and the camera has moved enough in
               * order for it to (possibly) count as the user nodding or shaking
               * their head. Save the sign of the previous direction in
               * directionChanges in order to keep track of which direction was
               * already moved in.
               */
              if (!directionChanges[0] &&
                  prevDirection.length &&
                  Math.sign(horDirection) !== Math.sign(prevDirection[0]) &&
                  Math.abs(horDirection) > speedThreshold &&
                  maxDeviation[0] > horThreshold) {
                directionChanges[0] = Math.sign(prevDirection[0])
              }
              if (!directionChanges[1] &&
                  prevDirection.length &&
                  Math.sign(verDirection) !== Math.sign(prevDirection[1]) &&
                  Math.abs(verDirection) > speedThreshold &&
                  maxDeviation[1] > verThreshold) {
                directionChanges[1] = Math.sign(prevDirection[1])
              }

              /* If the camera movement has changed for one direction and hasn't
               * exceeded the margins for the other direction and the camera has
               * moved both up and down or left and right and the camera isn't
               * rotating in the same direction as at the start, return the type
               * of movement.
               */
              if (directionChanges[0] &&
                  maxDeviation[1] < verMargin &&
                  Math.abs(horDeviation) > horThreshold / 2 &&
                  Math.sign(horDeviation) !== directionChanges[0]) {
                clearInterval(timer)
                resolve('Geschud')
              } else if (directionChanges[1] &&
                         maxDeviation[0] < horMargin &&
                         Math.abs(verDeviation) > verThreshold / 2 &&
                         Math.sign(verDeviation) !== directionChanges[1]) {
                clearInterval(timer)
                resolve('Geknikt')
              }

              /* Reset if the camera rotates in the direction it first rotated
               * in if the rotation isn't at the edge of the motion.
               */
              if ((directionChanges[0] &&
                   Math.sign(horDirection) === directionChanges[0] &&
                   maxDeviation[0] - Math.abs(horDeviation) > speedThreshold) ||
                  (directionChanges[1] &&
                   Math.sign(verDirection) === directionChanges[1] &&
                   maxDeviation[1] - Math.abs(verDeviation) > speedThreshold)) {
                reset()
              }

              if (Math.abs(horDirection) > speedThreshold) {
                prevDirection[0] = horDirection
              }
              if (Math.abs(verDirection) > speedThreshold) {
                prevDirection[1] = verDirection
              }
            }
          }
          prevRotation = rotation
        }, interval)
      })
        .then((result) => {
          this.annotation.options.forEach((option) => {
            if (option.option === result) {
              this.selectOption(option)
            }
          })
        })
    },
    handleBlowing () {
      /* This function is based on the code in this git repository:
       * https://github.com/qwertywertyerty/detecting-blowing-mic
       */
      if (window.stream) {
        /* Set up the audio input stream. */
        const stream = window.stream
        const audioContext = new AudioContext()
        const analyser = audioContext.createAnalyser()
        const microphone = audioContext.createMediaStreamSource(stream)

        let blowCount = 0
        let timeout = null

        analyser.fftSize = 1024
        analyser.smoothingTimeConstant = 0.0

        microphone.connect(analyser)

        return new Promise((resolve) => {
          const timer = setInterval(() => {
            /* If no blowing is detected for 10 seconds, return "Geen reactie".
             */
            if (!timeout) {
              timeout = setTimeout(() => {
                clearInterval(timer)
                resolve('Geen reactie')
              }, 10000)
            }

            const audioData = new Uint8Array(analyser.frequencyBinCount)
            analyser.getByteFrequencyData(audioData)

            /* Calculate the upper bound of the array indices corresponding to
             * the maximum frequency for the frequencies that contain
             * information about blowing sounds (6000Hz). getByteFrequencyData()
             * returns an array with a frequency range of 0 to
             * 0.5 * audioContext.sampleRate, so 0.5 * audioContext.sampleRate
             * divided by the length of this array is the frequency range of
             * each element.
             */
            const upperFrequency = 6000
            const stepSize = (audioContext.sampleRate / 2) / analyser.frequencyBinCount
            const upperBound = Math.min(Math.floor(upperFrequency / stepSize), analyser.frequencyBinCount)
            const data = audioData.slice(0, upperBound)

            if (isEvenlyDistributed(data, 10, 0.4, 70)) {
              blowCount++
            } else {
              blowCount = 0
            }

            if (blowCount > 2) {
              clearInterval(timer)
              stream.getTracks().forEach((track) => {
                track.stop()
              })
              audioContext.close()
              resolve('Geblazen')
            }
          }, 100)
        })
          .then((result) => {
            this.annotation.options.forEach((option) => {
              if (option.option === result) {
                this.selectOption(option)
              }
            })
          })
      } else {
        console.log('er is geen stream gedetecteerd')
      }
    },
    handleGeneral () {
      /* Pass the options of this annotation to the backend. */
      this.$axios.$post(`/api/customer/${this.$route.params.user}/options`, { annotation_id: this.annotation.id })
        .then((_) => {
          const timer = setInterval(() => {
            /* Get the ID of the chosen option from the backend. */
            this.$axios.$get(`/api/customer/${this.$route.params.user}/options/chosen`)
              .catch()
              .then((chosenOptionId) => {
                const chosenOption = this.annotation.options.filter(option => option.id === chosenOptionId.option_id)[0]
                if (chosenOption) {
                  clearInterval(timer)
                  this.selectOption(chosenOption)
                }
              })
          }, 3000)
        })
    },
    switchSegment (option) {
      if (this.pushAnalytics) {
        this.pushClick({ annotation: this.annotation.annotation, annotationTimestamp: this.annotation.timestamp, option: option.option })
      }

      this.$emit('switch-segment', option.next_segment_id)

      this.selectedOption = null
      this.feedbackActive = false
    },
    selectOption (option) {
      if (option.feedback === null || option.feedback === '') {
        this.switchSegment(option)
        return
      }

      this.selectedOption = option
      this.feedbackActive = true
    },
    ...mapActions({
      pushClick: 'pushAnnotationClickEvent'
    })
  }
}
</script>

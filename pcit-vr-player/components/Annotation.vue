<template>
  <a-entity>
    <template v-if="annotation.options.length > 0 && !feedbackActive">
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

function isEvenlyDistributed (array, sliceAmount, margin, avgThreshold) {
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

  /* For each slice average, check if the difference between the slice average
   * and the average of the whole array is out of the margin. Also check if the
   * average is smaller than the threshold. If any of these conditions hold
   * true, the array is not evenly distributed and the function returns false.
   */
  for (let i = 0; i < averages.length; i++) {
    if ((Math.abs(averages[i] - average) / average) > margin ||
        average < avgThreshold) {
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
      const interval = 100
      let firstRotation = []
      let prevRotation = []
      let prevDirection = []
      let maxDeviation = [0, 0]
      let directionChanges = [0, 0]
      let rotations = []

      return new Promise((resolve) => {
        const timer = setInterval(() => {
          const camera = document.getElementById('camera')
          const rotationVec = camera.getAttribute('rotation')
          const rotation = [rotationVec.y, rotationVec.x]
          rotations.push(rotation)

          if (!firstRotation.length) {
            firstRotation = rotation
          } else {
            /* Define the margin for how much the user is allowed to move
             * without it actually counting as moving. Then, define a threshold
             * which defines the minimum rotation which is required in a single
             * time interval to acknowledge movement. This threshold is
             * multiplied by 0.003 because time is measured in milliseconds, so
             * divide by 1000 to get a number that isn't too large. Finally,
             * define the threshold for how much the camera has to have moved
             * in a direction to make the movement count as the user nodding or
             * shaking their head.
             */
            const margin = 10
            const speedThreshold = margin * interval * 0.003
            const threshold = 30
            let horDirection = rotation[0] - prevRotation[0]
            let verDirection = rotation[1] - prevRotation[1]
            const horDeviation = rotation[0] - firstRotation[0]
            const verDeviation = rotation[1] - firstRotation[1]

            /* Keep track of the maximum amount the camera has rotated in both
             * directions in order to check whether it has moved enough to count as
             * the user nodding or shaking their head and whether the user isn't
             * moving randomly. Update here if necessary.
             */
            if (Math.abs(horDeviation) > maxDeviation[0]) {
              maxDeviation[0] = Math.abs(horDeviation)
            }
            if (Math.abs(verDeviation) > maxDeviation[1]) {
              maxDeviation[1] = Math.abs(verDeviation)
            }

            /* If the camera exceeds the margins in both directions or doesn't
             * exceed the speed threshold, the user isn't shaking their head or
             * nodding, so reset all variables used for the detection and continue
             * trying to detect head-shaking or nodding. The speed threshold can be
             * ignored once, since it is expected that the user changes direction
             * once. That is why both the current and the previous speeds must not
             * exceed the threshold for this condition to hold true.
             * NOTE: MAY NEED SOME TWEAKING, BECAUSE THE USER MAY HOLD THEIR HEAD
             * STILL FOR LONGER THAN THE INTERVAL WHEN CHANGING DIRECTIONS.
             */
            if ((maxDeviation[0] > margin &&
                maxDeviation[1] > margin) ||
                (prevDirection.length &&
                Math.abs(horDirection) < speedThreshold &&
                Math.abs(prevDirection[0]) < speedThreshold &&
                Math.abs(verDirection) < speedThreshold &&
                Math.abs(prevDirection[1]) < speedThreshold)) {
              firstRotation = rotation
              prevDirection = []
              maxDeviation = [0, 0]
              directionChanges = [0, 0]
              rotations = []
            } else {
              /* Make sure the sign of the direction stays the same when a
               * direction is 0, which means that the camera isn't moving.
               */
              if (prevDirection.length &&
                  Math.sign(horDirection) === 0) {
                horDirection += Math.sign(prevDirection[0])
              }
              if (prevDirection.length &&
                  Math.sign(verDirection) === 0) {
                verDirection += Math.sign(prevDirection[1])
              }

              /* Check if the camera movement changes direction and the camera
               * has moved enough in order for it to (possibly) count as the
               * user nodding or shaking their head. Save the sign of the
               * previous direction in directionChanges in order to keep track
               * of which direction was already moved in.
               */
              if (!directionChanges[0] &&
                  prevDirection.length &&
                  Math.sign(horDirection) !== Math.sign(prevDirection[0]) &&
                  maxDeviation[0] > threshold) {
                directionChanges[0] = Math.sign(prevDirection[0])
              }
              if (!directionChanges[1] &&
                  prevDirection.length &&
                  Math.sign(verDirection) !== Math.sign(prevDirection[1]) &&
                  maxDeviation[1] > threshold) {
                directionChanges[1] = Math.sign(prevDirection[1])
              }

              /* If the camera movement has changed for one direction and hasn't
              * exceeded the margins for the other direction and the camera has
              * moved both up and down or left and right, return the number
              * corresponding to the type of movement.
              */
              if (directionChanges[0] &&
                  maxDeviation[1] < margin &&
                  Math.abs(horDeviation) > threshold &&
                  Math.sign(horDeviation) !== directionChanges[0]) {
                clearInterval(timer)
                resolve('0')
              } else if (directionChanges[1] &&
                        maxDeviation[0] < margin &&
                        Math.abs(verDeviation) > threshold &&
                        Math.sign(verDeviation) !== directionChanges[1]) {
                clearInterval(timer)
                resolve('1')
              }

              prevDirection = [horDirection, verDirection]
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
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then((stream) => {
          /* Set up the audio input stream. */
          const audioContext = new AudioContext()
          const analyser = audioContext.createAnalyser()
          const microphone = audioContext.createMediaStreamSource(stream)

          analyser.fftSize = 1024
          analyser.smoothingTimeConstant = 0.0

          microphone.connect(analyser)

          return new Promise((resolve) => {
            const timer = setInterval(() => {
              const audioData = new Uint8Array(analyser.frequencyBinCount)
              analyser.getByteFrequencyData(audioData)

              /* Calculate the boundaries of the indices which indicate
               * frequencies of blowing sounds. The lower bound for blowing
               * frequencies is about 500, while the upper bound is 3000. Since
               * getByteFrequencyData() returns an array with a frequency range
               * of 0 to 0.5 * audioContext.sampleRate, These numbers can be
               * multiplied by 2 to avoid an extra multiplication.
               */
              const n = analyser.frequencyBinCount
              // NOTE: MAAK HIER NOG EEN LEKKER EXPERIMENTJE VAN VOOR IN JE
              // SCRIPTIE HOE JE AAN DEZE WAARDES BENT GEKOMEN.
              const blowLowerBound = Math.min(audioContext.sampleRate, 6000)
              const blowLowerArrayBound = Math.floor(blowLowerBound * (n - 1) /
                audioContext.sampleRate)
              const blowUpperBound = Math.min(audioContext.sampleRate, 30000)
              const blowUpperArrayBound = Math.floor(blowUpperBound * (n - 1) /
                audioContext.sampleRate)
              const blowData = audioData.slice(blowLowerArrayBound,
                blowUpperArrayBound)

              /* Check if the frequencies are evenly distributed, which means
               * that there is probably a blowing sound.
               */
              if (isEvenlyDistributed(blowData, 10, 0.3, 70)) {
                stream.getTracks().forEach((track) => {
                  track.stop()
                })
                audioContext.close()
                clearInterval(timer)
                resolve('1')
              }
              // NOTE: KAN ZIJN DAT DEZE WAARDE VOOR INTERVAL GETWEAKED MOET WORDEN.
            }, 1000)
          })
            .then((result) => {
              this.annotation.options.forEach((option) => {
                if (option.option === result) {
                  this.selectOption(option)
                }
              })
            })
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

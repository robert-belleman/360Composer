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
        <!-- moeten misschien <div> brackets omheen -->
        {{ handleMovement() }}
      </template>
      <template v-else-if="annotation.type == 2">
        <!-- moeten misschien <div> brackets omheen -->
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
      selectedOption: null,
      timer: null,
      rotations: [],
      lastDirections: [],
      maxDeviations: [],
      directionChanges: [false, false]
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
      return new Promise((resolve) => {
        this.timer = setInterval(() => {
          const camera = document.getElementById('camera')
          const rotation = camera.getAttribute('rotation')
          const rotationVec = [rotation.x, rotation.y, rotation.z]
          /* Array.push() returns the length of the array, which is stored in the
           * variable n here.
           */
          const n = this.rotations.push(rotationVec)
          /* Define the margin for how much the user is allowed to move without it
           * actually counting as moving. Then, define a threshold which defines
           * the minimum rotation which is required in a single time interval to
           * acknowledge movement. This threshold is multiplied by 0.003 because
           * time is measured in milliseconds, so divide by 1000 to get a number
           * that isn't too large.
           */
          const margin = 10
          const speedThreshold = margin * interval * 0.003

          if (n === 2) {
            const horDirection = rotation.y - this.rotations[n - 2][1]
            const verDirection = rotation.x - this.rotations[n - 2][0]
            /* If the camera moves quickly enough, keep track of the directions it
             * moved in for the last measurement. Else the camera didn't move
             * enough, so the user hasn't started nodding or shaking their head.
             */
            if (Math.abs(horDirection) > speedThreshold ||
                Math.abs(verDirection) > speedThreshold) {
              this.lastDirections = [horDirection, verDirection]
              /* Keep track of the maximum amount the camera has rotated in both
               * directions in order to check whether it has moved enough to count as
               * the user nodding or shaking their head and whether the user isn't
               * moving randomly.
               */
              this.maxDeviations = [Math.abs(horDirection), Math.abs(verDirection)]
            } else {
              this.rotations = []
            }
          } else if (n > 2) {
            const horDirection = rotation.y - this.rotations[n - 2][1]
            const verDirection = rotation.x - this.rotations[n - 2][0]
            /* Define the threshold for how much the camera has to have moved in a
             * direction to make the movement count as the user nodding or shaking
             * their head.
             */
            const threshold = 30
            const horDeviation = Math.abs(rotation.y - this.rotations[0][1])
            const verDeviation = Math.abs(rotation.x - this.rotations[0][0])

            /* Update the maximum deviation values if necessary. */
            if (horDeviation > this.maxDeviations[0]) {
              this.maxDeviations[0] = horDeviation
            }
            if (verDeviation > this.maxDeviations[1]) {
              this.maxDeviations[1] = verDeviation
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
            if ((this.maxDeviations[0] > margin &&
                this.maxDeviations[1] > margin) ||
                (Math.abs(horDirection) < speedThreshold &&
                Math.abs(this.lastDirections[0]) < speedThreshold &&
                Math.abs(verDirection) < speedThreshold &&
                Math.abs(this.lastDirections[1]) < speedThreshold)) {
              this.rotations = []
              this.lastDirections = []
              this.maxDeviations = []
              this.directionChanges = [false, false]
              /* eslint-disable no-console */
              console.log('Wat een trage opa ben jij zeg, ik haak af.')
              /* eslint-enable no-console */
              return
            }

            /* Check if the camera movement changes direction and the camera has
             * moved enough in order for it to (possibly) count as the user nodding
             * or shaking their head.
             */
            if (Math.sign(horDirection) !== Math.sign(this.lastDirections[0]) &&
                this.maxDeviations[0] > threshold) {
              this.directionChanges[0] = true
            }
            if (Math.sign(verDirection) !== Math.sign(this.lastDirections[1]) &&
                this.maxDeviations[1] > threshold) {
              this.directionChanges[1] = true
            }

            /* If the camera movement has changed for one direction and hasn't
             * exceeded the margins for the other direction and the camera has
             * moved both up and down or left and right, return the name of the
             * corresponding movement.
             */
            if (this.directionChanges[0] &&
                this.maxDeviations[1] < margin &&
                horDeviation > threshold) {
              clearInterval(this.timer)
              resolve('0')
            } else if (this.directionChanges[1] &&
                      this.maxDeviations[0] < margin &&
                      verDeviation > threshold) {
              clearInterval(this.timer)
              resolve('1')
            }
          }
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
      // navigator.getUserMedia || navigator.webkitGetUserMedia ||
      //                     navigator.mozGetUserMedia || navigator.msGetUserMedia
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then((stream) => {
          // audioTracks = stream.getAudioTracks()
          // const mediaRecorder = new mediaRecorder(stream)
          // mediaRecorder.start()

          // mediaRecorder.requestData()

          const audioContext = new AudioContext()
          const analyser = audioContext.createAnalyser()
          const microphone = audioContext.createMediaStreamSource(stream)

          analyser.fftSize = 1024
          analyser.smoothingTimeConstant = 0.8

          microphone.connect(analyser)

          return new Promise((resolve) => {
            this.timer = setInterval(() => {
              const audioData = new Uint8Array(analyser.frequencyBinCount)
              analyser.getByteFrequencyData(audioData)
              let sum = 0

              audioData.forEach((val) => {
                sum += val
              })

              const average = sum / analyser.frequencyBinCount

              if (average > 90) {
                // wanneer klaar
                stream.getTracks().forEach((track) => {
                  track.stop()
                })
                audioContext.close()
                clearInterval(this.timer)
                /* eslint-disable no-console */
                console.log('Er is geblaas gedetecteerd!')
                /* eslint-enable no-console */
                resolve('1')
              }
            }, 750)
          })
            .then((result) => {
              this.annotation.options.forEach((option) => {
                if (option.option === result) {
                  this.selectOption(option)
                }
              })
            })
        })
        .catch((err) => {
          /* eslint-disable no-console */
          console.log(err)
          /* eslint-enable no-console */
          return '0'
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

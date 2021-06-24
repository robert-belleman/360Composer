<template>
  <a-entity>
    <template v-if="annotation.options.length > 0 && !feedbackActive">
      <!--<template v-if="showResults">
        <Button
          :row="1"
          :of="1"
          :geometry="'primitive: plane; height: 5; width: 5'"
          :material="'opacity: 1.0; transparent: false'"
          :text-color="'black'"
          :text-value="rotations"
          :slice-text="false"
          :clickable="false"
        />
      </template>
      -->

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

// function formatMovementData (data) {
//   function isNumber (n) {
//     return !isNaN(parseFloat(n)) && isFinite(n)
//   }

//   function roundValues (array, precision) {
//     const roundedArray = []

//     array.forEach(function round (elem) {
//       if (isNumber(elem)) {
//         roundedArray.push(Number.parseFloat(elem.toFixed(precision)))
//       } else if (elem.constructor === Array) {
//         roundedArray.push(roundValues(elem, precision))
//       } else {
//         roundedArray.push(elem)
//       }
//     })

//     return roundedArray
//   }

//   const roundedData = roundValues(data, 2)
//   return JSON.stringify(roundedData).split(',[').join(',\n[').split(',').join(', ').split(' \n').join('\n')
// }

// function formatBlowingData (data) {
//   function isNumber (n) {
//     return !isNaN(parseFloat(n)) && isFinite(n)
//   }

//   function convertArray (array) {
//     const newArray = []

//     array.forEach(function round (elem) {
//       if (!isNumber(elem)) {
//         newArray.push(Array.from(elem))
//       } else {
//         newArray.push(elem)
//       }
//     })

//     return newArray
//   }

//   const roundedData = convertArray(data)
//   return JSON.stringify(roundedData).split(',[').join(',\n[').split(',').join(', ').split(' \n').join('\n')
// }

// let file = null

// function saveResults (content, name) {
//   const blob = new Blob([content], { type: 'text/plain' })

//   // if (file !== null) {
//   //   window.URL.revokeObjectURL(file)
//   // }

//   const file = window.URL.createObjectURL(blob)
//   const link = document.createElement('a')
//   link.setAttribute('download', name)
//   link.href = file
//   document.body.appendChild(link)

//   window.requestAnimationFrame(function () {
//     const event = new MouseEvent('click')
//     link.dispatchEvent(event)
//     document.body.removeChild(link)
//   })
// }

/* Based on:
 * https://www.geeksforgeeks.org/how-to-get-the-standard-deviation-of-an-array-of-numbers-using-javascript/
 */
// function standardDeviation (array) {
//   const mean = array.reduce((acc, val) => {
//     return acc + val
//   }) / array.length

//   const tempArr = array.map((val) => {
//     return (val - mean) ** 2
//   })

//   const sum = tempArr.reduce((acc, val) => {
//     return acc + val
//   })

//   return Math.sqrt(sum / tempArr.length)
// }

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

  let count = 0

  /* For each slice average, check if the difference between the slice average
   * and the average of the whole array is bigger than the margin.
   */
  for (let i = 0; i < averages.length; i++) {
    if ((Math.abs(averages[i] - average) / average) > margin) {
      count++
    }
    if (count > 1) {
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
      // showResults: false,
      // rotations: []
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
       * multiplied by 0.003 because time is measured in milliseconds, so
       * divide by 1000 to get a number that isn't too large. Finally,
       * define the threshold for how much the camera has to have moved
       * in a direction to make the movement count as the user nodding or
       * shaking their head.
       */
      const interval = 50
      const speedThreshold = interval * 0.01
      const horThreshold = 8
      const verThreshold = 6
      const maxCount = 500 / interval
      const camera = document.getElementById('camera')

      // const rotations = [] // TEMP
      let count = 0
      let horMargin = 3
      let verMargin = 2
      let firstRotation = []
      let prevRotation = []
      let prevDirection = []
      let maxDeviation = [0, 0]
      let directionChanges = [0, 0]
      let timeout = null

      return new Promise((resolve) => {
        const timer = setInterval(() => {
          function reset () {
            firstRotation = []
            prevDirection = []
            maxDeviation = [0, 0]
            directionChanges = [0, 0]
            horMargin = 3
            verMargin = 2
            count = 0
          }

          if (!timeout) {
            timeout = setTimeout(() => {
              clearInterval(timer)
              resolve('Geen reactie')
            }, 10000)
          }

          const rotationVec = camera.getAttribute('rotation')
          const rotation = [rotationVec.y, rotationVec.x]
          // this.rotations.push(rotation) // TEMP

          if (!firstRotation.length) {
            firstRotation = rotation
          } else {
            const horDirection = rotation[0] - prevRotation[0]
            const verDirection = rotation[1] - prevRotation[1]
            const horDeviation = rotation[0] - firstRotation[0]
            const verDeviation = rotation[1] - firstRotation[1]

            /* Keep track of the maximum amount the camera has rotated in both
             * directions in order to check whether it has moved enough to count as
             * the user nodding or shaking their head and whether the user isn't
             * moving randomly. Update here if necessary.
             */
            if (Math.abs(horDeviation) > maxDeviation[0]) {
              maxDeviation[0] = Math.abs(horDeviation)
              /* Update margin so it is a third of the maximum deviation from
               * the first rotation.
               */
              if (maxDeviation[0] > horThreshold) {
                horMargin = 3 + maxDeviation[0] * 0.1
              }
            }
            if (Math.abs(verDeviation) > maxDeviation[1]) {
              maxDeviation[1] = Math.abs(verDeviation)
              if (maxDeviation[1] > verThreshold) {
                verMargin = 2 + maxDeviation[1] * 0.1
              }
            }

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
             * nodding, so reset all variables used for the detection and continue
             * trying to detect head-shaking or nodding. The speed threshold can be
             * ignored once, since it is expected that the user changes direction
             * once. That is why both the current and the previous speeds must not
             * exceed the threshold for this condition to hold true.
             * NOTE: MAY NEED SOME TWEAKING, BECAUSE THE USER MAY HOLD THEIR HEAD
             * STILL FOR LONGER THAN THE INTERVAL WHEN CHANGING DIRECTIONS.
             */
            if ((maxDeviation[0] > horMargin &&
                maxDeviation[1] > verMargin) ||
                (Math.abs(horDirection) < speedThreshold &&
                // Math.abs(horDeviation) < Math.max(maxDeviation[0], horThreshold) && // UPDATED
                //  &&
                // Math.abs(verDeviation) < Math.max(maxDeviation[1], verThreshold)
                Math.abs(verDirection) < speedThreshold)) {
              reset()
            } else {
              /* Make sure the sign of the direction stays the same when a
               * direction is 0, which means that the camera isn't moving.
               */
              // if (prevDirection.length &&
              //     Math.sign(horDirection) === 0) {
              //   horDirection += Math.sign(prevDirection[0])
              // }
              // if (prevDirection.length &&
              //     Math.sign(verDirection) === 0) {
              //   verDirection += Math.sign(prevDirection[1])
              // }

              /* Check if the camera movement changes direction and the camera
               * has moved enough in order for it to (possibly) count as the
               * user nodding or shaking their head. Save the sign of the
               * previous direction in directionChanges in order to keep track
               * of which direction was already moved in.
               */
              if (!directionChanges[0] &&
                  prevDirection.length &&
                  Math.sign(horDirection) !== Math.sign(prevDirection[0]) &&
                  Math.abs(horDirection) > speedThreshold && // UPDATED
                  maxDeviation[0] > horThreshold) {
                directionChanges[0] = Math.sign(prevDirection[0])
              }
              if (!directionChanges[1] &&
                  prevDirection.length &&
                  Math.sign(verDirection) !== Math.sign(prevDirection[1]) &&
                  Math.abs(verDirection) > speedThreshold && // UPDATED
                  maxDeviation[1] > verThreshold) {
                directionChanges[1] = Math.sign(prevDirection[1])
              }

              /* If the camera movement has changed for one direction and hasn't
              * exceeded the margins for the other direction and the camera has
              * moved both up and down or left and right, return the number
              * corresponding to the type of movement.
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

              if ((directionChanges[0] &&
                   Math.sign(horDirection) === directionChanges[0] &&
                   maxDeviation[0] - Math.abs(horDeviation) > speedThreshold) ||
                  (directionChanges[1] &&
                   Math.sign(verDirection) === directionChanges[1] &&
                   maxDeviation[1] - Math.abs(verDeviation) > speedThreshold)) {
                reset()
              }

              // if (Math.abs(rotation[0]) > 90 || Math.abs(rotation[1]) > 90) {
              //   clearInterval(timer)
              //   resolve('1')
              // }

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
          // const formattedData = formatMovementData(this.rotations)
          // saveResults(formattedData, 'beweging_test.txt')
        })
    },
    handleBlowing () {
      /* This function is based on the code in this git repository:
       * https://github.com/qwertywertyerty/detecting-blowing-mic
       */
      // navigator.getUserMedia = navigator.getUserMedia ||
      //   navigator.webkitGetUserMedia ||
      //   navigator.mozGetUserMedia
      // if (!navigator.getUserMedia) {
      //   return
      // }

      // navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      // const stream = JSON.parse(sessionStorage.getItem('audioStream'))

      // let stream = null

      // if (window.stream) {
      const stream = window.stream
      // } else {
      //   stream = navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      // }
      // console.log('stream = ', stream)
      if (stream) {
        // console.log('er is een stream dus het werkt!!!')
        // .then((stream) => {
        /* Set up the audio input stream. */
        const audioContext = new AudioContext()
        const analyser = audioContext.createAnalyser()
        const microphone = audioContext.createMediaStreamSource(stream)
        // const audioDatas = []
        // const stDevs = []
        // const means = []
        const datas = []

        let blowCount = 0
        let notBlowCount = 0
        let timeout = null

        analyser.fftSize = 1024
        analyser.smoothingTimeConstant = 0.0

        microphone.connect(analyser)

        return new Promise((resolve) => {
          const timer = setInterval(() => {
            if (!timeout) {
              timeout = setTimeout(() => {
                clearInterval(timer)
                resolve('Geen reactie')
              }, 10000)
            }

            const audioData = new Uint8Array(analyser.frequencyBinCount)
            analyser.getByteFrequencyData(audioData)

            /* Calculate the boundaries of the indices which indicate
              * frequencies of blowing sounds. The lower bound for blowing
              * frequencies is about 3000, while the upper bound is 15000.
              * Since getByteFrequencyData() returns an array with a frequency
              * range of 0 to 0.5 * audioContext.sampleRate, These numbers can
              * be multiplied by 2 to avoid an extra multiplication.
              */
            // const n = analyser.frequencyBinCount
            // NOTE: MAAK HIER NOG EEN LEKKER EXPERIMENTJE VAN VOOR IN JE
            // SCRIPTIE HOE JE AAN DEZE WAARDES BENT GEKOMEN.
            // const blowLowerBound = Math.min(audioContext.sampleRate, 6000)
            // const blowLowerArrayBound = Math.floor(blowLowerBound * (n - 1) /
            //   audioContext.sampleRate)
            // const blowUpperBound = Math.min(audioContext.sampleRate, 30000)
            // const blowUpperArrayBound = Math.floor(blowUpperBound * (n - 1) /
            //   audioContext.sampleRate)
            // const blowData = audioData.slice(blowLowerArrayBound,
            //   blowUpperArrayBound)

            const upperFrequency = 6000
            const stepSize = (audioContext.sampleRate / 2) / analyser.frequencyBinCount
            const upperBound = Math.min(Math.floor(upperFrequency / stepSize), analyser.frequencyBinCount)
            const data = audioData.slice(0, upperBound)

            // blowCount++
            // if (blowCount < 0) {
            //   data.push(0)
            // }

            // const stDev = standardDeviation(data)
            // const mean = data.reduce((acc, val) => {
            //   return acc + val
            // }) / data.length

            // console.log('mean = ', mean)
            // console.log('stDev = ', stDev)

            // means.push(mean)
            // stDevs.push(stDev)

            // if (mean > 70 && stDev < mean / 25) {
            //   blowCount++
            // }

            datas.push(data)

            if (isEvenlyDistributed(data, 7, 0.3, 50)) {
              blowCount++
              notBlowCount = 0
            } else {
              notBlowCount++
            }

            if (notBlowCount > 3) {
              blowCount = 0
            }

            if (blowCount > 3) {
              clearInterval(timer)
              // saveResults(JSON.stringify(datas), 'geblazen.txt')
              resolve('Geblazen')
              audioContext.close()
            }
            // stDevs.push(stDev)

            /* Check if the frequencies are evenly distributed, which means
              * that there is probably a blowing sound.
              */
            // if (isEvenlyDistributed(blowData, 10, 0.3, 70)) {
            // audioDatas.push(data)

            // const camera = document.getElementById('camera')
            // const rotationVec = camera.getAttribute('rotation')
            // const rotation = [rotationVec.y, rotationVec.x]
            // if (Math.abs(rotation[0]) > 90 || Math.abs(rotation[1]) > 90) {
            //   stream.getTracks().forEach((track) => {
            //     track.stop()
            //   })
            //   audioContext.close()
            //   clearInterval(timer)
            //   // resolve('1')
            //   resolve(1)
            // }
            // stream.getTracks().forEach((track) => {
            //   track.stop()
            // })
            // audioContext.close()
            // clearInterval(timer)
            // // resolve('1')
            // resolve(audioData)
            // }
            // NOTE: KAN ZIJN DAT DEZE WAARDE VOOR INTERVAL GETWEAKED MOET WORDEN.
          }, 100)
        })
          .then((result) => {
          // .then((_) => {
            // const formattedData = formatBlowingData(datas)
            // saveResults(formattedData, 'blowing.txt')
            this.annotation.options.forEach((option) => {
              if (option.option === result) {
                this.selectOption(option)
              }
            })
            // const formattedData = audioContext.sampleRate.toString().concat(formatBlowingData(audioData))
            // saveResults(JSON.stringify(means).concat(JSON.stringify(stDevs)), 'blowing_test.txt')
            // saveResults(JSON.stringify(stDevs), 'stdevs.txt')
            // console.log('lengte is ', formattedData.length)
            // saveResults(JSON.stringify(audioData), 'blowing_test.txt')
          })
      // })
      } else {
        console.log('er is geen stream gedetecteerd')
      }
    },
    handleGeneral () {
      // console.log(this.annotation.id)
      /* eslint-disable no-console */
      // console.log('options posted: ', this.annotation.options)
      /* eslint-enable no-console */
      this.$axios.$post(`/api/customer/${this.$route.params.user}/options`, { annotation_id: this.annotation.id })
        .then((_) => {
          const timer = setInterval(() => {
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

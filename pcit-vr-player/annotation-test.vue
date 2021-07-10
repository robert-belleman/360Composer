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

function formatMovementData (data) {
  function isNumber (n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
  }

  function roundValues (array, precision) {
    const roundedArray = []

    array.forEach(function round (elem) {
      if (isNumber(elem)) {
        roundedArray.push(Number.parseFloat(elem.toFixed(precision)))
      } else if (elem.constructor === Array) {
        roundedArray.push(roundValues(elem, precision))
      } else {
        roundedArray.push(elem)
      }
    })

    return roundedArray
  }

  const roundedData = roundValues(data, 2)
  return JSON.stringify(roundedData).split(',[').join(',\n[').split(',').join(', ').split(' \n').join('\n')
}

function formatBlowingData (data) {
  function isNumber (n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
  }

  function convertArray (array) {
    const newArray = []

    array.forEach(function round (elem) {
      if (!isNumber(elem)) {
        newArray.push(Array.from(elem))
      } else {
        newArray.push(elem)
      }
    })

    return newArray
  }

  const roundedData = convertArray(data)
  return JSON.stringify(roundedData).split(',[').join(',\n[').split(',').join(', ').split(' \n').join('\n')
}

function saveResults (content, name) {
  const blob = new Blob([content], { type: 'text/plain' })

  const file = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('download', name)
  link.href = file
  document.body.appendChild(link)

  window.requestAnimationFrame(function () {
    const event = new MouseEvent('click')
    link.dispatchEvent(event)
    document.body.removeChild(link)
  })
}

function getMean (data) {
  const sum = data.reduce((acc, val) => acc + val)
  const mean = sum / data.length
  return mean
}

function getStd (data) {
  const sum = data.reduce((acc, val) => acc + val)
  const mean = sum / data.length
  const std = Math.sqrt(data.reduce((acc, val) => acc + (val - mean) ** 2) / data.length)
  return std
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
       * multiplied by 0.003 because time is measured in milliseconds, so
       * divide by 1000 to get a number that isn't too large. Finally,
       * define the threshold for how much the camera has to have moved
       * in a direction to make the movement count as the user nodding or
       * shaking their head.
       */
      const interval = 50
      const camera = document.getElementById('camera')
      const rotations = []

      return new Promise((resolve) => {
        const timer = setInterval(() => {
          const rotationVec = camera.getAttribute('rotation')
          const rotation = [rotationVec.y, rotationVec.x]
          rotations.push(rotation)

          if (Math.abs(rotation[0]) > 90 || Math.abs(rotation[1]) > 90) {
            clearInterval(timer)
            resolve(1)
          }
        }, interval)
      })
        .then((_) => {
          const formattedData = formatMovementData(rotations)
          saveResults(formattedData, 'beweging_test.txt')
        })
    },
    handleBlowing () {
      /* This function is based on the code in this git repository:
       * https://github.com/qwertywertyerty/detecting-blowing-mic
       */
      if (window.stream) {
        const stream = window.stream
        /* Set up the audio input stream. */
        const audioContext = new AudioContext()
        const analyser = audioContext.createAnalyser()
        const microphone = audioContext.createMediaStreamSource(stream)
        const audioDatas = []

        analyser.fftSize = 1024
        analyser.smoothingTimeConstant = 0.0

        microphone.connect(analyser)

        return new Promise((resolve) => {
          const timer = setInterval(() => {
            const audioData = new Uint8Array(analyser.frequencyBinCount)
            analyser.getByteFrequencyData(audioData)

            const upperFrequency = 6000
            const stepSize = (audioContext.sampleRate / 2) / analyser.frequencyBinCount
            const upperBound = Math.min(Math.floor(upperFrequency / stepSize), analyser.frequencyBinCount)
            const data = audioData.slice(0, upperBound)

            audioDatas.push(data)
            const mean = getMean(data)
            const stdev = getStd(data)
            audioDatas.push(mean)
            audioDatas.push(stdev)

            const camera = document.getElementById('camera')
            const rotationVec = camera.getAttribute('rotation')
            const rotation = [rotationVec.y, rotationVec.x]
            if (Math.abs(rotation[0]) > 90 || Math.abs(rotation[1]) > 90) {
              stream.getTracks().forEach((track) => {
                track.stop()
              })
              audioContext.close()
              clearInterval(timer)
              resolve(1)
            }
          }, 100)
        })
          .then((_) => {
            const formattedData = formatBlowingData(audioDatas)
            saveResults(formattedData, 'blowing.txt')
          })
      } else {
        console.log('er is geen audio gedetecteerd')
      }
    },
    handleGeneral () {
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

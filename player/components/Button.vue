<template>
  <a-entity
    :class="`vidcontrols${clickable ? ' clickable' : ''}`"
    :text="text === undefined ? `align: center; width: 2; color: ${textColor}; value: ${parsedText}` : text"
    :geometry="`primitive: plane; height: ${0.3 + parsedText.split('\n').length * 0.1}; width: ${buttonWidth}`"
    :material="material === undefined ? 'color: ' + backgroundColor : material"
    :position="cartesianPosition"
    button-handler
    @click="$emit('click')"
  />
</template>

<script>
export default {
  props: {
    row: {
      type: Number,
      required: true
    },
    of: {
      type: Number,
      required: true
    },
    clickable: {
      type: Boolean,
      default: true
    },
    textValue: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: undefined
    },
    backgroundColor: {
      type: String,
      default: '#4d4d4d'
    },
    material: {
      type: String,
      default: undefined
    },
    textColor: {
      type: String,
      default: 'white'
    },
    sliceText: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    buttonWidth () {
      return this.parsedText.length > 14 ? Math.min((this.parsedText.length) / 16, 2.2).toFixed(1) : '1.3'
    },
    parsedText () {
      // testing for white spaces
      function testWhite (x) {
        const white = new RegExp(/^\s$/)
        return white.test(x.charAt(0))
      };

      // used to wrap the words
      function wordWrap (str, maxWidth) {
        const newLineStr = '\n'
        let res = ''

        while (str.length > maxWidth) {
          let found = false
          // Inserts new line at first whitespace of the line
          for (let i = maxWidth - 1; i >= 0; i--) {
            if (testWhite(str.charAt(i))) {
              res = res + [str.slice(0, i), newLineStr].join('')
              str = str.slice(i + 1)
              found = true
              break
            }
          }

          // Inserts new line at maxWidth position, the word is too long to wrap
          if (!found) {
            res += [str.slice(0, maxWidth), newLineStr].join('')
            str = str.slice(maxWidth)
          }
        }
        return res + str
      }

      return wordWrap(this.textValue, 50)
    },
    cartesianPosition () {
      const offset = (0.4 + this.parsedText.split('\n').length * 0.1)
      return `0 ${1.2 + (this.of % 2 === 0 ? 0.2 : 0) + // Even numbers are located slightly higher
                      (Math.ceil(this.of / 2) * offset) - // Add half the amount of questions to offset up
                      (this.row - 1) * offset} -2.5` // Subtract the n-th position to get the proper location
    }
  }
}
</script>

<template>
  <a-entity>
    <a-videosphere rotation="0 -90 0" ref="videosphere" :src="src" @loaded="loaded" />
  </a-entity>
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      required: true
    },
    autoplay: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    video () {
      if (!this.src.startsWith('#')) {
        throw new Error('Absolute source is not supported by videosphere, use relative source with identifier and # instead')
      }
      // As the src is a filename, be sure to escape dots to prevent class lookup
      return document.querySelector(this.src.replace(/\./g, '\\.'))
    }
  },
  watch: {
    src () {
      if (this.autoplay) {
        this.play()
      }
    }
  },
  methods: {
    loaded () {
      if (this.autoplay) {
        this.play()
      }
    },
    play () {
      const video = this.video
      video.play()
    },
    pause () {
      const video = this.video
      video.pause()
    },
    reset () {
      const video = this.video
      video.currentTime = 0
      this.pause()
    }
  }
}
</script>

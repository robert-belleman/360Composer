<template>
  <div />
</template>

<script>
export default {
  beforeMount () {
    // Adds a global event listener that plays and pauses the video that is globally in scope
    if (this.$aframe.components['active-video'] === undefined) {
      this.$aframe.registerComponent('active-video', {
        init () {
          this.play = this.play.bind(this)
          this.pause = this.pause.bind(this)

          window.addEventListener('play', this.play)
          window.addEventListener('pause', this.pause)
        },
        play () {
          const video = this.el.components.material.material.map.image
          if (!video) {
            return
          }
          video.play()
        },
        pause () {
          const video = this.el.components.material.material.map.image
          if (!video) {
            return
          }
          video.pause()
        }
      })
    }
  }
}
</script>

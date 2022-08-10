<template>
  <!-- Play on window click -->
  <div />
</template>

<script>
export default {
  beforeMount () {
    if (this.$aframe.components['play-on-window-click'] === undefined) {
      this.$aframe.registerComponent('play-on-window-click', {
        init () {
          this.onClick = this.onClick.bind(this)
        },
        play () {
          window.addEventListener('click', this.onClick)
        },
        pause () {
          window.removeEventListener('click', this.onClick)
        },
        onClick (evt) {
          const video = this.el.components.material.material.map.image
          if (!video) {
            return
          }

          video.play()
          const player = document.querySelector('a-videosphere')
          player.removeAttribute('play-on-window-click')
        }
      })
    }
  }
}
</script>

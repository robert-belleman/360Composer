<template>
  <!-- Arrow key rotation -->
  <div />
</template>

<script>
export default {
  beforeMount () {
    if (this.$aframe.components['arrow-key-rotation'] === undefined) {
      this.$aframe.registerComponent('arrow-key-rotation', {
        schema: {
          enabled: { default: true },
          dx: { default: 2.0 },
          dy: { default: 2.0 }
        },
        init () {
          this.onKeyDown = this.onKeyDown.bind(this)
          this.onKeyUp = this.onKeyUp.bind(this)
          this.directionX = 0
          this.directionY = 0
        },
        play () {
          window.addEventListener('keydown', this.onKeyDown)
          window.addEventListener('keyup', this.onKeyUp)
        },
        pause () {
          window.removeEventListener('keydown', this.onKeyDown)
          window.removeEventListener('keyup', this.onKeyUp)
        },
        onKeyDown (evt) {
          switch (evt.keyCode) {
            case 37: this.directionX = 1; break
            case 38: this.directionY = 1; break
            case 39: this.directionX = -1; break
            case 40: this.directionY = -1; break
          }
        },
        onKeyUp (evt) {
          switch (evt.keyCode) {
            case 37: this.directionX = 0; break
            case 38: this.directionY = 0; break
            case 39: this.directionX = 0; break
            case 40: this.directionY = 0; break
          }
        },
        tick (t, dt) {
          if (!this.data.enabled) { return }
          const rotation = this.el.getAttribute('rotation')
          if (!rotation) { return }
          if (this.directionX || this.directionY) {
            rotation.x += this.data.dx * this.directionY
            rotation.y += this.data.dy * this.directionX
            this.el.setAttribute('rotation', rotation)
          }
        }
      })
    }
  }
}
</script>

<template>
  <div />
</template>

<script>
export default {
  beforeMount () {
    if (this.$aframe.components['auto-enter-vr'] === undefined) {
      this.$aframe.registerComponent('auto-enter-vr', {
        init () {
          this.el.sceneEl.enterVR()
        }
      })
    }
  }
}
</script>

<template>
  <!-- Cursor enter -->
  <div />
</template>

<script>
export default {
  beforeMount () {
    if (this.$aframe.components['cursor-enter'] === undefined) {
      this.$aframe.registerComponent('cursor-enter', {
        init () {
          this.el.addEventListener('mouseenter', function () {
            this.setAttribute('position', '0 0 -0.6')
          })
        }
      })
    }
  }
}
</script>

<template>
  <!-- Cursor leave -->
  <div />
</template>

<script>
export default {
  beforeMount () {
    if (this.$aframe.components['cursor-leave'] === undefined) {
      this.$aframe.registerComponent('cursor-leave', {
        init () {
          this.el.addEventListener('mouseleave', function () {
            this.setAttribute('position', '0 0 -1')
          })
        }
      })
    }
  }
}
</script>

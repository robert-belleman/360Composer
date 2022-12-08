<template>
  <!-- World -->
  <a-entity rotation="0 0 0" arrow-key-rotation>
    <a-camera id="camera" user-height="0" wasd-controls-enabled="false" stereocam="eye:left;">
      <a-entity
        id="cursor"
        cursor-enter
        cursor-leave
        :cursor="`fuse: true; fuseTimeout: ${fuseTimeout}`"
        position="0 0 -1"
        geometry="primitive: ring; radiusInner: 0.01; radiusOuter: 0.02"
        material="color: white; shader: flat"
        raycaster="objects: .clickable"
        animation__click="property: scale; startEvents: click; easing: easeInCubic; dur: 150; from: 2 2 2; to: 1 1 1"
        :animation__fusing="`property: scale; startEvents: fusing; easing: easeInCubic; dur: ${fuseTimeout}; from: 1 1 1; to: 2 2 2`"
        animation__mouseleave="property: scale; startEvents: mouseleave; easing: easeInCubic; dur: 500; to: 1 1 1"
      />
    </a-camera>
  </a-entity>
</template>

<script>
export default {
  computed: {
    fuseTimeout () {
      return process.env.gazeTime
    }
  }
}
</script>

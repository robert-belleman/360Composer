import Vue from 'vue'

// Ignore all the aframe elements to suppress warnings
Vue.config.ignoredElements = [
  'a-camera',
  'a-assets',
  'a-scene',
  'a-entity',
  'a-box',
  'a-camera',
  'a-circle',
  'a-cone',
  'a-cursor',
  'a-curvedimage',
  'a-cylinder',
  'a-dodecahedron',
  'a-gltf-model',
  'a-icosahedron',
  'a-image',
  'a-light',
  'a-link',
  'a-obj-model',
  'a-octahedron',
  'a-plane',
  'a-ring',
  'a-sky',
  'a-sound',
  'a-sphere',
  'a-tetrahedron',
  'a-text',
  'a-torus-knot',
  'a-torus',
  'a-triangle',
  'a-video',
  'a-videosphere',
  'a-animation'
]

// Make the aframe component available through this.$aframe
Vue.prototype.$aframe = window.AFRAME

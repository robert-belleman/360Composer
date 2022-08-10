<template>
  <a-entity>
    <template v-if="!ended">
      <Videosphere ref="sphere" :src="`#video-${filename}`" :autoplay="true" />
      <Annotation
        v-if="activeAnnotation !== undefined"
        :annotation="activeAnnotation"
        @switch-segment="switchSegment"
        @continue="continueSegment"
      />
    </template>
  </a-entity>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'
import Annotation from './Annotation'
import Videosphere from './Videosphere'

export default {
  components: {
    Annotation,
    Videosphere
  },
  props: {
    segment: {
      type: Object,
      required: true
    },
    pushAnalytics: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      tick: 0,
      activeAnnotation: undefined,
      ended: false
    }
  },
  computed: {
    filename () {
      return this.segment.video
    },
    annotations () {
      return this.segment.annotations.map((annotation) => {
        return {
          annotation,
          timestamp: annotation.timestamp / 1000000, // Timestamp in seconds
          reached: false
        }
      }).sort((a, b) => a.timestamp - b.timestamp)
    }
  },
  watch: {
    filename: {
      immediate: true,
      handler (newVal) {
        this.setVideoFile(newVal)
      }
    },
    activeAnnotation: {
      immediate: true,
      handler (value) {
        if (value !== undefined && this.pushAnalytics) {
          this.pushPresent({ annotation: value.annotation, annotationTimestamp: value.timestamp })
        }
      }
    },
    ended: {
      immediate: true,
      handler (end) {
        if (end) {
          this.$emit('finished')
        }
      }
    }
  },
  methods: {
    reset () {
      this.tick = 0
      this.$refs.sphere.reset()

      // In case the annotation options refers to this segment
      this.resetAnnotations()
      this.ended = false
    },
    pause () {
      this.$refs.sphere.pause()
    },
    play () {
      this.$refs.sphere.play()
    },
    continueSegment () {
      this.activeAnnotation = undefined
      this.play()
    },
    switchSegment (id) {
      this.activeAnnotation = undefined
      this.$emit('switch-segment', id)
    },
    handleEnded () {
      this.ended = true
    },
    handleTimeUpdate () {
      const currentTime = Math.ceil(this.$refs.sphere.video.currentTime)
      const annotationToShow = this.annotations.find(annotation => !annotation.reached && annotation.timestamp <= currentTime)

      // If we found an annotation to show, pause the video and show the annotation
      if (annotationToShow !== undefined) {
        this.pause()
        annotationToShow.reached = true
        this.activeAnnotation = annotationToShow.annotation
      }
    },
    resetAnnotations () {
      this.annotations.forEach((annotation) => {
        annotation.reached = false
      })
    },
    ...mapMutations({
      setVideoFile: 'setVideoFileName'
    }),
    ...mapActions({
      pushPresent: 'pushAnnotationPresentEvent'
    })
  }
}
</script>

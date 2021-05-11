<template>
  <a-entity>
    <Segment
      v-if="!ended && activeSegment !== undefined && activeSegment !== null"
      ref="segment"
      :segment="activeSegment"
      @switch-segment="switchSegment"
      @finished="finished"
    />

    <ScenarioFinishedMenu v-else @click="$emit('switch-scenario')" />
  </a-entity>
</template>

<script>
import { mapActions } from 'vuex'
import Segment from './Segment'
import ScenarioFinishedMenu from './ScenarioFinishedMenu'

export default {
  components: {
    Segment,
    ScenarioFinishedMenu
  },
  props: {
    scenario: {
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
      activeSegment: 'segments' in this.$props.scenario && this.$props.scenario.segments.length > 0 ? this.findStart() : undefined,
      ended: false
    }
  },
  watch: {
    scenario: {
      immediate: true,
      handler (scenario, oldScenario) {
        if (oldScenario === undefined) {
          return
        }

        this.activeSegment = 'segments' in scenario && scenario.segments.length > 0 ? this.findStart() : undefined
        this.ended = false
        this.startNext()
      }
    },
    activeSegment: {
      immediate: true,
      handler (scene) {
        this.$store.commit('setActiveScene', scene === undefined ? undefined : scene.uuid)

        if (scene !== undefined && this.pushAnalytics) {
          this.pushStartScene()
        }
      }
    }
  },
  methods: {
    findStart () {
      const startID = this.$props.scenario.start_scene
      return this.$props.scenario.segments.filter(segment => segment.uuid === startID)[0]
    },
    findNext (id) {
      return this.$props.scenario.segments.filter(segment => segment.uuid === id)[0]
    },
    switchSegment (id) {
      if (id !== null) {
        const video = this.activeSegment.video

        this.$refs.segment.reset()

        // If this option refers back to the active segment, manually play it as the autoplay won't detect this
        if (this.activeSegment.id === id) {
          this.$refs.segment.play()
        }

        this.activeSegment = this.findNext(id)

        // if the next video is the same as the current, we need to manually start the video
        if (video === this.activeSegment.video) {
          this.$refs.segment.play()
        }

        if (this.pushAnalytics) {
          this.pushFinishScene()
        }
      } else {
        // If the id is empty, continue playing
        this.$refs.segment.play()
      }
    },
    finished () {
      this.ended = true
      this.activeSegment = undefined

      if (this.pushAnalytics) {
        this.pushFinishScene()
      }
    },
    handleTimeUpdate () {
      if (this.activeSegment !== undefined) {
        this.$refs.segment.handleTimeUpdate()
      }
    },
    handleEnded () {
      if (this.activeSegment !== undefined) {
        this.$refs.segment.handleEnded()
      }
    },
    startNext () {
      if (this.$refs.segment !== undefined) {
        this.$refs.segment.reset()
        this.$refs.segment.play()
      }
    },
    ...mapActions({
      pushStartScene: 'pushStartVideoEvent',
      pushFinishScene: 'pushFinishVideoEvent'
    })
  }
}
</script>

<template>
  <p v-if="$fetchState.pending">
    Loading ...
  </p>
  <p v-else-if="$fetchState.error">
    Error fetching product: {{ $fetchState.error.message }}
  </p>
  <a-scene v-else auto-enter-vr>
    <!-- Register components so that they can be used later -->
    <ArrowKeyRotationComponent />
    <CursorEnterComponent />
    <CursorLeaveComponent />
    <PlayOnWindowClickComponent />
    <ActiveVideoComponent />
    <AutoEnterVRComponent />

    <World />

    <a-assets>
      <img id="background" src="/player/background.jpg" alt="Clouds Background">
      <video
        v-for="(video, i) in uniqueVideos"
        :id="`video-${video.id}`"
        :key="i"
        :ref="'videos'"
        crossorigin="anonymous"
        playsinline
        webkit-playsinline
        :src="`/asset/${video.path}`"
        @timeupdate="handleTimeUpdate"
        @ended="handleEnded"
      />
    </a-assets>

    <a-sky radius="6000" src="#background" />

    <!-- Main menu -->
    <MainMenu v-if="!pressedStart" @click="pressStart" />

    <Scenario
      v-else-if="pressedStart && activeScenario !== null"
      ref="scenario"
      :scenario="activeScenario"
      @switch-scenario="switchScenario"
      @finished="finished"
    />

    <FinishedMenu v-else @click="finished" />
  </a-scene>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'
import PlayOnWindowClickComponent from './PlayOnWindowClickComponent'
import ArrowKeyRotationComponent from './ArrowKeyRotationComponent'
import CursorEnterComponent from './CursorEnterComponent'
import CursorLeaveComponent from './CursorLeaveComponent'
import AutoEnterVRComponent from './AutoEnterVRComponent'
import FinishedMenu from './FinishedMenu'
import World from './World'
import Scenario from './Scenario'
import ActiveVideoComponent from './ActiveVideoComponent'
import MainMenu from './MainMenu'

export default {
  components: {
    ArrowKeyRotationComponent,
    CursorEnterComponent,
    CursorLeaveComponent,
    PlayOnWindowClickComponent,
    AutoEnterVRComponent,
    World,
    Scenario,
    ActiveVideoComponent,
    MainMenu,
    FinishedMenu
  },
  props: {
    product: {
      type: Object,
      required: true
    },
    pushAnalytics: {
      type: Boolean,
      default: true
    }
  },
  async fetch () {
    this.fetchedVideos = await Promise.all(this.videos.map(video => this.$axios.get(`/api/asset/${video}`)))
      .then(res => res.map(obj => obj.data))
  },
  data () {
    return {
      activeScenario: 'scenarios' in this.product && this.product.scenarios.length > 0 ? this.findStartScenario() : null,
      pressedStart: false
    }
  },
  computed: {
    videos () {
      return this.product.scenarios.map(scenario => scenario.segments.map(segment => segment.video)).flat()
    },
    uniqueVideos () {
      const filenames = []
      const videos = []

      this.fetchedVideos.forEach((video) => {
        if (video !== null && !filenames.includes(video.id)) {
          filenames.push(video.id)
          videos.push(video)
        }
      })

      return videos
    }
  },
  watch: {
    activeScenario: {
      immediate: true,
      handler (scenario) {
        this.$store.commit('setActiveScenario', scenario === undefined || scenario === null ? undefined : scenario.uuid)
      }
    }
  },
  methods: {
    switchScenario () {
      if (this.pushAnalytics) {
        this.pushScenarioEnd()
      }

      if (this.activeScenario.next_scenario !== null) {
        this.activeScenario = this.findNextScenario(this.activeScenario.next_scenario)
        this.pressedStart = true

        if (this.pushAnalytics) {
          this.pushScenarioStart()
        }
      } else {
        this.activeScenario = null
      }
    },
    finished () {
      this.pressedStart = false
      this.activeScenario = null

      if (this.pushAnalytics) {
        this.pushFinish()
      }
    },
    findStartScenario () {
      const startID = this.product.start
      return this.product.scenarios.filter(scenario => scenario.uuid === startID)[0]
    },
    findNextScenario (id) {
      return this.product.scenarios.filter(scenario => scenario.uuid === id)[0]
    },
    pressStart () {
      if (this.pushAnalytics) {
        this.pushScenarioStart()
      }

      this.pressedStart = true

      if (!this.activeScenario) {
        this.activeScenario = 'scenarios' in this.product && this.product.scenarios.length > 0 ? this.findStartScenario() : null
      }
    },
    handleTimeUpdate () {
      if (this.activeScenario !== undefined || this.activeScenario !== null) {
        this.$refs.scenario.handleTimeUpdate()
      }
    },
    handleEnded () {
      if (this.activeScenario !== undefined || this.activeScenario !== null) {
        this.$refs.scenario.handleEnded()
      }
    },
    ...mapActions({
      pushScenarioStart: 'pushStartScenarioEvent',
      pushScenarioEnd: 'pushFinishScenarioEvent',
      pushFinish: 'pushEndTimeline'
    }),
    ...mapMutations({
      setVideoName: 'setVideoFileName'
    })
  }
}
</script>

<template>
  <div>
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">

    <Aframe v-if="pressedStart" :product="product" @finished="finish" />
    <b-jumbotron v-else>
      <template v-slot:header>
        <img class="logo" src="/player/logo.png">
      </template>

      <template v-slot:lead>
        <p><b>PCIT-VR</b> | Online PCIT oefenen</p>
      </template>

      <template>
        <p>Welkom, het lijkt erop dat u bij ons nog niet bekend bent. Voer uw inlogcode in en klik op "Start" om te beginnen met deze trainingssessie</p>
        <b-form inline @submit.prevent="start">
          <b-form-input v-model="name" placeholder="Inlogcode" class="mr-2 mb-2 mb-sm-0" />
          <b-button variant="primary" :disabled="!name" @click="start">
            Start
          </b-button>
        </b-form>
      </template>
    </b-jumbotron>
  </div>
</template>

<style>
  .jumbotron {
    height: 100vh;
  }
  .footer {
    margin-bottom: 0;
  }
  .logo {
    max-width: 100%;
  }
</style>

<script>
import { mapMutations, mapActions } from 'vuex'
import Aframe from '../../../components/Aframe'

export default {
  components: {
    Aframe
  },
  data () {
    return {
      name: '',
      pressedStart: false,
      pushAnalytics: true,
      product: {}
    }
  },
  computed: {
    storeName () {
      return this.$store.state.name
    }
  },
  watch: {
    product () {
      if (this.product !== undefined) {
        this.$store.commit('setProduct', this.product.uuid)
      }
    }
  },
  mounted () {
    if (localStorage.name) {
      this.$store.commit('setName', localStorage.name)
    }
  },
  methods: {
    pressStart () {
      this.pressedStart = true
    },
    logIn () {
      const id = this.$route.params.user
      const name = this.name

      return this.$axios.$post('/api/user/customer-login', { id, access_code: name })
        .then(_ => this.setUserID(id))
    },
    deleteCustomerOption () {
      this.$axios.$post(`/api/customer/${this.$route.params.user}/options/chosen/delete`)
    },
    deleteCustomerAnnotation () {
      this.$axios.$post(`/api/customer/${this.$route.params.user}/options/delete`)
    },
    async getAudioStream () {
      // const audioStream = null
      await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then((stream) => { window.stream = stream })
        .catch(_ => console.log('Er is geen toestemming gegeven om de microfoon te gebruiken.'))
      // console.log('dit is de stream in index.vue', audioStream)
      // sessionStorage.setItem('audioStream', JSON.stringify(audioStream))
      // if (audioStream) {}
      // window.stream = audioStream
      // console.log('dit is de stream in index.vue: ', window.stream)
      // return window.stream
    },
    setTimelineID (id) {
      this.$store.commit('setActiveTimeline', id)
    },
    async retrieveExport () {
      this.product = await this.$axios.$get(`/api/timeline/${this.$route.params.uuid}/export`)
        .catch((e) => {
          throw new Error('Product not found')
        })
        .then(res => res[0])
        .then((ex) => {
          this.setTimelineID(ex.uuid)
          return ex
        })
    },
    start () {
      if (!this.storeName && !this.name) {
        return
      }

      if (!this.storeName) {
        this.$store.commit('setName', this.name)
        localStorage.name = this.storeName
      }

      this.$axios.defaults.withCredentials = true

      this.logIn()
        .then(this.retrieveExport)
        .then(this.getAudioStream)
        .then(this.deleteCustomerOption)
        .then(this.deleteCustomerAnnotation)
        .then(this.pressStart)
        .then(this.pushStartEvent)
    },
    finish () {
      this.pressedStart = false
    },
    pushStartEvent () {
      if (this.pushAnalytics) {
        this.pushStart()
      }
    },
    ...mapActions({
      pushStart: 'pushStartTimeline'
    }),
    ...mapMutations({
      setUserID: 'setUserID'
    })
  },
  validate ({ params }) {
    return /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i.test(params.uuid)
  }
}
</script>

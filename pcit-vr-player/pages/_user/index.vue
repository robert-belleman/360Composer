<template>
  <div>
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">

    <b-jumbotron v-if="loggedIn">
      <template v-slot:header>
        <img class="logo" src="/player/logo.png">
      </template>

      <template v-slot:lead>
        <p><b>PCIT-VR</b> | Online PCIT oefenen</p>
      </template>

      <template>
        <p>Dit is de pagina waarop de toezichthouder van de gebruiker die een tijdlijn afspeelt invoer kan geven.</p>
      </template>

      <!--
      <template>
        <p>Druk op de volgende knop om de speler te stoppen:</p>
        <button @click="stopPlayer()"></button>
      </template>
      -->

      <template v-if="options">
        <p>Druk op een van de volgende knoppen om aan te geven welke invoer de gebruiker heeft gegeven, dan wordt de corresponderende scène afgespeeld:</p>
        <button
          v-for="(option, i) in options"
          :key="i"
          @click="selectOption(option)"
        >
          {{ option.option }}
        </button>
      </template>

      <template v-else>
        <p>Aan het wachten tot de gebruiker bij een annotatie met type "anders" aankomt...</p>
        <template>
          {{ getOptions() }}
        </template>
      </template>
    </b-jumbotron>

    <b-jumbotron v-else>
      <template v-slot:header>
        <img class="logo" src="/player/logo.png">
      </template>

      <template v-slot:lead>
        <p><b>PCIT-VR</b> | Online PCIT oefenen</p>
      </template>

      <template>
        <p>Dit is de inlogpagina voor de toezichthouder van de gebruiker die een tijdlijn afspeelt.</p>
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
// import logIn from '../_uuid/_user/index'
// import Button from '../../components/Button'

export default {
  data () {
    return {
      name: '',
      loggedIn: false,
      options: null
    }
  },
  computed: {
    storeName () {
      return this.$store.state.name
    }
  },
  methods: {
    logIn () {
      const id = this.$route.params.user
      const name = this.name

      return this.$axios.$post('/api/user/customer-login', { id, access_code: name })
        .then(this.loggedIn = true)
    },
    start () {
      if (!this.name) {
        return
      }

      this.$axios.defaults.withCredentials = true

      this.logIn()
    },
    getOptions () {
      const timer = setInterval(() => {
        this.$axios.$get(`/api/customer/${this.$route.params.user}/options`)
          .catch()
          .then((options) => {
            clearInterval(timer)
            this.options = options
          })
      }, 1000)
    },
    selectOption (option) {
      this.$axios.$post(`/api/customer/${this.$route.params.user}/options/chosen`, { chosen: option })
        .then((_) => {
          this.options = null
        })
    }
  },
  validate ({ params }) {
    return /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/
  }
}
</script>

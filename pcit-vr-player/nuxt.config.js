import {getEnv} from "bootstrap-vue/esm/utils/env";
require('dotenv').config()

import path from 'path'
import fs from 'fs'

export default {
  mode: 'spa',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      {
        src: 'https://aframe.io/releases/1.0.4/aframe.min.js',
        type: 'text/javascript'
      }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
  ],
  router: {
    base: '/player/'
  },
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    {
      src: '~/plugins/aframe.js',
      mode: 'client'
    },
    {
      src: '~/plugins/axios.js',
      mode: 'client'
    },
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://bootstrap-vue.js.org
    'bootstrap-vue/nuxt',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
    '@nuxtjs/proxy'
  ],
  /*
  ** Build configuration
  */
  build: {
    publicPath: '/player/_nuxt/'
  },
  server: {
    // host: '0', // Deze line zorgt ervoor dat de server luistert op het IP adres.
    port: 3001,
    // https: {
    //   key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
    //   cert: fs.readFileSync(path.resolve(__dirname, 'server.crt'))
    // }
  },
  axios: {
    proxy: true,
    browserBaseUrl: process.env.API_URL_BROWSER !== undefined ? process.env.API_URL_BROWSER : 'http://localhost:5000' // Gebruik deze voor lokaal op zelfde device
    // browserBaseUrl: process.env.API_URL_BROWSER !== undefined ? process.env.API_URL_BROWSER : 'https://10.0.0.148:5000' // Gebruik deze om via ander apparaat te runnen
  },
  proxy: {
    '/api/': {
      target: 'http://localhost:5000/'
    },
    '/asset/': {
      target: 'http://localhost'
    }
  },
  env: {
    gazeTime: 4000
  }
}

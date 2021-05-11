export const state = () => ({
  name: undefined,
  product: undefined,
  activeVideoFileName: undefined,
  userID: undefined,
  activeTimeline: '',
  activeScenario: '',
  activeScene: ''
})

export const mutations = {
  setName (state, name) {
    state.name = name
  },
  setProduct (state, product) {
    state.product = product
  },
  setVideoFileName (state, fileName) {
    state.activeVideoFileName = fileName
  },
  setUserID (state, id) {
    state.userID = id
  },
  setActiveTimeline (state, id) {
    state.activeTimeline = id
  },
  setActiveScenario (state, id) {
    state.activeScenario = id
  },
  setActiveScene (state, id) {
    state.activeScene = id
  }
}

export const actions = {
  pushEvent (context, { customerID, category, action, label, value, scenarioID, sceneID, timelineID }) {
    const now = new Date()
    const timestamp = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDay()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`

    return new Promise((resolve, reject) => {
      this.$axios.$post('/api/analytics/legacy', {
        timestamp,
        customerID,
        category,
        action,
        label,
        value,
        timelineID: timelineID === null || timelineID === undefined ? '' : timelineID,
        scenarioID: scenarioID === null || scenarioID === undefined ? '' : scenarioID,
        sceneID: sceneID === null || sceneID === undefined ? '' : sceneID
      })
        .then(resolve)
        .catch(reject)
    })
  },
  pushAnnotationClickEvent ({ dispatch, state }, { annotation, option }) {
    return new Promise((resolve, reject) => {
      dispatch('pushEvent', {
        customerID: state.userID,
        category: 'annotations',
        action: 'click',
        label: annotation,
        value: option,
        timelineID: state.activeTimeline,
        scenarioID: state.activeScenario,
        sceneID: state.activeScene
      })
        .then(resolve)
        .catch(reject)
    })
  },
  pushStartVideoEvent ({ dispatch, state }) {
    return new Promise((resolve, reject) => {
      dispatch('pushEvent', {
        customerID: state.userID,
        category: 'scene',
        action: 'start',
        label: '',
        value: '',
        timelineID: state.activeTimeline,
        scenarioID: state.activeScenario,
        sceneID: state.activeScene
      })
    })
  },
  pushFinishVideoEvent ({ dispatch, state }) {
    return new Promise((resolve, reject) => {
      dispatch('pushEvent', {
        customerID: state.userID,
        category: 'scene',
        action: 'end',
        label: '',
        value: '',
        timelineID: state.activeTimeline,
        scenarioID: state.activeScenario,
        sceneID: state.activeScene
      })
    })
  },
  pushStartScenarioEvent ({ dispatch, state }) {
    return new Promise((resolve, reject) => {
      dispatch('pushEvent', {
        customerID: state.userID,
        category: 'scenario',
        action: 'start',
        label: '',
        value: '',
        timelineID: state.activeTimeline,
        scenarioID: state.activeScenario,
        sceneID: ''
      })
    })
  },
  pushFinishScenarioEvent ({ dispatch, state }) {
    return new Promise((resolve, reject) => {
      dispatch('pushEvent', {
        customerID: state.userID,
        category: 'scenario',
        action: 'end',
        label: '',
        value: '',
        timelineID: state.activeTimeline,
        scenarioID: state.activeScenario,
        sceneID: ''
      })
    })
  },
  pushAnnotationPresentEvent ({ dispatch, state }, { annotation, annotationTimestamp }) {
    return new Promise((resolve, reject) => {
      dispatch('pushEvent', {
        customerID: state.userID,
        category: 'annotations',
        action: 'present',
        label: annotation,
        value: '',
        timelineID: state.activeTimeline,
        scenarioID: state.activeScenario,
        sceneID: state.activeScene
      })
    })
  },
  pushStartTimeline ({ dispatch, state }) {
    return new Promise((resolve, reject) => {
      dispatch('pushEvent', {
        customerID: state.userID,
        category: 'timeline',
        action: 'start',
        label: '',
        value: '',
        timelineID: state.activeTimeline,
        scenarioID: '',
        sceneID: ''
      })
    })
  },
  pushEndTimeline ({ dispatch, state }) {
    return new Promise((resolve, reject) => {
      dispatch('pushEvent', {
        customerID: state.userID,
        category: 'timeline',
        action: 'end',
        label: '',
        value: '',
        timelineID: state.activeTimeline,
        scenarioID: '',
        sceneID: ''
      })
    })
  }
}

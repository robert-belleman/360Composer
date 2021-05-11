export default function ({ $axios }) {
  const refreshToken = () => $axios.post('/api/token/refresh')

  let prevURL = null

  $axios.onError(async (error) => {
    const retry_ = () => new Promise((resolve, reject) => {
      $axios.request(error.config)
        .then(resp => resolve(resp))
        .catch(e => reject(e))
    })

    // Ignore any non 401 errors
    if (error.response.status !== 401) {
      return Promise.reject(error)
    }

    // check if we tried to refresh the token, log out if we did
    if (error.config.url === '/api/token/refresh') {
      return Promise.reject(new Error('Error while refreshing token'))
    }

    /* prevent interceptor from looping. */
    if (error.config.url === prevURL) {
      prevURL = null
      return Promise.reject(error)
    }

    prevURL = error.config.url

    try {
      await refreshToken()

      const res = await retry_()
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  })
}

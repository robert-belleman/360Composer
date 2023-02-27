const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );

  // bit hacky but it works
  app.use(
    '/asset/*.mp4',
    createProxyMiddleware({
      target: 'http://localhost:5000/api',
      changeOrigin: true,
    })
  );

  // // bit hacky but it works
  // app.use(
  //   '/asset/*.mp4',
  //   createProxyMiddleware({
  //     target: 'http://localhost',
  //     changeOrigin: true,
  //   })
  // );

  app.use(
    '/asset/*.glb',
    createProxyMiddleware({
      target: 'http://localhost',
      changeOrigin: true,
    })
  );
};

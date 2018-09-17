const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const proxy = require('http-proxy-middleware');
const convert = require('koa-connect');
const Router = require('koa-router');

const router = new Router();

const proxyOptions = {
  target: 'https://www.ovh.com',
  endpoints: ['/engine', '/auth'],
  changeOrigin: true,
  // ... see: https://github.com/chimurai/http-proxy-middleware#options
};

const sso = require('./server/sso');

// Add endpoint for AUTH
router.all('/auth', sso.auth);
router.all('/auth/check', sso.checkAuth);

router.all('*', convert(proxy(proxyOptions)));

module.exports = {
  mode: 'development',
  plugins: [
    new DuplicatePackageCheckerPlugin(),
    new FriendlyErrorsWebpackPlugin(),
  ],
  serve: {
    logLevel: 'silent',
    devMiddleware: {
      logLevel: 'silent',
    },
    hotClient: {
      logLevel: 'silent',
    },
    content: [__dirname],
    add: (app, middleware) => {
      // since we're manipulating the order of middleware added, we need to handle
      // adding these two internal middleware functions.
      middleware.webpack().then(() => {
        middleware.content({
          index: 'index.htm',
        });
        // this example assumes router must be added last
        app.use(router.routes());
      });
    },
  },
};

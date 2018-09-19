const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const sso = require('./server/sso');
const serverProxy = require('./server/proxy');

const proxyOptions = {
  target: 'https://www.ovh.com',
  context: ['/engine', '/auth'],
  changeOrigin: true,
  logLevel: 'silent',
};

module.exports = (env) => {
  const devProxy = [proxyOptions];
  if (env.local2API) {
    devProxy.unshift(serverProxy.aapi);
  }
  return {
    mode: 'development',
    plugins: [
      new DuplicatePackageCheckerPlugin(),
      new FriendlyErrorsWebpackPlugin(),
    ],
    devServer: {
      before(app) {
        app.get('/auth', sso.auth);
        app.get('/auth/check', sso.checkAuth);
      },
      clientLogLevel: 'none',
      logLevel: 'silent',
      https: true,
      overlay: true,
      port: 9000,
      proxy: devProxy,
    },
  };
};

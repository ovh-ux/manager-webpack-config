const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const Sso = require('./server/sso');
const serverProxy = require('./server/proxy');

const TARGET = {
  eu: 'https://www.ovh.com',
  ca: 'https://ca.ovh.com',
  us: 'https://us.ovhcloud.com',
};

module.exports = (env) => {
  const region = (env.region || 'eu').toLowerCase();
  const proxyOptions = {
    target: TARGET[region],
    context: ['/engine', '/auth'],
    changeOrigin: true,
    logLevel: 'silent',
  };
  const devProxy = [proxyOptions];
  if (env.local2API) {
    devProxy.unshift(serverProxy.aapi);
  }
  const sso = new Sso(region);
  return {
    mode: 'development',
    plugins: [
      new DuplicatePackageCheckerPlugin(),
      new FriendlyErrorsWebpackPlugin(),
    ],
    devServer: {
      before(app) {
        app.get('/auth', sso.auth.bind(sso));
        app.get('/auth/check', sso.checkAuth.bind(sso));
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

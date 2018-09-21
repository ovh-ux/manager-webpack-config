const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const Sso = require('./server/sso');
const serverProxy = require('./server/proxy');

module.exports = (env) => {
  const region = (env.region || 'eu').toLowerCase();
  const proxy = [serverProxy.dev(region)];
  const sso = new Sso(region);
  if (env.local2API) {
    proxy.unshift(serverProxy.aapi);
  }
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
      proxy,
    },
  };
};

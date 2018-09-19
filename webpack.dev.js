const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const sso = require('./server/sso');

module.exports = {
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
    proxy: [
      {
        target: 'https://www.ovh.com',
        context: ['/engine', '/auth'],
        changeOrigin: true,
        logLevel: 'silent',
      },
    ],
  },
};

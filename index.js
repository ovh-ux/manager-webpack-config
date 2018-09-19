const merge = require('webpack-merge');
const common = require('./webpack.common');
const devConfig = require('./webpack.dev');
const prodConfig = require('./webpack.prod');

module.exports = (opts, env = {}) => {
  const commonConfig = common(opts);
  const config = merge(commonConfig, env.production ? prodConfig : devConfig);

  return {
    commonConfig,
    devConfig,
    prodConfig,
    config,
  };
};

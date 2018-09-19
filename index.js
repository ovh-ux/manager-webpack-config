const merge = require('webpack-merge');
const common = require('./webpack.common');
const devConfig = require('./webpack.dev');
const prodConfig = require('./webpack.prod');

module.exports = (opts) => {
  const commonConfig = common(opts);
  const config = merge(commonConfig, process.env.NODE_ENV !== 'production' ? devConfig : prodConfig);

  return {
    commonConfig,
    devConfig,
    prodConfig,
    config,
  };
};

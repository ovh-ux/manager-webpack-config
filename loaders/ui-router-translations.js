const _ = require('lodash');
const acorn = require('acorn');
const rollupConfig = require('@ovh-ux/component-rollup-config');
const dynamicImport = require('acorn-dynamic-import');

module.exports = function uiRouterTranslationsLoader(source) {
  return rollupConfig.plugins.translationUiRouter({
    subdirectory: 'translations',
  }).transform.bind({
    parse: (code, opts = {}) => acorn.Parser.extend(dynamicImport.default).parse(code, _.merge({
      ecmaVersion: 9,
      sourceType: 'module',
    }, opts)),
  })(source, this.resourcePath).code;
};

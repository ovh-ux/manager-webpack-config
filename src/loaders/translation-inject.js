const { get, merge, pick } = require('lodash');
const { getOptions } = require('loader-utils');
const acorn = require('acorn');
const componentConfig = require('@ovh-ux/component-rollup-config');
const dynamicImport = require('acorn-dynamic-import');

module.exports = function injectTranslationsLoader(source) {
  const options = merge({}, getOptions(this));
  const translationInject = get(componentConfig, 'plugins.translationInject');
  const parser = acorn.Parser.extend(dynamicImport.default);

  return translationInject(pick(options, 'subdirectory')).transform.bind({
    parse: (code, opts = {}) => parser.parse(code, merge({
      ecmaVersion: 9,
      sourceType: 'module',
    }, opts)),
  })(source, this.resourcePath).code;
};

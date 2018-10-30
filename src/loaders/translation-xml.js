const { get, merge } = require('lodash');
const { getOptions } = require('loader-utils');
const componentConfig = require('@ovh-ux/component-rollup-config');

module.exports = function translationsXMLLoader(source) {
  const options = merge({}, getOptions(this));
  const translationXML = get(componentConfig, 'plugins.translationXML');
  return translationXML(options).transform(source, this.resourcePath).code;
};

const rollupConfig = require('@ovh-ux/component-rollup-config');

module.exports = function translationsXMLLOader(source) {
  return rollupConfig.plugins.translationXML().transform(source, this.resourcePath).code;
};

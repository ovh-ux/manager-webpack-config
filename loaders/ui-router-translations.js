const { getOptions } = require('loader-utils');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

/**
 * Dynamic translations loader for ui-router and angular-translate
 */
module.exports = function uiRouterTranslations(source) {
  const options = getOptions(this);

  // extract translations property from ui-router state declaration
  let translations = _.get(source.match(/translations\s*:\s*\[([^\]]+)\]/), 1);

  if (translations) {
    // extract translations paths from array
    translations = translations.split(',').map(x => x.replace(/('|"|\s)/g, '')).filter(x => x);
    // transform each path to absolute path
    translations = translations.map(t => path.join(options.root, t, 'translations'));
    // report a warning for translations path that does not exists
    translations.forEach((t) => {
      if (!fs.existsSync(t)) {
        this.emitError(new Error(`Missing translations directory: '${t}'`));
      }
    });
    // filter translations that does not exists
    translations = translations.filter(t => fs.existsSync(t));
  }

  let result = source;

  if (_.get(translations, 'length') > 0) {
    // craft js resolve code to load translations dynamically
    let jsCode = 'dynamicTranslations($q, $translate, asyncLoader) { const imports = [';
    translations.forEach((translation) => {
      jsCode += ` import(\`${translation}/Messages_\${$translate.use()}.xml\`).then(i => i.default),`;
    });
    jsCode += ']; imports.forEach(p => asyncLoader.addTranslations(p)); return $q.all(imports).then(() => $translate.refresh()); }';

    // if a resolve already exists, prepend the code to inject
    if (/resolve\s*:\s*{/.test(result)) {
      result = result.replace(/resolve\s*:\s*{/, `resolve: {\n${jsCode},`);
    // otherwise add a resolve function along with the code to inject
    } else {
      result = result.replace(/(translations\s*:\s*\[[^\]]+\]\s*,)/, `$1 \nresolve: {\n${jsCode}},`);
    }
  }

  return result;
};

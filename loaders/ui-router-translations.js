const { getOptions } = require('loader-utils');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const injectImports = (source, options) => {
  const errors = [];
  let result = source;

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
        errors.push(new Error(`Missing translations directory: '${t}'`));
      }
    });
    // filter translations that does not exists
    translations = translations.filter(t => fs.existsSync(t));
  }

  if (_.get(translations, 'length') > 0) {
    // craft js resolve code to load translations dynamically
    let jsCode = 'translations($q, $translate, asyncLoader) { const imports = [';
    translations.forEach((translation) => {
      jsCode += ` import(\`${translation}/Messages_\${$translate.use()}.xml\`)
                    .catch(() => import(\`${translation}/Messages_\${$translate.fallbackLanguage()}.xml\`))
                    .then(i => i.default),
                `;
    });
    jsCode += ']; imports.forEach(p => asyncLoader.addTranslations(p)); return $q.all(imports).then(() => $translate.refresh()); }';

    // if a resolve already exists, prepend the code to inject
    if (/resolve\s*:\s*{/.test(result)) {
      result = result.replace(/resolve\s*:\s*{/, `resolve: {\n${jsCode},`);
    // otherwise add a resolve function along with the code to inject
    } else {
      const beforeReplace = result;
      result = result.replace(/(translations\s*:\s*\[[^\]]+\]\s*,)/, `$1 \nresolve: {\n${jsCode}},`);
      if (result === beforeReplace) {
        // handle the case of missing comma at the end of translations declaration
        result = result.replace(/(translations\s*:\s*\[[^\]]+\]\s*)/, `$1, \nresolve: {\n${jsCode}},`);
      }
    }
  }

  return { result, errors };
};

/**
 * Dynamic translations loader for ui-router and angular-translate
 */
module.exports = function uiRouterTranslations(source) {
  const options = getOptions(this);
  const parts = source.split(/\.state\s*\(/);
  let modifiedSource = source;

  _.filter(parts, _.identity).forEach((part) => {
    const { result, errors } = injectImports(part, options);
    errors.forEach(this.emitError);
    if (result !== part) {
      modifiedSource = modifiedSource.replace(part, result);
    }
  });

  return modifiedSource;
};

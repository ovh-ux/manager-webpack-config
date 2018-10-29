
function formatTranslation(object, loader) {
  const result = {};
  object.forEach((elem) => {
    if (elem.hasOwnProperty('id') && elem.hasOwnProperty('text') && !~elem.id.indexOf('>')) { // eslint-disable-line no-prototype-builtins, no-bitwise
      result[elem.id] = elem.text;
    } else {
      loader.emitError(new Error(`Invalid translation xml format: '${loader.resourcePath}'`));
    }
  });
  return result;
}

module.exports = (source) => {
  // translation extraction regex
  const reg = /<translation\s+id="([\w-]+?)"\s*(qtlid="([0-9]+)")?\s*(?:translate="none")?\s*?>((?:.|\n|\r)*?)<\/translation>/gi;

  const obj = [];
  let match;

  while (match = reg.exec(source)) { // eslint-disable-line no-cond-assign
    const elem = {
      id: match[1],
      text: match[4]
        .replace(/&#13;\n/g, ' ') // carriage returns
        .replace(/&#160;/g, ' '), // spaces
    };

    elem.text = elem.text.replace(/\{(\s?\d\s?)\}/g, '{{t$1}}');
    obj.push(elem);
  }

  return `export default ${JSON.stringify(formatTranslation(obj, this))}`;
};

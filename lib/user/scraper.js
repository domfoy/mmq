const _ = require('lodash');
const cheerio = require('cheerio');

function scrapper(html) {
  const $ = cheerio.load(html, {ignoreWhitespace: false});

  const t = $('script').filter((i, el) => {
    const type = _.get(el, 'attribs.type', '');
    const innerText = _.get(el, 'children.0.data', '');

    return type === 'text/javascript' && innerText.includes('window.user');
  });

  return t[0].children[0].data;
}

module.exports = scrapper;

const vm = require('vm');

const fetchHtml = require('./loader');
const scraper = require('./scraper');

module.exports = getUser;

async function getUser() {
  const html = await fetchHtml();
  const userCode = scraper(html);

  const ctx = {window: {}};

  vm.createContext(ctx);
  vm.runInContext(userCode, ctx);

  return ctx.window;
}

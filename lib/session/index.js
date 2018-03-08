const vm = require('vm');

const config = require('config');
const axios = require('axios');

const initSocket = require('../socket');
const {
  getCookies,
  login,
  fetchHtml,
  logout
} = require('./api');
const scraper = require('./scraper');

class Session {
  constructor() {
    this.httpCtx = {
      axios: axios.create({
        baseURL: config.host
      })
    };
  }

  async connect() {
    const user = await getUser(this.httpCtx);

    initSocket(user);

    return this.disconnect.bind(this);
  }

  async disconnect() {
    if (!config.connect) {
      return Promise.resolve();
    }

    return logout(this.httpCtx);
  }
}

async function getUser(httpCtx) {
  if (config.connect) {
    await getCookies(httpCtx);
    await login(httpCtx);
  }

  const html = await fetchHtml(httpCtx);
  const userCode = scraper(html);
  const ctx = { window: {} };

  vm.createContext(ctx);
  vm.runInContext(userCode, ctx);

  return ctx.window.user;
}

module.exports = Session;

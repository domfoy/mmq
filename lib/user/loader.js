const axios = require('axios'),
      config = require('config');

const headers = require('../headers');

const url = config.mmqHomeUrl;


module.exports = fetch;

async function fetch() {
  const {data: page} = await axios.get(url, {
    headers
  });

  return page;
}

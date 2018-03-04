const config = require('config'),
      _ = require('lodash'),
      setCookie = require('set-cookie-parser');

module.exports = {
  getCookies,
  login,
  fetchHtml,
  logout
};

async function getCookies(ctx) {
  const {headers} = await ctx.axios('/');

  ctx.cookies = setCookie(headers['set-cookie']);

  console.log('Cookies added', ctx.cookies);
}

async function login(ctx) {
  const {status, headers} = await ctx.axios.post(
    config.routes.login,
    {
      email: config.user.email,
      password: config.user.password
    }, {
      headers: Object.assign(
        {
          'Content-type': 'application/json',
          accept: 'application/json, text/plain, */*',
          'accept-encoding': 'gzip, deflate, br',
          'accept-language': 'fr-FR, fr; q=0.9, en-US; q=0.8, en; q=0.7',
          'cache-control': 'no-cache',
          'content-type': 'application/json;charset=UTF-8',
          origin: 'https://www.massivemusicquiz.com',
          pragma: 'no-cache',
          referer: 'https://www.massivemusicquiz.com/',
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/62.0.3202.89 Safari/537.36',
          'x-requested-with': 'XMLHttpRequest'
        },
        ctx.cookies && ctx.cookies.length && {
          cookie: serializeCookies(ctx.cookies)
        }
      )
    }
  );

  if (headers['set-cookie']) {
    ctx.cookies = setCookie(headers['set-cookie']);

    console.warn('Cookies re-set', ctx.cookies);
  }


  if (status !== 200) {
    throw new Error('Unable to login');
  }
  console.log('Logged in');
}

async function fetchHtml(ctx) {
  const {data: page} = await ctx.axios.get(
    config.routes.play,
    {
      headers: Object.assign(
        {
          'Content-type': 'application/json'
        },
        ctx.cookies && ctx.cookies.length && {
          cookie: serializeCookies(ctx.cookies)
        }
      )
    }
  );

  console.log('Home page fetched');
  return page;
}

async function logout(ctx) {
  const {status} = await ctx.axios.get(
    config.routes.logout,
    {
      headers: Object.assign(
        {
          'Content-type': 'application/json'
        },
        ctx.cookies && ctx.cookies.length && {
          cookie: serializeCookies(ctx.cookies)
        }
      )
    }
  );

  if (status !== 200) {
    throw new Error('Unable to log out');
  }

  console.log('Logged out');
}

function serializeCookies(cookies) {
  return _.join(_.map(cookies, c => `${c.name}=${c.value}`), '; ');
}

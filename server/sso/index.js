/* eslint-disable no-console */
const base64url = require('base64url');
const cookie = require('cookie');
const proxy = require('request');

const config = {
  ssoAuth: {
    host: 'www.ovh.com',
    baseUrl: 'https://www.ovh.com/cgi-bin/crosslogin.cgi',
    devLoginUrl: 'https://www.ovh.com/auth/requestDevLogin/',
  },
};

// [SSO] authentication
function login(ctx) {
  console.log('[SSO] - crosslogin');

  const { headers } = ctx;
  headers.host = config.ssoAuth.host;

  const location = new Promise((resolve) => {
    proxy.get({
      url: config.ssoAuth.baseUrl + ctx.url,
      headers,
      proxy: config.proxy ? config.proxy.host : '',
      followRedirect: false,
    }, (err, resp) => {
      if (err) {
        console.error('[SSO] - crosslogin - error: ', err);
        return resp.status(500);
      }

      const cookies = resp.headers['set-cookie'];
      let parsedCookie;

      for (let i = cookies.length - 1; i >= 0; i -= 1) {
        parsedCookie = cookie.parse(cookies[i]);

        if (parsedCookie['CA.OVH.SES']) {
          ctx.cookies.set('CA.OVH.SES', parsedCookie['CA.OVH.SES'], { path: '/', httpOnly: true });
        }
        if (parsedCookie.SESSION) {
          ctx.cookies.set('SESSION', parsedCookie.SESSION, { path: '/', httpOnly: true });
        }
        if (parsedCookie.USERID) {
          ctx.cookies.set('USERID', parsedCookie.USERID, { path: '/' });
        }
      }

      console.log('[SSO] - Logged');

      return resolve(resp.headers.location);
    });
  });

  return ctx.redirect(location);
}

async function auth(ctx) {
  const origin = ctx.headers.host;
  const protocol = ctx.protocol || 'http';
  const headers = {
    contentType: 'application/json',
  };
  headers.host = config.ssoAuth.host;

  const redirectionUrl = await new Promise((resolve) => {
    proxy.post({
      url: config.ssoAuth.devLoginUrl,
      proxy: config.proxy ? config.proxy.host : null,
      headers,
      followRedirect: false,
      gzip: true,
      json: {
        callbackUrl: `${protocol}://${origin}/auth/check`,
      },
    }, (err, resp, data) => {
      if (err) {
        return resp.status(500);
      }

      return resolve(data.data.url);
    });
  });

  ctx.redirect(redirectionUrl);
}

function checkAuth(ctx) {
  const { headers } = ctx;
  headers.host = config.ssoAuth.host;

  let cookies = [];

  try {
    cookies = JSON.parse(base64url.decode(ctx.query.data));

    if (Array.isArray(cookies.cookies)) {
      cookies.cookies.forEach((c) => {
        const parsedCookie = cookie.parse(c);

        if (parsedCookie['CA.OVH.SES']) {
          ctx.cookies.set('CA.OVH.SES', parsedCookie['CA.OVH.SES'], { path: '/', httpOnly: true });
        }

        if (parsedCookie.SESSION) {
          ctx.cookies.set('SESSION', parsedCookie.SESSION, { path: '/', httpOnly: true });
        }
        if (parsedCookie.USERID) {
          ctx.cookies.set('USERID', parsedCookie.USERID, { path: '/' });
        }
      });
    }
  } catch (err) {
    console.error(err);
  }

  ctx.redirect('/');
}

module.exports = {
  auth,
  checkAuth,
  login,
};
/* eslint-enable no-console */

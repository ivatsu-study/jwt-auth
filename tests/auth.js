const test = require('ava');
const agent = require('supertest-koa-agent');
const createApp = require('../src/app');
const issueToken = require('./helpers/issueToken');

const app = agent(createApp());

test('User can successfully login and user can use refreshToken received on login', async (t) => {
  const res = await app.post('/auth/login').send({
    login: 'user',
    password: 'user',
  });
  t.is(res.status, 200);
  t.truthy(typeof res.body.token === 'string');
  t.truthy(typeof res.body.refreshToken === 'string');

  const refreshTokenRes = await app.post('/auth/refresh').send({
    refreshToken: res.body.refreshToken,
  });
  t.is(refreshTokenRes.status, 200);
  t.truthy(typeof refreshTokenRes.body.token === 'string');
  t.truthy(typeof refreshTokenRes.body.refreshToken === 'string');
});

test('User gets 403 on invalid credentials', async (t) => {
  const res = await app.post('/auth/login').send({
    login: 'INVALID_LOGIN',
    password: 'INVALID_PASSWORD'
  });
  t.is(res.status, 403);
});

test('User gets 401 on expired token', async t => {
  const expiredToken = issueToken({ id: 1 }, { expiresIn: '1ms' });
  const res = await app.get('/users').set('Authorization', `Bearer ${expiredToken}`);
  t.is(res.status, 401);
});

test('User can get new access token using refresh token', async t => {
  const res = await app.post('/auth/refresh').send({
    refreshToken: 'REFRESH_TOKEN_1',
  });
  t.is(res.status, 200);
  t.truthy(typeof res.body.token === 'string');
  t.truthy(typeof res.body.refreshToken === 'string');
});

test('User gets 404 on invalid refresh token', async t => {
  const res = await app.post('/auth/refresh').send({
    refreshToken: 'INVALID_REFRESH_TOKEN',
  });
  t.is(res.status, 404);
});

test('User can use refresh token only once', async t => {
  const firstRes = await app.post('/auth/refresh').send({
    refreshToken: 'REFRESH_TOKEN_ONCE',
  });
  t.is(firstRes.status, 200);
  t.truthy(typeof firstRes.body.token === 'string');
  t.truthy(typeof firstRes.body.refreshToken === 'string');

  const secondRes = await app.post('/auth/refresh').send({
    refreshToken: 'REFRESH_TOKEN_ONCE',
  });
  t.is(secondRes.status, 404);
});

test('Refresh tokens become invalid on logout', async t => {
  const logoutRes = await app.post('/auth/logout').set('Authorization', `Bearer ${issueToken({ id: 2 })}`);
  t.is(logoutRes.status, 200);

  const refreshRes = await app.post('/auth/refresh').send({
    refreshToken: 'REFRESH_TOKEN_ON_LOGOUT',
  });
  t.is(refreshRes.status, 404);
});
test.todo('Multiple refresh tokens are valid');

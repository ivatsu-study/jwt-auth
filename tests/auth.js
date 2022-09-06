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

test.todo('User can use refresh token only once');
test.todo('Refresh tokens become invalid on logout');
test.todo('Multiple refresh tokens are valid');

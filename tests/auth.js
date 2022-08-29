const test = require('ava');
const agent = require('supertest-koa-agent');
const createApp = require('../src/app');

const app = agent(createApp());

test('User can successfully login', async (t) => {
  const res = await app.post('/auth/login').send({
    login: 'user',
    password: 'user',
  });
  t.is(res.status, 200);
  t.truthy(typeof res.body.token === 'string');
  t.truthy(typeof res.body.refreshToken === 'string');
});

test.todo('User gets 403 on invalid credentials');
test.todo('User gets 401 on expired token');
test.todo('User can refresh the access token using refresh token');
test.todo('User can use refresh token only once');
test.todo('Refresh tokens become invalid on logout');
test.todo('Multiple refresh tokens are valid');

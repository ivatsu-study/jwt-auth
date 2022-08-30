const Koa = require('koa');
const Router = require('koa-router');

const config = require('./config');
const authModule = require('./modules/auth/auth');
const usersModule = require('./modules/users/users');

function createApp() {
  const app = new Koa();
  const router = new Router();
  router.get('/', (ctx) => {
    ctx.body = 'ok';
  });

  router.use('/auth', authModule.routes());
  router.use('/users', usersModule.routes());

  app.use(router.allowedMethods());
  app.use(router.routes());

  return app;
}

if (!module.parent) {
  createApp().listen(config.port);
}

module.exports = createApp;

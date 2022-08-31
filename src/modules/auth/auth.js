const Router = require('koa-router');
const { compareSync } = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const { find } = require('../../services/user');
const config = require('../../config');

const router = new Router();

router.post('/login', async (ctx) => {
  const { login, password } = ctx.request.body;
  const user = await find({ login });
  if (!user || !compareSync(password, user.password)) {
    const error = new Error();
    error.status = 403;
    throw error;
  }

  const refreshToken = uuidv4();
  ctx.body = {
    token: jwt.sign({ id: user.id }, config.secret),
    refreshToken,
  };
});

module.exports = router;

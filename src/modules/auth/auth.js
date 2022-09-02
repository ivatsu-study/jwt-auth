const Router = require('koa-router');
const { compareSync } = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const { find } = require('../../services/user');
const refreshTokenService = require('../../services/refreshToken');
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

router.post('/refresh', async (ctx) => {
  const { refreshToken } = ctx.request.body;
  const dbToken = await refreshTokenService.find({ refreshToken });
  if (!dbToken) {
    // gives 404 by default
    return;
  }
  const newRefreshToken = uuidv4();
  ctx.body = {
    token: jwt.sign({ id: dbToken.userId }, config.secret),
    refreshToken: newRefreshToken,
  };
});

module.exports = router;

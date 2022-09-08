const Router = require('koa-router');
const { compareSync } = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const { find } = require('../../services/user');
const refreshTokenService = require('../../services/refreshToken');
const config = require('../../config');

const router = new Router();

async function issueTokenPair(userId) {
  const refreshToken = uuidv4();
  await refreshTokenService.create({
    refreshToken,
    userId,
  });

  return {
    token: jwt.sign({ id: userId }, config.secret),
    refreshToken,
  };
}

router.post('/login', async (ctx) => {
  const { login, password } = ctx.request.body;
  const user = await find({ login });
  if (!user || !compareSync(password, user.password)) {
    const error = new Error();
    error.status = 403;
    throw error;
  }

  ctx.body = await issueTokenPair(user.id);
});

router.post('/refresh', async (ctx) => {
  const { refreshToken } = ctx.request.body;
  const dbToken = await refreshTokenService.find({ refreshToken });
  if (!dbToken) {
    // gives 404 by default
    return;
  }

  await refreshTokenService.remove({
    refreshToken,
  });
  ctx.body = await issueTokenPair(dbToken.userId);
});

module.exports = router;

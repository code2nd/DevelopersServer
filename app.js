const http = require('http');
const https = require('https');
const fs = require('fs');

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const Redis = require('ioredis');
const config = require('./src/config/config');
const InitManager = require('./src/core/init');
const catchError = require('./src/middlewares/exeption');
const redisConfig = require('./src/config/config').redis;

const SessionStore = require('./src/app/services/sessionStore');

require('./src/app/models/user');

const app = new Koa();

app.keys = ['developers application'];

// 创建redis client
const redis = new Redis(redisConfig);

const SESSION_CONFIG = {
  key: 'SESSIONID',
  maxAge: 1000 * 60 * 60 * 24,
  store: new SessionStore(redis)
};

app.use(catchError);

app.use(bodyParser());

app.use(session(SESSION_CONFIG, app));

process.cwd();
InitManager.initCore(app);

app.listen(config.port, () => {
  console.log(`app running at port ${config.port}`)
});
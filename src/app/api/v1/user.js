const Router = require('koa-router')

const { 
  NotEmptyValidator,
  GetUsersValidator
} = require('../../validators/validator');
const { User } = require('../../models/user');
const { success } = require('../../../utils');
const { Auth } = require('../../../middlewares/auth');
const Config = require('../../../config/config');

const { AUTH_LEVEL: { USER, ADMIN } } = Config;

const router = new Router({
  prefix: '/user'
});

// 注册(用户名注册)
router.post('/register', async (ctx) => {
  const v = await new NotEmptyValidator('username', 'password1', 'password2').validate(ctx);
  const user = {
    username: v.get('body.username'),
    password: v.get('body.password2')
  };

  await User.registerByUsername(user);
  success();
});

// 登录 (用户名密码登录)
router.post('/login', async (ctx) => {
  const v = await new NotEmptyValidator('username', 'password').validate(ctx);
  const user = {
    username: v.get('body.username'),
    password: v.get('body.password')
  };

  const userInfo = await User.loginByUsername(user);
  ctx.session.userInfo = userInfo;
  ctx.body = {
    isLogin: true,
    username: userInfo.user_name,
    avatar: userInfo.avatar
  }
});

// 退出登录
router.post('/logout', new Auth().m, async (ctx) => {
  ctx.session = null
  success('退出登录成功!')
});

// 获取用户信息
router.get('/userInfo', async (ctx) => {
  let sendData = {}
  const userInfo = ctx.session.userInfo
  if (userInfo) {
    const { user_name: username, avatar } = userInfo
    sendData = {
      isLogin: true,
      username,
      avatar
    }
  } else {
    sendData = { isLogin: false }
  }
  ctx.body = sendData
});

// 获取用户列表
router.get('/users', new Auth(ADMIN).m, async (ctx) => {
  const v = await new GetUsersValidator('page', 'pageSize').validate(ctx)
  const param = {
    page: v.get('query.page') || 1,
    pageSize: v.get('query.pageSize') || 10
  }
  const users = await User.getUsers(param)
  ctx.body = users ? users : []
});

// 根据用户权限获取管理页菜单
router.get('/menu', new Auth().m, async (ctx) => {
  const userInfo = ctx.session.userInfo;
  let menu = [
    {
      key: 'blog',
      href: '#b',
      value: '博客'
    },
    {
      key: 'blogCategory',
      href: '#bc',
      value: '博客分类'
    }
  ];

  if (userInfo.auth_level && userInfo.auth_level > 8) {
    menu = menu.concat([
      {
        key: 'website',
        href: '#w',
        value: '网站'
      },
      {
        key: 'websiteCategory',
        href: '#wc',
        value: '网站分类'
      }
    ])
  }

  ctx.body = menu;
});

module.exports = router;
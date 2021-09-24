const Router = require('koa-router');

const { NotEmptyValidator } = require('../../validators/validator');
const { Blog } = require('../../models/blog');
const { success } = require('../../../utils');
const { Auth } = require('../../../middlewares/auth');
const Config = require('../../../config/config');

const { AUTH_LEVEL: { USER, ADMIN } } = Config;

const router = new Router({
  prefix: ''
});

// 获取列表
router.get('/blog', new Auth().m, async (ctx) => {
  const v = await new NotEmptyValidator('page', 'pageSize').validate(ctx);
  const page = parseInt(v.get('query.page'));
  const pageSize = parseInt(v.get('query.pageSize'));
  const keyword = v.get('query.keyword');
  const category = v.get('query.category') && parseInt(v.get('query.category'));
  const date = v.get('query.date');

  const { user_id } = ctx.session.userInfo;

  const res = await Blog.getBlogList({keyword, category, date, page, pageSize, user_id});
  ctx.body = {
    page,
    pageSize,
    total: res.count,
    data: res.rows
  };
});

// 新增
router.post('/blog', new Auth().m, async (ctx) => {
  const v = await new NotEmptyValidator('title', 'url', 'category', 'date', 'description').validate(ctx);
  const title = v.get('body.title');
  const url = v.get('body.url');
  const category = v.get('body.category');
  const date = v.get('body.date');
  const description = v.get('body.description');

  const { user_id } = ctx.session.userInfo;

  await Blog.addBlogItem({title, url, category, date, description, user_id});
  success();
});

// 修改
router.put('/blog', new Auth().m, async (ctx) => {
  const v = await new NotEmptyValidator('key', 'title', 'url', 'category', 'date', 'description').validate(ctx);
  const key = v.get('body.key');
  const title = v.get('body.title');
  const url = v.get('body.url');
  const category = v.get('body.category');
  const date = v.get('body.date');
  const description = v.get('body.description');

  await Blog.updateBlogItem({key, title, url, category, date, description});
  success();
});

// 删除
router.delete('/blog', new Auth().m, async (ctx) => {
  const v = await new NotEmptyValidator('key').validate(ctx);
  const key = v.get('query.key');
  const arr_keys = key.split(',');
  const records = await Blog.getItemsByIds(arr_keys);
  if (!records) {
    throw new global.errs.DeleteError();
  }

  await Blog.deleteBlogItem(arr_keys);
  success();
});

module.exports = router;
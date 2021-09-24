const Router = require('koa-router');
const { Op } = require('sequelize');

const { NotEmptyValidator } = require('../../validators/validator');
const { CategoryBlog } = require('../../models/categoryBlog');
const { Blog } = require('../../models/blog');
const { success } = require('../../../utils');
const { sequelize } = require('../../../core/db');
const { Auth } = require('../../../middlewares/auth');
const Config = require('../../../config/config');

const { AUTH_LEVEL: { USER, ADMIN } } = Config;

const router = new Router({
  prefix: '/Blog'
});

// get
router.get('/category', new Auth(USER).m, async (ctx) => {
  const { user_id } = ctx.session.userInfo;
  ctx.body = await CategoryBlog.getCategoryBlogList(user_id);
});

// add 
router.post('/category', new Auth(USER).m, async (ctx) => {
  const v = await new NotEmptyValidator('category').validate(ctx);
  const category = v.get('body.category');
  const { user_id } = ctx.session.userInfo;
  const result = await CategoryBlog.getItemByCategory(user_id, category);
  if (result) {
    throw new global.errs.Exist();
  }

  await CategoryBlog.addCategoryBlogItem(user_id, category);
  success();
});

// update
router.put('/category', new Auth(USER).m, async (ctx) => {
  const v = await new NotEmptyValidator('key', 'category').validate(ctx);
  const key = v.get('body.key');
  const category = v.get('body.category');
  const { user_id } = ctx.session.userInfo;
  await CategoryBlog.updateCategoryBlogItem(user_id, key, category);
  success();
});

// delete
router.delete('/category', new Auth(USER).m, async (ctx) => {
  // 删除文章分类同时要删除该分类下的所有文章
  const v = await new NotEmptyValidator("key").validate(ctx);
  const key = v.get("query.key");
  const keys_arr = key.split(',');

  const category = await CategoryBlog.getItemsByCategoryIds(keys_arr);
  if (!category) {
    throw new global.errs.DeleteError();
  }

  await sequelize.query(`SET foreign_key_checks = 0`);

  await sequelize.transaction(async (t) => {
    await CategoryBlog.destroy({
      where: {
        user_id,
        category_id: {
          [Op.or]: keys_arr
        }
      },
      force: false,
      transaction: t,
    });

    await Blog.destroy({
      where: {
        user_id,
        category: {
          [Op.or]: keys_arr
        }
      },
      transaction: t
    })

    await sequelize.query(`SET foreign_key_checks = 1`);
  });

  success();
});

module.exports = router;
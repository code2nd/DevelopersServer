const Router = require("koa-router");
const { Op } = require('sequelize');
const { sequelize } = require("../../../core/db");
const { success } = require("../../../utils");
const { CategoryWeb } = require("../../models/categoryWeb");
const { Web } = require("../../models/web");
const { Auth } = require('../../../middlewares/auth');
const Config = require('../../../config/config');

const { AUTH_LEVEL: { USER, ADMIN } } = Config;

const { NotEmptyValidator } = require("../../validators/validator");

const router = new Router({
  prefix: "/web",
});

// get
router.get("/category", async (ctx) => {
  ctx.body = await CategoryWeb.getCategoryWebList();
});

// add
router.post("/category", new Auth(ADMIN).m, async (ctx) => {
  const v = await new NotEmptyValidator("category").validate(ctx);
  const category = v.get("body.category");

  const result = await CategoryWeb.getItemByCategory(category);
  if (result) {
    throw new global.errs.Exist();
  }

  await CategoryWeb.addCategoryWebItem(category);
  success();
});

// update
router.put("/category", new Auth(ADMIN).m, async (ctx) => {
  const v = await new NotEmptyValidator("key", "category").validate(ctx);
  const key = v.get("body.key");
  const category = v.get("body.category");
  await CategoryWeb.updateCategoryWebItem(key, category);
  success();
});

// delete
router.delete("/category", new Auth(ADMIN).m, async (ctx) => {
  const v = await new NotEmptyValidator("key").validate(ctx);
  const key = v.get("query.key");
  const arr_keys = key.split(',');
  const category = await CategoryWeb.getItemsByCategoryIds(arr_keys);
  if (!category) {
    throw new global.errs.DeleteError();
  }

  await sequelize.query(`SET foreign_key_checks = 0`);

  await sequelize.transaction(async (t) => {
    await CategoryWeb.destroy({
      where: {
        category_id: {
          [Op.or]: arr_keys
        }
      },
      force: false,
      transaction: t,
    });

    await Web.destroy({
      where: {
        category: {
          [Op.or]: arr_keys
        }
      },
      transaction: t
    })

    await sequelize.query(`SET foreign_key_checks = 1`);
  });

  success();
});

module.exports = router;

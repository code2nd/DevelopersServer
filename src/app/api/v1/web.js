const Router = require('koa-router');
const multer = require('@koa/multer');
const path = require('path');
const chalk = require('chalk');

const { NotEmptyValidator } = require('../../validators/validator');
const { Web } = require('../../models/web');
const { success } = require('../../../utils');
const DirExists = require('../../../utils/dirExists');
const FileHandler = require('../../../utils/fileHandler');
const { fileServer, AUTH_LEVEL: { ADMIN } } = require('../../../config/config');
const { Auth } = require('../../../middlewares/auth');

const router = new Router({
  prefix: ''
});

const filePath = path.join(process.cwd(), '../fileServer/logo');
const upload = multer({ dest: new DirExists().createDir(filePath)})

// 获取 web list (分类)
router.get('/weblist', async (ctx) => {
  const res = await Web.getClassifiedWeblist();
  ctx.body = res;
});

// 获取 web list (分页)
router.get('/web', new Auth(ADMIN).m, async (ctx) => {
  const v = await new NotEmptyValidator('page', 'pageSize').validate(ctx);
  const page = parseInt(v.get('query.page'));
  const pageSize = parseInt(v.get('query.pageSize'));
  const keyword = v.get('query.keyword');
  const category = v.get('query.category') && parseInt(v.get('query.category'));

  const res = await Web.getWebList({page, pageSize, keyword, category});
  ctx.body = {
    page,
    pageSize,
    total: res.count,
    data: res.rows
  };
});

// 新增
router.post('/web', new Auth(ADMIN).m, upload.single('logo'), async (ctx) => {
  let data;
  if (ctx.file) {
    const file = new FileHandler(ctx.file);
    const realFileName = file.getRealFilenName();
    await file.rename(filePath + '/' + realFileName);
    data = {...ctx.request.body, logo: fileServer + realFileName};
  } else {
    data = ctx.request.body;  
    delete data.logo;
  }
  await Web.addWebItem(data);
  success();
});

// 更新
router.put('/web', new Auth(ADMIN).m, upload.single('logo'), async (ctx) => {
  let data;
  if (ctx.file) {
    const file = new FileHandler(ctx.file);
    const realFileName = file.getRealFilenName();
    await file.rename(filePath + '/' + realFileName);
    data = {...ctx.request.body, logo: fileServer + realFileName};
  } else {
    data = ctx.request.body;
  }

  await Web.updateWebItem(data);
  success();
});

// 删除
router.delete('/web', new Auth(ADMIN).m, async (ctx) => {
  const v = await new NotEmptyValidator('key').validate(ctx);
  const key = v.get('query.key');
  const arr_keys = key.split(',');
  const records = await Web.getItemsByIds(arr_keys);
  if (!records) {
    throw new global.errs.DeleteError();
  }

  await Web.deleteWebItem(arr_keys);
  success();
});

// 清除所有没用的图片吧
router.delete('/clearImgs', new Auth(ADMIN).m, async () => {
  await Web.clearImgs(filePath);
  success();
});

module.exports = router;
const fs = require('fs');
const { Sequelize, Model, Op } = require('sequelize');
const { sequelize } = require('../../core/db');
const { CategoryWeb } = require('./categoryWeb');
const { fileServer } = require('../../config/config');

class Web extends Model {

  // get -- 获取网站列表（分类的所有数据）
  static async getClassifiedWeblist() {
    const categories = await CategoryWeb.findAll({
      attributes: ['category_id', 'category'],
      order: [['sort', 'ASC']]
    });

    const list = [];

    for (let i=0, len=categories.length; i<len; i++) {
      const res = await Web.findAll({
        attributes: [
          ['id', 'key'],
          'name',
          'url',
          'description',
          'logo',
          ['category', 'category_id']
        ],
        where: {
          'category': categories[i].category_id
        }
      });
      list.push({
        key: categories[i].category_id,
        name: categories[i].category,
        list: res
      });
    }

    return list;
  }

  // get -- 获取网站列表
  static async getWebList({page, pageSize, keyword, category = null, user_id}) {

    const whereCondition = [];
    if (keyword) {
      whereCondition.push({
        name: {
          [Op.like]: `%${keyword}%`,
        },
      });
    }

    if (category) {
      whereCondition.push({
        category,
      });
    }

    const list = await Web.findAndCountAll({
      attributes: [
        ['id', 'key'],
        'name',
        'url',
        'description',
        'logo',
        ['category', 'category_id'],
        Sequelize.col('CategoryWeb.category')
      ],
      include: [
        {
          model: CategoryWeb,
          attributes: [],
        }
      ],
      raw: true,
      order: [['create_time', 'DESC']],
      where: {
        [Op.and]: whereCondition
      },
      offset: (page - 1) * pageSize,
      limit: pageSize
    });

    return list;
  }

  // add -- 添加一条记录
  static async addWebItem(data) {
    return await Web.create({
      ...data
    })
  }

  // update -- 修改一条记录
  static async updateWebItem(data) {
    const { key, ...rest } = data;
    return await Web.update({
      ...rest
    },{
      where: {
        id: key
      }
    })
  }

  // 通过id获取记录
  static async getItemsByIds(ids) {
    const res = await Web.findAll({
      attributes:['name', 'url', 'logo', 'description', 'category'],
      where: {
        id: {
          [Op.or]: ids,
        },
      },
    });

    return res;
  }

  // 通过 id 删除记录
  static async deleteWebItem(ids) {
    return await Web.destroy({
      where: {
        id: {
          [Op.or]: ids
        }
      }
    })
  }

  // 删除所有没用的图片文件
  static async clearImgs(filePath) {
    // 读取图片文件夹下的所有图片文件
    // 判断文件名是否为default.png，如果是则跳过，如果不是，则在web表中查找该文件名在表中是否有记录
    // 有记录则保留，无记录则删除
    const fileList = await fs.promises.readdir(filePath);
    fileList.forEach(async (filename) => {
      if (filename !== 'default.png') {
        const logo = fileServer + filename;
        const records = await Web.findAll({
          attributes: ['logo'],
          where: {
            logo
          }
        });

        if (!records.length) {
          await fs.promises.rm(filePath + '/' + filename);
        }
      }
    });
  }
}

Web.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true
  },
  name: {
    type: Sequelize.STRING(32),
    unique: true
  },
  url: Sequelize.STRING(128),
  description: Sequelize.STRING(64),
  logo: Sequelize.STRING(128),
  category: Sequelize.INTEGER,
  create_time: Sequelize.DATE,
  update_time: Sequelize.DATE
}, {
  sequelize,
  tableName: 'web'
});

CategoryWeb.hasOne(Web);

Web.belongsTo(CategoryWeb, {
  foreignKey: 'category'
});

module.exports = { Web }
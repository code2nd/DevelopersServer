const { Sequelize, Model, Op } = require("sequelize");
const { sequelize } = require("../../core/db");

class CategoryWeb extends Model {
  // get -- 获取网站分类列表
  static async getCategoryWebList() {
    const list = await CategoryWeb.findAll({
      attributes: [
        ["category_id", "key"],
        ["category", "value"],
      ],
      order: [["sort", "ASC"]],
    });

    return list;
  }

  // add -- 添加分类
  static async addCategoryWebItem(category) {
    const count = await CategoryWeb.count();

    return await CategoryWeb.create({
      sort: count + 1,
      category,
    });
  }

  // update
  static async updateCategoryWebItem(category_id, category) {
    return await CategoryWeb.update(
      {
        category,
      },
      {
        where: {
          category_id,
        },
      }
    );
  }

  // 根据id查询记录（多选）
  static async getItemsByCategoryIds(category_ids) {
    const res = await CategoryWeb.findAll({
      attributes: ["category_id", "category"],
      where: {
        category_id: {
          [Op.or]: category_ids,
        },
      },
    });

    return res;
  }

  // 根据 category 查询记录
  static async getItemByCategory(category) {
    const res = await CategoryWeb.findOne({
      where: {
        category
      }
    })

    return res;
  }
}

CategoryWeb.init(
  {
    category_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    category: {
      type: Sequelize.STRING(10),
      unique: true,
    },
    sort: {
      type: Sequelize.INTEGER,
      unique: true,
    },
    create_time: Sequelize.DATE,
    update_time: Sequelize.DATE,
  },
  {
    sequelize,
    tableName: "category_web",
  }
);

module.exports = { CategoryWeb };

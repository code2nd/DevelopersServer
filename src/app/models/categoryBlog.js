const { Sequelize, Model, Op } = require("sequelize");
const { sequelize } = require("../../core/db");

class CategoryBlog extends Model {
  // get -- 获取文章分类列表
  static async getCategoryBlogList(user_id) {
    const list = await CategoryBlog.findAll({
      attributes: [
        ["category_id", "key"],
        ["category", "value"],
      ],
      where: {
        user_id
      },
      order: [["sort", "ASC"]],
    });

    return list;
  }

  // add
  static async addCategoryBlogItem(user_id, category) {
    const count = await CategoryBlog.count({
      where: {
        user_id
      }
    });

    return await CategoryBlog.create({
      sort: count + 1,
      category,
      user_id
    });
  }

  // update
  static async updateCategoryBlogItem(user_id, category_id, category) {
    return await CategoryBlog.update(
      {
        category,
      },
      {
        where: {
          user_id,
          category_id,
        },
      }
    );
  }

  // 通过 category_id 查找
  static async getItemsByCategoryIds(keys_arr) {
    const res = await CategoryBlog.findOne({
      attributes: ["category_id", "category"],
      where: {
        category_id: {
          [Op.or]: keys_arr,
        },
      },
    });

    return res;
  }

  // 通过 category 查找
  static async getItemByCategory(user_id, category) {
    const res = await CategoryBlog.findOne({
      where: {
        user_id,
        category
      }
    });

    return res;
  }
}

CategoryBlog.init(
  {
    category_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    category: Sequelize.STRING(10),
    sort: Sequelize.INTEGER,
    user_id: Sequelize.STRING(8),
    create_time: Sequelize.DATE,
    update_time: Sequelize.DATE,
  },
  {
    sequelize,
    tableName: "category_blog",
  }
);

module.exports = { CategoryBlog };

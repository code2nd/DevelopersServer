const { Sequelize, Model, Op } = require("sequelize");
const { sequelize } = require("../../core/db");
const { CategoryBlog } = require("./categoryBlog");

class Blog extends Model {
  // get
  static async getBlogList({ keyword, category, date, page, pageSize, user_id }) {
    const whereCondition = [];

    whereCondition.push({ user_id })

    if (keyword) {
      whereCondition.push({
        title: {
          [Op.like]: `%${keyword}%`,
        },
      });
    }

    if (category) {
      whereCondition.push({
        category,
      });
    }

    if (date) {
      whereCondition.push({
        date: {
          [Op.between]: date.split(',')
        }
      });
    }

    const list = await Blog.findAndCountAll({
      attributes: [
        ["id", "key"],
        "title",
        "url",
        "date",
        'description',
        ["category", "category_id"],
        Sequelize.col("CategoryBlog.category"),
        Sequelize.col("CategoryBlog.sort"),
      ],
      include: [
        {
          model: CategoryBlog,
          attributes: [],
        },
      ],
      raw: true,
      where: {
        [Op.and]: whereCondition,
      },
      order: [['date', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize
    });

    return list;
  }

  // add
  static async addBlogItem(data) {
    return await Blog.create({
      ...data,
    });
  }

  // update
  static async updateBlogItem(data) {
    const { key, ...rest } = data;
    return await Blog.update(
      {
        ...rest,
      },
      {
        where: {
          id: key,
        },
      }
    );
  }

  // 通过id获取记录
  static async getItemsByIds(ids) {
    const res = await Blog.findAll({
      attributes:['title', 'url', 'date', 'description', 'category'],
      where: {
        id: {
          [Op.or]: ids,
        },
      },
    });

    return res;
  }

  // delete
  static async deleteBlogItem(ids) {
    return await Blog.destroy({
      where: {
        id: {
          [Op.or]: ids
        }
      }
    });
  }
}

Blog.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    title: Sequelize.STRING(64),
    url: Sequelize.STRING(128),
    category: Sequelize.INTEGER,
    date: Sequelize.STRING(10),
    description: Sequelize.STRING(128),
    user_id: Sequelize.STRING(8),
    create_time: Sequelize.DATE,
    update_time: Sequelize.DATE,
  },
  {
    sequelize,
    tableName: "blog",
  }
);

CategoryBlog.hasOne(Blog);

Blog.belongsTo(CategoryBlog, {
  foreignKey: "category"
});

module.exports = { Blog };

const bcrypt = require('bcryptjs')
const { Sequelize, Model } = require('sequelize')
const { sequelize } = require('../../core/db')

const salt = bcrypt.genSaltSync(10)

class User extends Model {

  // 注册
  static async registerByUsername (data) {
    let { username: user_name, password } = data;

    const user = await User.getUserInfoByUsername(user_name);

    if (user) {
      throw new global.errs.Exist('该用户名已经被注册！');
    }

    const hash = bcrypt.hashSync(password, salt);
    password = hash;

    const user_id = Math.random().toString(16).slice(-8);

    return await User.create({
      user_id,
      user_name,
      password
    });
  }

  // 登录
  static async loginByUsername (userInfo) {
    const { username: user_name, password } = userInfo;
    const user = await User.findOne({
      where: {
        user_name
      }
    });

    if (!user) {
      throw new global.errs.AuthFailed('账号不存在')
    }

    const correct = bcrypt.compareSync(password, user.password)
    if (!correct) {
      throw new global.errs.AuthFailed('密码不正确')
    }

    return user
  }

  // 通过用户名获取用户信息
  static async getUserInfoByUsername (user_name) {
    const user = await User.findOne({
      attributes:[
        'id',
        'user_name',
        'avatar'
      ],
      where: {
        user_name
      }
    })

    return user
  }

  // 获取用户列表
  static async getUsers(param) {
    const { page, pageSize } = param
    const users = await User.findAll({
      attributes: [
        ['user_name', 'username'],
        'avatar',
        'authLevel'
      ],
      offset: (page-1)*pageSize,
      limit: pageSize
    })

    return users
  }
}

User.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  },
  user_id: {
    type: Sequelize.STRING(8),
    unique: true,
  },
  user_name: {
    type: Sequelize.STRING(20),
    unique: true
  },
  password: Sequelize.STRING(64),
  avatar: Sequelize.STRING(64),
  auth_level: Sequelize.INTEGER,
  create_time: Sequelize.DATE,
  update_time: Sequelize.DATE
}, {
  sequelize,
  tableName: 'user'
})

module.exports = {
  User
}
const path = require('path')
const DirExists = require('../utils/dirExists')

module.exports = {
  // prod
  environment: 'dev',
  port: 3000,
  database: {
    dbName: 'your dbName',
    host: 'your host',
    port: 'your port',
    user: 'root',
    password: 'your password'
  },
  security: {
    secretKey: 'your secretKey',
    expiresIn: 60 * 60 * 24 
  },
  redis: {
    port: 'your port',
    host: "your host",
    password: "your password",
    db: 1
  },
  AUTH_LEVEL: {
    USER: 8,
    ADMIN: 16
  },
  uploadDir: new DirExists().createDir(path.join(__dirname, '../../../files')),
  fileServer: '图片服务器地址'
}
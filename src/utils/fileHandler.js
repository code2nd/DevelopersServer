const path = require('path');
const fs = require('fs');

 /**
   * fieldname: 'file'
   * originalname: 'xxx.png'
   * destination: 'F:\\xxxx\\xxxx'
   * filename: '7fcf....afbf'
   * path: destination + filename
   * size: 8232
   */

class FileHandler {
  constructor(file) {
    const { originalname, path: filePath, filename } = file;
    const { ext } = path.parse(originalname);
    this.filePath = filePath;
    this.realFileName = filename + ext;
  }

  // 修改名称（从一个路径移动到另一个路径）
  rename(destPath) {
    // const { ext } = path.parse(this.file.originalname);
    return new Promise((resolve, reject) => {
      fs.rename(this.filePath, destPath, (err) => {
        if (err) reject(err);
        resolve();
      })
    })
  }

  getRealFilenName() {
    return this.realFileName;
  }
}

module.exports = FileHandler;
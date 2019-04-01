const fs = require('fs');
var stream = require('stream');

exports.saveFile = async function (filePath, fileData) {
  return new Promise((resolve, reject) => {
    // 块方式写入文件
    const wstream = fs.createWriteStream(filePath);
    var rstream = new stream.PassThrough();
    //将Buffer写入
    rstream.end(fileData);
    //进一步使用
    rstream.pipe(wstream)
    // wstream.on('open', () => {
    //   const blockSize = 1024;
    //   const nbBlocks = Math.ceil(fileData.length / (blockSize));
    //   for (let i = 0; i < nbBlocks; i += 1) {
    //     const currentBlock = fileData.slice(
    //       blockSize * i,
    //       Math.min(blockSize * (i + 1), fileData.length),
    //     );
    //     wstream.write(currentBlock);
    //   }
    //   wstream.end();
    // });
    rstream.on('error', (err) => {
      reject(err);
    });
    rstream.on('end', () => {
      resolve(true);
    });
  });
}
const http = require('http');
const https = require('https');
const fs = require('fs');
const pathlib = require('path');
const urllib = require('url');

async function request(path, headers) {
  let urlInfo = urllib.parse(path);
  const options = {
    hostname: urlInfo.hostname,
    path: urlInfo.path,
    method: urlInfo.method,
    headers
  };
  if (urlInfo.protocol.toLowerCase() === 'https:') {
    return await hs(options, headers)
  } else if (urlInfo.protocol.toLowerCase() === 'http:') {
    return await h(options, headers)
  } else {
    throw new Error('spider : URL -> error -> Your protocol cannot be matched in the URL you provide')
  };
};

function hs(options, headers) {
  return new Promise((resolve, reject) => {
    let req = https.request(options, {
      strictSSL: false,
      rejectUnauthorized: false,
    }, res => {
      let n = res.statusCode;
      if (n >= 200 && n < 300 || n == 304) {
        let arr = [];
        res.on('data', data => {
          arr.push(data);
        });
        res.on('end', () => {
          let buf = Buffer.concat(arr);
          resolve(buf);
        });
      } else {
        reject(new Error('spider : get -> error -> statusCode [' + n + ']'))
      };
    });
    req.on('error', err => {
      console.log(err);
      
      reject('请求失败:' + err);
    });
    req.write("");
    req.end();
  })
};

function h(options, headers) {
  return new Promise((resolve, reject) => {
    let req = http.request(options, res => {
      let n = res.statusCode;
      if (n >= 200 && n < 300 || n == 304) {
        let arr = [];
        res.on('data', data => {
          arr.push(data);
        });
        res.on('end', () => {
          let buf = Buffer.concat(arr);
          resolve(buf);
        });
      } else {
        reject(new Error('spider : get -> error -> statusCode [' + n + ']'))
      };
    });
    req.on('error', err => {
      console.log(err);

      reject('请求失败:' + err);
    });
    req.write("");
    req.end();
  })
};
let headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.26 Safari/537.36 Core/1.63.6788.400 QQBrowser/10.3.2727.400'
}
request('https://www.dingdiann.com').then(data => {
  fs.writeFile(pathlib.resolve('tmp', 'bxwx.html'), data, err => {
    if (err) {
      console.log(err);
    } else {
      console.log('成功啦!');
    };
  });
}, err => {
  console.log(err);
});
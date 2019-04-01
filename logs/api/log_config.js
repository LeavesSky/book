const log4js = require('log4js');
const pathlib = require('path');
const fs = require('fs');

let basePath = pathlib.resolve(__dirname, "../web"),
  errorPath = basePath + "/errors",
  webPath = basePath + "/info",
  processPath = basePath + "/process";

function confirmPath(pathStr) {
  if (!fs.existsSync(pathStr)) {
    fs.mkdir(pathStr, {
      recursive: true
    }, err => {
      if (err) console.log(err)
    })
  }
};

if (basePath) {
  confirmPath(errorPath)
  confirmPath(webPath)
  confirmPath(processPath)
};

log4js.configure({
  appenders: {
    errLog: {
      type: 'dateFile',
      filename: errorPath + "/err",
      "pattern": 'yyyy-MM-dd.log',
      alwaysIncludePattern: true
    },
    webLog: {
      type: "dateFile",
      filename: webPath + "/web",
      pattern: "yyyy-MM-dd.log",
      alwaysIncludePattern: true
    },
    proLog: {
      type: "dateFile",
      filename: processPath + "/dl",
      pattern: "yyyy-MM-dd.log",
      alwaysIncludePattern: true
    },
    proErrLog: {
      type: "dateFile",
      filename: processPath + "/err",
      pattern: "yyyy-MM-dd.log",
      alwaysIncludePattern: true
    }
  },
  categories: {
    errLog: {
      appenders: ['errLog'],
      level: 'error'
    },
    webLog: {
      appenders: ['webLog'],
      level: 'info'
    },
    proLog: {
      appenders: ['proLog'],
      level: 'info'
    },
    proErrLog:{
      appenders: ['proErrLog'],
      level: 'error'
    },
    default: {
      appenders: ['webLog', 'errLog', 'proLog','proErrLog'],
      level: 'trace'
    }
  },
  disableClustering: true
});

module.exports = log4js;
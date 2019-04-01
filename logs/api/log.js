const log4js = require('./log_config');

let errLog = log4js.getLogger('errLog'),
  webLog = log4js.getLogger('webLog'),
  proLog = log4js.getLogger('proLog'),
  proErrLog = log4js.getLogger('proErrLog'),
  arr = [];
arr.push("\n" + "*************** spider log start ***************" + "\n")
arr.push("JSDOM start: 小说主页载入及解析..." + "\n")
arr.push("JSDOM end: 小说信息解析成功..." + "\n")
arr.push("JSDOM err: 小说信息解析失败...详情见本文件夹下err记录！" + "\n")
arr.push("JSDOM err: 小说主页解析失败...详情见本文件夹下err记录！" + "\n")
arr.push("JSDOM start: 目录页载入及解析..." + "\n")
arr.push("JSDOM process: 分析HTML→li获取目录信息..." + "\n")
arr.push("JSDOM process: 重组目录信息..." + "\n")
arr.push("JSDOM end: 目录信息获取完成。" + "\n")
arr.push("JSDOM err: 重组目录信息失败...详情见本文件夹下err记录！" + "\n")
arr.push("JSDOM start: 阅读页载入及解析..." + "\n")
arr.push("JSDOM err: 阅读页解析失败...详情见本文件夹下err记录！" + "\n")
arr.push("JSDOM end: 小说内容提取成功." + "\n")
arr.push("JSDOM end: 小说内容提取失败." + "\n")

var log = {};
log.web = function (req, res, resTime) {
  if (req) {
    webLog.info(formatRes(req, res, resTime));
  }
};

log.err = function (req, error, resTime) {
  if (req && error) {
    errLog.error(formatError(req, error, resTime));
  }
};

log.pro = function (msg) {
  if (msg) {
    proLog.info(formatPro(msg));
  }
};
log.proErr = function (err) {
  if (err) {
    proErrLog.error(formatProError(err));
  }
};
//格式化请求日志
var formatReqLog = function (req, resTime) {
  let getClientIp = function (req) {
    return req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress || '';
  };
  let ip = getClientIp(req).match(/\d+.\d+.\d+.\d+/);

  var logText = new String(),
    method = req.method;
  //访问方法
  logText += "request method: " + method + "\n";
  //请求原始地址
  logText += "request originalUrl:  " + req.originalUrl + "\n";
  //客户端ip
  logText += "request client ip:  " + ip + "\n";
  //请求参数
  if (method == "GET") {
    logText += "request query:  " + JSON.stringify(req.query) + "\n";
  } else if (method == "POST") {
    logText += "request body: " + "\n" + JSON.stringify(req.body) + "\n";
  } else {
    logText += "request query / body: " + "null" + "\n";
  }
  //服务器响应时间
  logText += "response time: " + resTime + "\n";

  return logText;
};

var formatRes = function (req, res, resTime) {
  var logText = new String();

  //响应日志开始
  logText += "\n" + "*************** Web log start ***************" + "\n";
  //添加请求日志
  logText += formatReqLog(req, resTime);
  //响应状态码
  logText += "response status: " + res.statusCode + "\n";
  //响应内容
  logText += "response body: " + "\n" + (JSON.stringify(res.body) || null) + "\n";
  //响应日志结束
  logText += "*************** Web log end ***************" + "\n";
  return logText;
};

var formatError = function (req, err, resTime) {
  var logText = new String();

  //错误信息开始
  logText += "\n" + "*************** error log start ***************" + "\n";
  //添加请求日志
  logText += formatReqLog(req, resTime);
  //错误名称
  logText += "err name: " + err.name + "\n";
  //错误信息
  logText += "err message: " + err.message + "\n";
  //错误详情
  logText += "err stack: " + err.stack + "\n";
  //错误信息结束
  logText += "*************** error log end ***************" + "\n";
  return logText;
};

var formatPro = function (msg) {
  var logText = new String();
  logText += arr[msg];
  return logText;
}

var formatProError = function (err) {
  var logText = new String();
  //错误信息开始
  logText += "\n" + "*************** error log start ***************" + "\n";
  //错误名称
  logText += "err name: " + err.name + "\n";
  //错误信息
  logText += "err message: " + err.message + "\n";
  //错误详情
  logText += "err stack: " + err.stack + "\n";
  //错误信息结束
  logText += "*************** error log end ***************" + "\n";
  return logText;
};
module.exports = log;
const express = require("express");
const bodyParser = require("body-parser");
const router = require("./routes");
const log = require("./logs/api/log");
const pathLib = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const conf = require("./config/service");
const toUpdate = require("./spider/toUpdate");

let app = express();
app.listen(3000, () => {
  console.log("App listening on port 3000!");
});
app.use(cookieParser(conf.cs));
app.use(
  session({
    secret: conf.ss, //session加密密钥
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30, //30天
      secure: false //为true时每次请求都会重新生产session
    },
    saveUninitialized: false, //是指无论有没有session cookie，每次请求都设置个session cookie ，默认给个标示为 connect.sid -- 不时所有网站都需要session 的
    resave: false, //是指每次请求都重新设置session cookie，假设你的cookie是10分钟过期，每次请求都会再设置10分钟 --- 强制更新
    rolling: true, //在每次请求时强行设置 cookie，这将重置 cookie 过期时间（默认：false） 建议设置true设置过期时间如果是2分钟，如果在2分钟内一直操作（访问）浏览器页面，最后一个访问结束后的2分钟在让过期
    store: new MongoStore({
      url: conf.mongodb_default
    })
  })
);

// req.body解析
// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
// parse application/json
app.use(bodyParser.json());

//日志log4js配置
app.use(async (req, res, next) => {
  const start = new Date();
  var ms;
  try {
    //开始进入到下一个中间件
    await next();
    //记录响应日志
    ms = new Date() - start;
    log.web(req, res, ms);
  } catch (error) {
    //记录异常日志
    ms = new Date() - start;
    log.err(req, error, ms);
  }
  //console.log(`${req.method} ${req.url} - ${ms}ms-${res.statusCode}`);
});

//后端渲染art-template配置
app.engine("html", require("express-art-template"));
app.set("view options", {
  debug: process.env.NODE_ENV !== "production"
});

app.set("views", [pathLib.resolve("views")]);

//静态文件中间件
app.use(
  "/assets",
  express.static(__dirname + "/assets", {
    maxAge: 1000 * 60 * 60
  })
);

//路由
app.use("/", router);

//处理错误
app.use(async (err, req, res, next) => {
  if (err) {
    console.log(err);
    log.err(req, err);
    res.send("404 NOT FOUND");
  }
});

//自动定时定点更新
toUpdate.scheduleCronstyle();

// const memRatio = require("./tools/memRatio");
// setInterval(() => {
//   console.log("内存占用:" + memRatio.calcMem().ratio);
// }, 10000);

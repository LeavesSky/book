const config = require("../../config/search");
const got = require("./main");
const JSDOM = require("jsdom").JSDOM;
const log = require("../../logs/api/log");

exports.search = async function (query) {
  try {
    let body = await got(config.surl + query);
    if (!body) {
      throw new Error(".html -> spider -> return nothing");
    }
    log.pro(1)
    let document = new JSDOM(body).window.document;
    // cate: 分类,bu: 小说名对应主页,bn: 小说名,an: 作者
    // 所有地址均为--------------相对地址---------------------------
    let relArr = [];
    let liArr = Array.from(document.querySelectorAll(".novelslist2 li"));
    if (liArr.length != 0 && Array.isArray(liArr)) {
      liArr.slice(1, liArr.length).forEach(li => {
        let rel = {};
        rel.cate = li.children[0].innerHTML.trim();
        rel.bu = li.children[1].children[0].getAttribute("href");
        rel.bn = li.children[1].children[0].innerHTML.trim();
        rel.an = li.children[3].innerHTML.trim();
        relArr.push(rel);
      });
      if (relArr.length) {
        log.pro(2)
        return {
          err: 0,
          relArr,
          msg: null
        };
      } else {
        log.pro(3)
        return {
          err: 1,
          relArr: null,
          msg: "spider -> body -> search数据解析失败,请更新算法!"
        };
      }
    } else {
      log.pro(4)
      return {
        err: 1,
        relArr: null,
        msg: "spider -> body -> search请求失败,请更新算法!"
      };
    }
  } catch (error) {
    log.proErr(error);
  }
};

exports.chalist = async function (path) {
  try {
    log.pro(5)
    let body = await got(config.url + path);
    if (!body) {
      throw new Error(".html -> spider -> return nothing");
    }
    let document = new JSDOM(body).window.document;
    log.pro(6)
    let desc = document.getElementById("intro").innerHTML
    let listArr = Array.from(document.getElementById("list").children[0].children),
      dtArr = Array.from(document.getElementsByTagName("dt"));
    //删除最新的章节列表(dt)和卷名(dt)
    let ddArr = listArr.slice(listArr.indexOf(dtArr[1]) + 1)
    dtArr.forEach(e => {
      let dindex = ddArr.indexOf(e)
      if (dindex) {
        ddArr.splice(dindex, 1)
      }
    });
    //提取数据
    log.pro(7)
    if (ddArr.length != 0 && Array.isArray(ddArr)) {
      let chapterArr = ddArr.map(e => {
        return {
          cu: e.children[0].getAttribute('href'),
          cn: e.children[0].innerHTML.trim()
        }
      });
      log.pro(8)
      return {
        chapterArr,
        desc
      }
    } else {
      log.pro(9)
      throw new Error('spider -> body -> 章节目录解析失败,请更新算法!')
    }
  } catch (error) {
    log.proErr(error);
  }
};

exports.dl = async function (path) {
  try {
    let body = await got(config.url + path);
    if (!body) {
      log.pro(11)
      throw new Error(".html -> spider -> return nothing");
    }
    let document = new JSDOM(body).window.document;
    let text = document.getElementById('content').innerHTML.split('<script>chaptererror();</script>')[0]
    return Buffer.from(text,"utf8")
  } catch (error) {
    log.proErr(error);
  }
}
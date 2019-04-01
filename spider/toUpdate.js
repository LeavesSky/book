var schedule = require('node-schedule');
let Book = require('../proxy/book');
const dingdiann = require("./dingdiann/search");
const pathLib = require('path');
const fs = require('fs');
const saveFileWithStream = require('./savefile');
var moment = require('moment');


exports.scheduleCronstyle = async function () {
  //1. 每天凌晨3点3分3秒定时更新：（队列）
  //2. 获取数据库中最新的章节num值
  //3. 从网站爬取num+1往后的所有章节信息{title,path}
  try {
    schedule.scheduleJob('3 3 3 * * *', async function () {
      let bi = await Book.queryAll();
      let block = Math.ceil(bi.length / 3);
      let rel = [];
      for (let i = 0; i < block; i++) {
        let a = await dingdiann.chalist(bi[3 * i].b_path)
        let ar = compare(a, bi[3 * i])
        if (ar.state == 0) {
          rel.push(ar)
        }
        if (bi[3 * i + 1]) {
          let b = await dingdiann.chalist(bi[3 * i + 1].b_path)
          let br = compare(b, bi[3 * i + 1])
          if (br.state == 0) {
            rel.push(br)
          }
        }
        if (bi[3 * i + 2]) {
          let c = await dingdiann.chalist(bi[3 * i + 2].b_path)
          let cr = compare(c, bi[3 * i + 2])
          if (cr.state == 0) {
            rel.push(cr)
          }
        }
      }

      //4. 根据2.的path爬取内容保存至本地,并将2.返回的章节对象数组map至{title,本地存储path,num+index+1}
      rel.forEach(async e => {
        let {
          bn,
          an,
          nc
        } = e;
        let lastChaNum = e.b_cha_li_all;
        let path = pathLib.resolve("depot", bn + '/' + an + '/');

        if (!fs.existsSync(path)) {
          fs.mkdirSync(path, {
            recursive: true
          }, (err) => {
            if (err) throw err;
          });
        }
        nc.forEach(async (h, index) => {
          let buf = await dingdiann.dl(h.cu); //buffer 
          saveFileWithStream.saveFile(pathLib.resolve(path, (index + lastChaNum) + ".txt"), buf);
        });
        let o = nc.map((d, index) => {
          return {
            c_num: index + lastChaNum,
            c_title: d.cn,
            c_path: pathLib.resolve(path, (index + lastChaNum) + ".txt")
          }
        })
        let r = await Book.addChapter(bn, an, o)
        if (r.err) {
          throw new Error(r.msg)
        };
        console.log(`${moment().format("YYYY-DD-MM")}-${bn}-${an}-更新成功！！`);
      })
    });
  } catch (error) {
    console.log(error);
    throw error
  }
}

function compare(n, o) {
  if (n.chapterArr.length > o.b_cha_li_all) {
    return {
      state: 0,
      bn: o.b_name,
      an: o.b_auth,
      nc: n.chapterArr.splice(o.b_cha_li_all),
      b_cha_li_all: o.b_cha_li_all
    }
  } else {
    Book.changeState(o.b_name, o.b_auth, 1)
    return {
      state: 1
    }
  }
}
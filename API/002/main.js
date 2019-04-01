const fs = require('fs');
const dingdiann = require('../../spider/dingdiann/search');
const querystring = require('querystring');
const pathLib = require('path');
const saveFileWithStream = require('../../spider/savefile')
const log = require("../../logs/api/log");
const book = require("../../proxy/book");
const queue = require("../../tools/redisQueue/listQueue")

exports.checkedSession = async function (req, res, next) {
  if (req.url.toLowerCase().indexOf("/book") >= 0) {
    req.session.bn = req.query.bn
  }
  if (req.session.bn) {
    req.session.cookie.expires = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 30
    ); //延时30天
    return next();
  } else {
    if (req.url == '/') {
      return next();
    }
    if (req.url.toLowerCase().indexOf("/search") < 0) {
      res.redirect("/search")
      return
    } else {
      next();
    }
  }
};

exports.home = async function (req, res) {
  res.render('home.html');
}

exports.searchPge = async function (req, res, next) {
  res.render('search.html', {
    tip1: `/book?${encodeURI("an=唐家三少&bn=斗罗大陆&p=0")}`,
    tip2: `/book?${encodeURI("an=耳根&bn=三寸人间&p=0")}`,
    tip3: `/book?${encodeURI("an=萧鼎&bn=诛仙&p=0")}`,
    tip4: `/book?${encodeURI("an=天蚕土豆&bn=斗破苍穹&p=0")}`,
    tip5: `/book?${encodeURI("an=辰东&bn=神墓&p=0")}`,
    tip6: `/book?${encodeURI("an=心梦无痕&bn=七界传说&p=0")}`,
    tip7: `/book?${encodeURI("an=血红&bn=开天录&p=0")}`,
  });
};

exports.searchBook = async function (req, res, next) {
  let bn = req.body.bn.trim()
  if (!bn) {
    res.send({
      err: 1,
      msg: "你耍我?"
    });
    return
  } else {
    req.session.bn = bn
  }
  try {
    //查询数据库
    let books = await book.queryLike(req.body.bn)
    if (books.length > 0 && Array.isArray(books)) {
      let relArr = books.map(e => {
        return {
          bn: e.b_name,
          an: e.b_auth
        }
      })
      res.json({
        err: 0,
        msg: "Success",
        state: books.length,
        arr: relArr
      })
    } else {
      res.json({
        err: 1,
        msg: "Sorry~~ 没有库存，老叶正竭尽全力为您挖掘，请与60秒后再来!"
      });
    }

    spiderBook(req.body.bn);
    async function spiderBook(bnLike) {

      //spider爬取搜索结果,并直接爬取目录及章节内容
      log.pro(0)
      let {
        err,
        relArr,
        msg
      } = await dingdiann.search(querystring.stringify({
        keyword: bn
      }));
      if (err == 1) {
        throw new Error(msg)
      };
      let books = await book.queryLike(bnLike),
        ra = [];
      if (books.length == relArr.length && books.length > 0 && relArr.length > 0) {
        return
      } else {
        if (!books.length) {
          ra.push(...relArr)
        } else {
          ra.push(relArr.filter((e, index) => {
            return (books[index].b_name != e.bn || books[index].b_auth != e.an)
          }))
        }
      }
      if (ra.length >= 1) {
        ra.forEach(async e => {
          let path = pathLib.resolve("depot", e.bn + '/' + e.an + '/');
          if (!fs.existsSync(path)) {
            fs.mkdirSync(path, {
              recursive: true
            }, (err) => {
              if (err) throw err;
            });
          }
          //小说信息(小说名,作者)入库
          let cr = await book.createBook(e.bn, e.an, new Date(), e.cate, e.bu)
          if (cr.err) {
            console.log(cr.msg);
            throw cr.error
          }
          //获取章节和简介并入库
          log.pro(10)
          let {
            chapterArr,
            desc
          } = await dingdiann.chalist(e.bu)
          //添加简介
          let dr = await book.createdesc(e.bn, e.an, desc);
          if (dr) {
            throw dr.error
          };
          if (chapterArr.length > 0 && Array.isArray(chapterArr)) {
            //遍历章节并爬取到硬盘
            let tArr = [];
            chapterArr.forEach((cvalue, index) => {
              let task = JSON.stringify({
                tcu: cvalue.cu,
                index
              })
              tArr.push(task)
            });
            //队列
            async function run(taskArr) {
              let copyTaskArr = taskArr.slice() //深拷贝任务数组
              let counts = await queue.counts("downloadQueue") //当前队列里的任务数
              if (counts < 50 && counts >= 0) {
                if (taskArr.length > 0) {
                  await queue.addTask("downloadQueue", copyTaskArr.splice(0, 50));
                } else {
                  console.log("任务投递完毕!");
                  return
                }
              }
              run(copyTaskArr)
            }

            run(tArr);
            //运行
            setInterval(async () => {
              let rel = await queue.doTask("downloadQueue"); //采用redis的brpop阻塞
              if (!rel[1]) {
                console.log("redis队列数据提取错误");
                return
              }
              let {
                tcu,
                index
              } = JSON.parse(rel[1]);
              let buf = await dingdiann.dl(tcu) //buffer  
              if (!buf) {
                console.log("章节提取的内容为空啊");
                return
              }
              saveFileWithStream.saveFile(pathLib.resolve(path, index + ".txt"), buf) //后期此处添加失败重试
            }, 30);


            let o = chapterArr.map((d, index) => {
              return {
                c_num: index,
                c_title: d.cn,
                c_path: pathLib.resolve(path, index + ".txt")
              }
            })
            //章节内容物理地址+章节名+index入库
            let r = await book.addChapter(e.bn, e.an, o)
            if (r.err) {
              log.pro(13)
              throw new Error(r.msg)
            }
            log.pro(12)
          } else {
            throw new Error("从网站获取小说章节信息失败")
          }
        });
      } else {
        throw new Error("Sorry~~ 未能找到合适的资源!")
      }
    }
  } catch (error) {
    console.log(error);
    next(error)
  }
};

exports.book = async function (req, res, next) {
  //bn=抬棺匠&an=陈八仙,依据get请求参数查询数据库,数据不存在就返回对方,我们的蜘蛛正在下载您的书籍,请于5分钟后重试
  try {
    let {
      bn,
      an,
      p
    } = req.query;
    if (!an || !bn) {
      res.redirect('/search');
      return
    };
    let pp = Number(p)
    if (pp < 0 || Number.isNaN(pp)) {
      pp = 0
    }
    let rel = await book.queryBook(bn, an)
    if (!rel) {
      res.redirect('/search');
      return
    };
    if (!Array.isArray(rel.b_chapterList)) {
      throw new Error("从数据库获取小说章节信息失败")
    };
    if (rel.b_chapterList.length == 0) {
      throw new Error("从数据库获取小说章节信息数据为空")
    }
    let list = rel.b_chapterList.map(e => {
      return {
        c_num: e.c_num,
        c_path: e.c_path,
        c_title: e.c_title
      }
    })
    let pagination = new Array(),
      la = list.length;
    let page = Math.ceil(la / 16)
    for (let i = 0; i < page; i++) {
      pagination.push(list.slice(i * 16, Math.min((i + 1) * 16, la)))
    }
    if (pp > pagination.length) {
      pp = pagination.length
    }
    if (pagination.length == 0 || pagination[pp].length == 0) {
      throw new Error("分页失败!!")
    }
    let chapterList = (pagination[pp]).map(e => {
      //href:/book?bn=开天录&an=血红&num=0
      return {
        href: "/reading?bn=" + bn + "&an=" + an + "&num=" + e.c_num,
        title: e.c_title,
        ms: Math.random() + 's'
      }
    })
    if (chapterList.length > 8) {
      chapterList1 = chapterList.slice(0, 8)
      chapterList2 = chapterList.slice(8)
    } else {
      chapterList1 = chapterList
      chapterList2 = null
    }
    res.render('book.html', {
      bookName: bn,
      bookAuth: an,
      bookDesc: rel.b_desc,
      pageMax: pagination.length - 1,
      chapterList1,
      chapterList2
    })
  } catch (error) {
    next(error)
  }
};

exports.readBook = async function (req, res, next) {
  let {
    an,
    bn,
    num
  } = req.query
  if (!an || !bn || !num) {
    res.redirect("/search")
    return
  };
  if (num < 0 || !Number(num)) {
    num = 0
  };
  try {
    let rel = await book.queryBook(bn, an),
      pn = Math.floor(Number(num) / 16);
    if (rel.b_chapterList.length < 1) {
      //前台的url参数有误，重定向至搜索页
      res.redirect("/search")
      return
    };
    let o = (rel.b_chapterList).filter(e => e.c_num == num)
    if (o.length < 1) {
      //最后一章阅读页下一章跳转至目录页
      res.redirect(`/book?an=${an}&bn=${bn}&p=${pn}`)
      return
    };
    fs.readFile(o[0].c_path, (err, data) => {
      //err:no such file or directory, open 'path' 后期针对这种错误服务器重新爬取
      if (err) throw err
      let text = data.toString();
      res.render('bookRead.html', {
        bookName: rel.b_name,
        bookAuthor: rel.b_auth,
        chapterName: o[0].c_title,
        lc: `/reading?an=${an}&bn=${bn}&num=${Number(num)-1}`,
        nc: `/reading?an=${an}&bn=${bn}&num=${Number(num)+1}`,
        cl: `/book?an=${an}&bn=${bn}&p=${pn}`,
        readText: text,
        wordCount: text.length
      })
    })
  } catch (error) {
    console.log(error);
    next(error)
  }
};

exports.bookList = async function (req, res, next) {
  let {
    an,
    bn
  } = req.query
  if (!an || !bn) {
    res.redirect('/search');
    return
  };
  an = decodeURI(an)
  bn = decodeURI(bn)
  console.log(decodeURI(an), decodeURI(bn));
  let rel = await book.queryBook(bn, an)
  if (!rel) {
    res.redirect('/search');
    return
  }
  let list = rel.b_chapterList.map(e => {
    return {
      c_num: e.c_num,
      c_title: e.c_title
    }
  })
  try {
    await fs.readFile(pathLib.resolve("views/bookChapter.html"), (err, buf) => {
      if (err) {
        console.log(err);
        next(err)
      };
      var div = buf.toString()
      res.send({
        err: 0,
        div,
        list,
        msg: "Success"
      });
    })
  } catch (error) {
    console.log(error);
    next(error)
  }
};
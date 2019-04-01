const Book = require("../model").Book;
const Mongoose = require("../model").mongoose;

//***************************************增************************************************//
// 新增书籍
exports.createBook = async function (name, auth, cTime, cate, b_path) {
  const session = await Mongoose.startSession();
  let a = await findBook(name, auth);
  if (a) {
    return {
      err: 1,
      msg: "小说已入库，请勿重复提交！",
      error: new Error("小说已入库，请勿重复提交！")
    };
  }
  try {
    await session.startTransaction();
    await new Book({
      b_name: name,
      b_auth: auth,
      b_cTime: cTime,
      b_path
    }).save({
      session
    });
    await session.commitTransaction();
    session.endSession();
    return {
      err: 0,
      msg: "成功"
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return {
      err: 1,
      msg: "小说入库失败",
      error
    };
  }
};
// 添加章节列表
exports.addChapter = async function (name, auth, list) {
  const session = await Mongoose.startSession();
  try {
    await session.startTransaction();
    let o = await findBook(name, auth);
    if (!o) {
      return {
        err: 1,
        msg: "该小说章节未入库",
        error: new Error("该小说章节未入库")
      }
    };
    o.b_chapterList.push(...list);
    o.b_uTime = new Date();
    o.b_cha_li_all = o.b_chapterList.length;
    o.b_state = 0
    await o.save({
      session
    });
    await session.commitTransaction();
    session.endSession();
    return {
      err: 0,
      msg: "章节列表存入数据成功"
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    return {
      err: 1,
      msg: "章节列表存入数据失败"
    };
  }
};
exports.createdesc = async function (name, auth, desc) {
  let o = await findBook(name, auth);
  if (!o) {
    return {
      err: 1,
      msg: "该小说简介未入库",
      error: new Error("该小说简介未入库")
    }
  };
  o.b_desc = desc
  const session = await Mongoose.startSession();
  session.startTransaction();
  try {
    await o.save({
      session
    });
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return {
      err: 1,
      msg: "简介写入失败",
      error
    }
  }

}
//***************************************删************************************************//


//***************************************改************************************************//
//更新状态改变
exports.changeState = async function (bn, an, state) {
  try {
    let o = await Book.findOne({
      b_name: bn,
      b_auth: an
    }, {
      b_state: 1
    });
    let session = await Mongoose.startSession();
    session.startTransaction();
    if (o.b_state >= 5) {
      o.b_state = -1
    }else{o.b_state += state}
    await o.save({
      session
    });
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error
  }


}

//***************************************查************************************************//
// 查找书籍
//查询指定作者写的指定小说（唯一查询）
async function findBook(name, auth) {
  return await Book.findOne({
    b_name: name,
    b_auth: auth
  });
};
exports.queryBook = findBook
//根据小说名查询
exports.queryBooks = async function (name) {
  return await Book.find({
    b_name: name
  })
}
//查询全部
exports.queryAll = async function () {
  return await Book.find({
    "b_state": {
      $gte: 0
    }
  }, {
    b_name: 1,
    b_auth: 1,
    b_cha_li_all: 1,
    b_path: 1
  })
}
//模糊查询
exports.queryLike = async function(name){
  return await Book.find({
    b_name: {"$regex" : name, "$options" : "$i"}
  })
}
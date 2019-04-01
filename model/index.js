const mongoose = require('mongoose');
const config = require("../config/service");

mongoose.connect(config.mongodb_default, {
  useNewUrlParser: true
}, err => {
  if (err) {
    console.log("连接失败");
    throw err
  } else {
    console.log("连接成功");
  }
});

require('./model_user');
require('./model_shelf');
require("./model_category");
require('./model_book');

exports.User = mongoose.model('User');
exports.Shelf = mongoose.model('Shelf');
exports.Category = mongoose.model('Category');
exports.Book = mongoose.model('Book');
exports.mongoose = mongoose
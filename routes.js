const express = require('express');
var router = express.Router();
const Book = require('./API/002/main');

//session中间件
router.use(Book.checkedSession);
//主页面渲染
router.get('/',Book.home);
router.get('/search', Book.searchPge);
router.post('/search', Book.searchBook);
router.use('/book', Book.book);
router.get('/reading', Book.readBook);
router.get('/read/list', Book.bookList)

module.exports = router
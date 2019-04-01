var saveBook = {
  'name': '抬棺匠',
  'pid': 0
}

// 判断用户是否已有阅读记录
if (storageLoad('抬棺匠')) {
  $('body').attr('title', storageLoad('抬棺匠').pid)
} else {
  storageSave(saveBook);
  $('body').attr('title', 1)
}

// 本地缓存
function storageSave(objectData) {
  localStorage.setItem(objectData.name, JSON.stringify(objectData));
}

function storageLoad(objectName) {
  if (localStorage.getItem(objectName)) {
    return JSON.parse(localStorage.getItem(objectName))
  } else {
    return false
  }
}
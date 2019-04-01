/**
 * 异步任务队列：
 *
 * @param fnArr 待执行任务，可以为任务数组
 *
 * @param list 任务列表
 * @param setcount 最高并发数
 * @param ps 任务队列状态
 * 
 * @returns 返回类本身，方便链式调用
 */
class myQueue {
  constructor(setcount) {
    this.list = []; //任务列表
    this.js = 0; //当前运行任务数
    if (setcount == 0 || typeof setcount != 'number') this.count = 1;
    this.count = setcount; //最高并发数
    this.ps = false; //暂停
  }
  //清空队列
  clear() {
    this.list.length = 0;
    return this
  }
  //暂停任务队列
  pause() {
    this.ps = true;
  }
  //恢复任务队列
  recovery() {
    this.ps = false;
    run();
  }
  //创建优先级任务
  set(fnArr) {
    this.list.unshift(...fnArr);
    return this;
  }
  //创建任务并启动
  set_run(fnArr) {
    this.list.push(...fnArr);
    this.run();
    return this;
  }
  //查询任务数
  get() {
    return this.list.length;
  }
  //启动，仅供内部调用
  run() {
    if (!this.ps) {
      //最高并发数-当前运行任务数=可以运行的任务数
      var i = this.count - this.js;
      var p;
      //保存可运行任务
      var k = [];
      //可以运行的任务数-任务数组长度<0的话
      //取可以运行的任务数 否则取任务数组长度
      i - this.list.length > 0 ? p = this.list.length : p = i;
      //循环写入可运行任务到数组K
      while (p) {
        k.push(this.list.shift() || function () {});
        p--;
      }
      (function (obj) {
        k.forEach(async function (item) {
          obj.js++;
          await item()
          if (obj.get() && obj.js--) {
            if (obj.count - obj.js > 0 && obj.ps == false)
              obj.run();
          }
        });
      })(this)
    }
  }
}

module.exports = myQueue
/**
 * 内存总占用查询
 * @returns total:总内存;
 *          used:已使用内存;
 *          ratio:占比
 */
const os = require("os");
exports.calcMem = function () {
  let mem_total = os.totalmem(),
    mem_free = os.freemem(),
    mem_used = mem_total - mem_free,
    mem_ratio = 0;
  mem_total = (mem_total / (1024 * 1024 * 1024)).toFixed(1); //总内存 G
  mem_used = (mem_used / (1024 * 1024 * 1024)).toFixed(1); //已使用内存 G
  mem_ratio = parseInt((mem_used / mem_total) * 100); //占比
  return {
    total: mem_total,
    used: mem_used,
    ratio: mem_ratio
  };
}
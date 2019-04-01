const Redis = require('ioredis');
let client = new Redis(6379, "127.0.0.1");

client.on("ready", async () => {
    console.log("本地Redis : 连接成功");
});
client.on("error", (err) => {
    if (err) {
        console.log("本地Redis : 连接失败 error:", err);
        throw (err)
    }
});

exports.addTask = async function (taskName, taskArr) {
  try {
    await client.lpush(taskName, ...taskArr);
  } catch (error) {
    console.log(error);
    throw error
  }
};

exports.doTask = async function (taskName) {
  try {
    return await client.brpop(taskName, 5000)
  } catch (error) {
    console.log(error);
    throw error
  }
};

exports.counts = async function (taskName) {
  return await client.llen(taskName)
}
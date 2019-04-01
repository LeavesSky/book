var moment = require('moment');
module.exports = {
  apps: [{
    name: "app",
    script: "./app.js",
    watch: true,
    ignore_watch: [ // 从监控目录中排除
      "node_modules",
      "logs",
      "depot"
    ],
    error: "./logs/system/app-err" + moment().format("YYYY-DD-MM") + ".log", // 错误日志路径
    output: "./logs/system/app-out.log", // 普通日志路径
    env: {
      NODE_ENV: "development",
    },
    env_test: {
      NODE_ENV: "test",
    },
    env_production: {
      NODE_ENV: "production",
      //REMOTE_ADDR: "http://www.example.com/"
    }
  }],

  deploy: {
    production: {
      user: 'node',
      host: '212.83.163.1',
      ref: 'origin/master',
      repo: 'git@github.com:repo.git',
      path: '/var/www/production',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
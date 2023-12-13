## Cloud I Wanna 联机服务

#### 部署到服务器

1. 安装依赖

```shell
npm install
```

2. 创建配置文件 `config.js`，参考 `config.template.js`

```js
// config.js
module.exports = {
  // 最大连接数量
  maxConnections: 1000,

  // 数据更新间隔, 例如每2帧推送一次数据. 若服务器性能有限(或者在意流量费), 可适当提高此数值
  updateInterval: 2,

  // 检查请求来源，开启后将仅处理来自 Cloud I Wanna 客户端的请求
  checkOrigin: true,

  // 服务器端口号
  port: 3738,

  // https 选项, 需要时设置
  /* 示例:
  https: {
    key_file_name: 'key.pem',
    cert_file_name: 'cert.pem',
  },*/

  // 输出日志级别 warn | info | verbose
  logLevel: 'info'
};
```

3. 运行服务

```shell
npm start
```

推荐使用 [pm2](https://pm2.io/) 进行管理，参考配置：

```js
{
  name: "ciw-po",
  script: "/path/to/repository/server.js",
  cwd: "/path/to/repository/",
  watch: true,
  ignore_watch: ['.git', 'logs', 'node_modules'],
  error_file: '/path/to/repository/logs/err.log',
  out_file: '/path/to/repository/logs/out.log'
}
```
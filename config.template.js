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
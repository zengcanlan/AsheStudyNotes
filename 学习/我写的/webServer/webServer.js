'use strict'

/* 引入包 */
var http = require('http');
var https = require('https');
// 用于读取本地文件
var fs = require('fs');
// 封装了http https服务模块
var express = require('express');
// 将文件夹中的内容显示到浏览器上, 这个包是外面的,需要npm去安装
var serveIndex = require('serve-index');

var app = express();

// 将当前目录下的public发布为静态网页
app.use(serveIndex('./public'));
app.use(express.static('./public'));

var options = {
  key: fs.readFileSync('./ashe_fun_cert/ashe.fun.key'),
  cert: fs.readFileSync('./ashe_fun_cert/ashe.fun_bundle.pem')
};

var httpServer = http.createServer(app).listen(80, "0.0.0.0");
var httpsServer = https.createServer(options, app).listen(443, "0.0.0.0");

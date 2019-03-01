## 仿微博简易系统（nodeJs）
---

## 前言
仿微博简易系统，用到的技术栈
> nodejs + express + ejs + bootstrap + formidable + session + mongodb
1. 其中app.js 负责调用方法，router.js负责业务处理。
2. 其中数据库的操作和md5加密分别封装了两个模块，分别是dbMain.js和md5.js

## 一.实现功能
1. 用户的登录和注册 （实现md5加密）；将用户信息存入mongodb数据库中
2. 使用session对用户密码进行管理；访问需要登录后才能继续操作的所有页面时，如果用户没有登录则提示未登录，登录后才执行后续操作。
3. 使用cropper.js进行图片的裁剪；并用formidable进行图片上传，使用户可以裁剪更换头像

## 二.项目结构分析
> avatar/---- 保存用户头像图片   
  models/---- 保存自己封装的模块   
  -------- dbMain.js  数据库的操作    
  -------- md5.js md5加密
  public/---- 保存需要调用的静态资源目录（css，js，fonts）    
  router/---- 保存路由文件    
  views/----  保存ejs模板文件    
  app.js ----- 项目人口文件    
  setting.js ----- 配置数据库地址

## 三.开发过程问题汇总
---
### 1.在node中使用session   
  ```
  var session = reqiure("express-session");
  ```
  设置或读取
  ```
  app.use(session({
    secret: 'sessiontest',//与cookieParser中的一致
    resave: true,
    saveUninitialized:true
  }));
  ```
---
### 2.使用md5就行密码的加密（node中自带了一个模块，叫做crypto模块，负责加密。）

引入"md5模块"
```
var md5 = require("../models/md5.js");
```
封装md5加密模块源代码；需引入"crypto";
```
var crypto = require('crypto');
//使用md5就行密码的加密
module.exports=function(str){
    //多次加密防止破解
    return cyt(cyt(str).substr(11,7)+cyt(str));
}

function cyt(str){//对字符串加密
    const hash = crypto.createHash('md5');
    return hash.update(str).digest('base64');
}
```
---
### 3.基于cropper.js的图片上传和裁剪 （此处采用前端处理裁剪后获得base64的图片url数据；也可以获取坐标大小等信息传入后端进行处理）
引入相关的css和js文件,cropper.min.css，ImgCropping.css，cropper.min.js等
> 将业务处理的代码单独新建一个public/js/upInfo.js文件   
  html代码在views/upInfo.ejs中

由于裁剪后得到的是base64的图片url数据；需要将以base64的图片url数据转换为Blob
```
/**
* 将以base64的图片url数据转换为Blob
* 用url方式表示的base64图片数据
*/
function convertBase64UrlToBlob(urlData) {

    var bytes = window.atob(urlData.split(',')[1]);        //去掉url的头，并转换为byte

    //处理异常,将ascii码小于0的转换为大于0
    var ab = new ArrayBuffer(bytes.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
    }

    return new Blob([ab], { type: 'image/png' });
}
```

$("form").serialize()只能序列化数据，不能序列化文件; 手动将转换后的图片存uploadFormData中
```
//序列化表单，$("form").serialize()只能序列化数据，不能序列化文件
var uploadFormData = new FormData($('#uploadForm')[0]);

if (cutUrl) { //如果用户更换了头像将头像加入uploadFormData中
    uploadFormData.append("avatarName", cutUrl);  
    //append函数的第一个参数是后台获取数据的参数名,和html标签的input的name属性功能相同
}
$.ajax({
    url: "./doUpInfo",
    type: "POST",
    data: uploadFormData,
    processData: false,
    contentType: false,
    async: false,
    success: function (result) {

    }
})
```

----

### 3.header头部共用
可采用ejs的 include 将公共的头部引入各个页面
```
<% include header.ejs %>
```

----
### 4.nodejs中的文件路径
> __dirname： 获得当前执行文件所在目录的完整目录名    
__filename： 获得当前执行文件的带有完整绝对路径的文件名    
process.cwd()：获得当前执行node命令时候的文件夹目录名

path.normalize(path)    
该方法会规范给定的路径，并解析'..'和'.'片段。同时还能去掉多余的斜杠；返回的是规范化之后的路径字符串。

参考：[node模块 本地路径处理](https://www.jianshu.com/p/8885485ca633)

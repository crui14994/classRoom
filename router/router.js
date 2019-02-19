var formidable = require('formidable');
var md5 = require("../models/md5.js");
var db = require("../models/dbMain.js");

//首页
exports.showIndex = function (req, res, next) {
    //检测用户是否登录
    if (req.session.login == "1") {
        //如果登陆了
        var userName = req.session.userName;
        var login = true;
    } else {
        var userName = "";
        var login = false;
    }
    res.render("index", {
        "login": login,
        "userName": userName,
        "active": "index"
    });
};

//注册页
exports.register = function (req, res, next) {
    res.render("register", {
        "login": req.session.login == "1" ? true : false,
        "userName": req.session.login == "1" ? req.session.userName : "",
        "active": "register"
    });
};

//执行注册
exports.doRegist = function (req, res, next) {
    //使用表单上传组件获取传入参数
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //加密后的密码
        var userPassword = md5(fields.userPassword);
        var userName = fields.userName;
        //查询数据库中有没有此用户，如果有则返回-3，没有则把此用户信息加入数据库中
        db.find("classRomm", { "userName": userName }, "user", {}, function (err, result) {
            if (err) {
                res.send("0"); //查询失败
                return;
            }
            if (result.length != 0) {
                res.send("-3"); //用户已存在！
                return;
            } else {
                //插入数据库
                db.insertOne("classRomm", { "userName": userName, "userPassword": userPassword }, "user", function (err, result) {
                    if (err) {
                        res.send("0"); //访问数据库失败
                        return;
                    }
                    //注册成功后将用户名存入session中
                    req.session.login = "1";
                    req.session.userName = userName;
                    res.send("1"); //注册成功！
                })
            }
        })

    });
    return;
}

//执行登录
exports.dologin = function (req, res, next) {
     //使用表单上传组件获取传入参数
     var form = new formidable.IncomingForm();
     form.parse(req, function (err, fields, files) {
         //加密后的密码
         var uPassword = md5(fields.uPassword);
         var uName = fields.uName;
        //查询数据库中有没有此用户，如果有则返回-3
        db.find("classRomm", { "userName": uName }, "user", {}, function (err, result) {
            if (err) {
                res.send("0"); //查询失败
                return;
            }
            if (result.length == 0) {
                res.send("-3"); //用户不存在！
                return;
            }
            if(uPassword == result[0].userPassword){
                //登录成功后将用户名存入session中
                req.session.login = "1";
                req.session.userName = uName;
                res.send("1"); //登录成功！
            }else{
                res.send("-2"); //请重新输入密码！
            }
        })
     });
     return;
}
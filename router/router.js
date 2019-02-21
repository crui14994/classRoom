var formidable = require('formidable');
var md5 = require("../models/md5.js");
var db = require("../models/dbMain.js");
var fs = require("fs");
var path = require("path");

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
    //检索数据库，查登陆这个人的头像
    db.find("classRomm", { "userName": userName }, "user", {}, function (err, result) {
        if (err) {
            res.send("0"); //查询失败
            return;
        }
        //如果没有查询到则说明没有登录，则使用默认头像
        if (result.length == 0) {
            var avatar = "default.png";
        } else {
            var avatar = result[0].avatar;
        }
        res.render("index", {
            "login": login,
            "userName": userName,
            "active": "index",
            "avatar": avatar
        });
    })

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
                db.insertOne("classRomm", {
                    "userName": userName,
                    "userPassword": userPassword,
                    "avatar": "default.png"  //默认头像
                }, "user", function (err, result) {
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
            if (uPassword == result[0].userPassword) {
                //登录成功后将用户名存入session中
                req.session.login = "1";
                req.session.userName = uName;
                res.send("1"); //登录成功！
            } else {
                res.send("-2"); //请重新输入密码！
            }
        })
    });
    return;
}

//修改信息页面
exports.upInfo = function (req, res, next) {
    if (req.session.login != "1") {
        res.send("未登录，请先登录！");
        return;
    }
    //查询数据库用户的头像
    db.find("classRomm", { "userName": req.session.userName }, "user", {}, function (err, result) {
        if (err) {
            res.send("0"); //查询失败
            return;
        }
        var avatar = result[0].avatar;
        res.render("upInfo", {
            "login": true,
            "userName": req.session.userName,
            "active": "upInfo",
            "avatar": avatar
        });
    })
}

//执行修改
exports.doUpInfo = function (req, res, next) {
    //使用表单上传组件获取传入参数
    var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + "/../avatar");
    form.keepExtensions = true;
    form.parse(req, function (err, fields, files) {
        var userSignature = fields.userSignature;//个性签名
        //如果修改了头像将头像更名存入avatar中
        if (files.avatarName) {
            var filePath = files.avatarName.path;
            fs.rename(filePath, path.normalize(__dirname + "/../avatar/") + req.session.userName + ".png", function (err) {
                if (err) {
                    throw err;
                    return;
                }
                // 在数据库中更新头像
                db.updateMany("classRomm", "user", { "userName": req.session.userName }, { $set: { "avatar": req.session.userName + ".png" } }, function (err, result) {
                    if (err) {
                        res.send("-1"); //修改头像失败
                        return;
                    }
                })
            })
        }
        // 在数据库中更新个性签名
        db.updateMany("classRomm", "user", { "userName": req.session.userName }, { $set: { "userSignature": userSignature} }, function (err, result) {
            if (err) {
                res.send("-2"); //修改失败
                return;
            }
        }
        )
        res.send("1"); //成功修改个人信息
    });
}

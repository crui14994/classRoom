var express = require("express");
var app = express();
var router = require("./router/router");
var session = require("express-session");

app.use(session({
    secret: 'sessiontest',//与cookieParser中的一致
    resave: true,
    saveUninitialized: true
}));

//模板引擎
app.set("view engine", "ejs");

//静态页面
app.use(express.static("./public"));
app.use(express.static("./avatar"));

//路由表
app.get("/", router.showIndex);
app.get("/register", router.register);
app.post("/doregist", router.doRegist); 
app.post("/dologin", router.dologin);
app.get("/upInfo", router.upInfo);
app.post("/doUpInfo", router.doUpInfo);

app.listen(3000); 
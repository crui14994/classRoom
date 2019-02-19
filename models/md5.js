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
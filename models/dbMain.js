var MongoClient = require('mongodb').MongoClient;
var setttings = require("./../setting.js");
//连接数据库
function _connectDB(callback){

    var url = setttings.url;
    MongoClient.connect(url,function(err, db){
        callback(err, db);
    })
}

//插入一条数据 ，
//4个参数，数据库名称，增加什么，往哪个集合中增加，增加之后做什么
exports.insertOne=function(dbName,json,collectionName,callback){
    //连接数据库
    _connectDB(function(err, db){
        //插入一条数据
        if(err){
            callback(err,null);
            db.close();
            return;
        }
        db.db(dbName).collection(collectionName).insertOne(json, function(err, result) {
            callback(err, result);
            db.close();
        });
    })
}

//插入多条数据
exports.insertMany=function(dbName,date,collectionName,callback){
    _connectDB(function(err, db){
        if(err){
            callback(err,null);
            db.close();
            return;
        }
        db.db(dbName).collection(collectionName).insertMany(date,function(err,result){
            callback(err,result);
            db.close();
        })
    })
    
}

//查询数据,
//6个参数，数据库名称，conditions查询条件，在哪个集合中查询，排序方式，C,D 分页设置或者回调函数
exports.find=function(dbName,conditions,collectionName,sort,C,D){
    var resultArr = [];
    if(arguments.length==5){
         //那么没有设置分页，查询所有数据；参数C就是callback，参数D没有传。
         var callback = C;
         var skipnumber = 0;
         var limit = 0;
    }else if(arguments.length==6){
        //设置分页；参数C就是args，参数D是callback。
        //args是个对象{"pageamount":3,"page":2}
        var args = C;
        var callback =D;
        var skipnumber = args.pageamount * (args.page-1) || 0;
        var limit = args.pageamount || 0;
    }else{
        throw new Error("find函数的参数个数，必须是5个，或者6个。");
        return;
    }
    //连接数据库
    _connectDB(function(err, db){
        db.db(dbName).collection(collectionName).find(conditions).skip(skipnumber).limit(limit).sort(sort).toArray(function(err,result){
            if(err){
                callback(err,null);
                db.close();
                return;
            }
            callback(err,result);
            db.close();
        })
    })
}

//删除数据
// 数据库名称,集合名称,conditions查询要删除数据的条件
exports.deleteMany=function(dbName,collectionName,conditions,callback){
    _connectDB(function(err, db){
        if(err){
            callback(err,null);
            db.close();
            return;
        }
        db.db(dbName).collection(collectionName).deleteMany(conditions,function(err,result){
            callback(err,result);
            db.close();
        })
    })
}


//修改数据
// 数据库名称,集合名称,查询条件, 修改数据
exports.updateMany=function(dbName,collectionName,whereStr,updateStr,callback){
    _connectDB(function(err, db){
        if(err){
            callback(err,null);
            db.close();
            return;
        }
        db.db(dbName).collection(collectionName).updateMany(whereStr, updateStr,function(err,result){
            callback(err,result);
            db.close();
        })
    })
}


exports.getAllCount = function (dbName,collectionName,callback) {
    _connectDB(function (err, db) {
        if(err){
            callback(err,null);
            db.close();
            return;
        }
        db.db(dbName).collection(collectionName).count({}).then(function(count) {
            callback(count);
            db.close();
        });
    })
}
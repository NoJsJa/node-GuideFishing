/**
 * Created by yangw on 2017/2/20.
 * 用户登录系统模式
 */

var mongoose = require('./tools/Mongoose.js');
var getDate = require('./tools/GetDate.js');
var userSchema = require('./db_schema/user_schema').userSchema;

function User(info) {

    // 即将存储的数据
    this.userData = {
        account: info.account || '--broke--',
        password: info.password || '--broke--',
        root: info.root || false,
        purchasedCourse: [],
        purchasedTest: []
    };
}

/* 存储一个用户数据 */
User.prototype.save = function (callback) {

    var db = mongoose.connection;
    var User = mongoose.model('user', userSchema);

    // 检查用户是否已经存在
    User.userCheck({account: this.userData.account}, function (err, isExit) {

        if(err){
            console.log('[error]用户查询出错：' + err);
            return callback(err);
        }
        if(isExit){
            callback(null, false);
        }else {
            // 存储用户数据
            var newUser = new User(this.userData);
            newUser.save(function (err, doc) {
                if(err){
                    console.log('[error]用户存储出错：' + err);
                    return callback(err);
                }
                console.log('用户信息成功存储！');
                callback(null, true);
            });
        }
    })

};

/* 验证用户是否存在 */
User.userCheck = function (condition, callback) {

    var db = mongoose.connection;
    var User = mongoose.model('user', userSchema);

    var query = User.findOne();
    query.where(condition);
    query.exec(function (err, doc) {
       if(err){
           console.log('[error]验证出错：' + err);
           return callback(err);
       }
       if(doc){
           console.log('[tips]用户已经存在！');
           callback(null, true);
       }else {
           callback(null, false);
       }
    });
};

/* 用户登录 */
User.signin  = function (con, callback) {

    var db = mongoose.connection;
    var User = mongoose.model('user', userSchema);

    var condition = {
        account: con.account || null,
        password: con.password || null
    };

    var query = User.findOne();
    query.exec(function (err, doc) {
        if(err){
            console.log('[error]用户登录出错！');
            return callback(err);
        }
        if(doc){
            // 登录成功
            callback(null, true);
        }else {
            // 登录失败
            callback(null, false);
        }
    });

    User.where(condition);
};

/* 存储一条购买记录 */
User.purchase = function (condition,callback) {

    var db = mongoose.connection;
    var User = mongoose.model('user', userSchema);

    var query = User.findOne();
    query.where({
        account: condition.account
    });

    query.exec(function (err, doc) {

        if(err){
            console.log('[error]购买存储出错！');
            return callback(err);
        }
        if(doc){
            condition.data.date = getDate();

            var updateAction = {
                    $push: {purchasedItem: condition.data}
            };

            doc.update(updateAction).exec(function (err, doc) {

                if(err){
                    console.log('[error]购买存储出错！');
                    return callback(err);
                }
                // 购买信息存储成功
                callback(null, true);
            });
        }else {
            var error = new Error('用户信息有误！');
            callback(error);
        }
    });
};

/* 验证购买记录 */
User.purchaseCheck = function (condition, callback) {

    var db = mongoose.connection;
    var User = mongoose.model('user', userSchema);
    
    var query = User.findOne();
    query.where({
       account: condition.account
    });
    query.exec(function (err, doc) {
        if(err){
            console.log('[error]验证购买出错！');
            return callback(err);
        }
        if(doc){

            for(let item in doc.purchasedItem){
                if(item.itemName == condition.data.itemName &&
                    item.type == condition.data.type){
                    // 已经购买
                    return callback(null, true);
                }
            }

            return callback(null, false);
        }else{
            var error = new Error('用户信息有误！');
            callback(error);
        }
    });

};
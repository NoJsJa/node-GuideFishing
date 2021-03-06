/**
 * 主页路由*/

/* 引入数据库模式 */
var AllTest = require('../models/AllTest.js');
/* 中英转换 */
var EnToCn = require('../models/EnToCn');
var ReadTestType = require('../models/ReadTypeImg');

function index(app) {

    /* 获取评测主页 */
    app.get('/test/index', function (req, res) {
        res.render('test_index', {
            title: '评测系统主页',
            slogan: '带渔',
            other: '测评',
            testType: "ALL"
        });
    });

    // 获取测评主页并预先载入相关 类型的数据
    app.get('/test/index/:testType', function (req, res) {

        res.render('test_index', {
            title: "课程主页",
            slogan: "启航",
            other: "课程",
            testType: req.params.testType
        });
    });

    /* 获取评测类型 */
    // 获取课程类型和中文
    app.post('/test/testType', function (req, res) {

        res.json( JSON.stringify({
            isError: false,
            // 转化为字符串类型
            // 测试类型对应中文
            testTypeChina: EnToCn.getAllPattern("testType")
        }) );
    });

    /* 读取评测列表,以JSON对象对象数组传递 */
    app.post('/test/readList', function (req, res) {

        var condition = {};
        // 图片地址
        var typeImgUrl = {};
        // 读取地址
        var readUrl = './public/images/testType/';
        // 返回的静态地址
        var visitUrl = '/images/testType/';
        ReadTestType(readUrl, visitUrl, function (data) {
            typeImgUrl = data;
        });
        if(req.body.testTitle) {
            condition.testTitle = req.body.testTitle;
        }
        //筛选的读取题目类型
        if(req.body.testType != "ALL"){
            condition.testType = req.body.testType;
        }
        if(req.body.skip){
            condition.skip = Number.parseInt(req.body.skip);
        }
        if(req.body.limit){
            condition.limit = Number.parseInt(req.body.limit);
        }
        if(req.body.select){
            condition.select = req.body.select;
        }
        if(req.body.testTypeArray){
            condition.testTypeArray = req.body.testTypeArray;
        }

        console.log('read list condition' + JSON.stringify(condition));

        AllTest.readList(condition, function (err, testArray) {
           if(err) {
               console.log('readList error.');
               return res.json(JSON.stringify({
                   error: err,
                   testArray: []
               }));
           }
           console.log('readList success.');
            res.json(JSON.stringify({
                testArray: testArray,
                testTypeChina: EnToCn.getAllPattern('testType'),
                typeImgUrl: typeImgUrl
            }));
        });
    });

    /* 读取首页图片 */
    app.post('/test/readSlideImage', function (req, res) {

        // 读取地址
        var readUrl = './public/images/testSlide/';
        // 返回的静态地址
        var visitUrl = '/images/testSlide/';
        ReadTestType(readUrl, visitUrl, function (data) {

            if(data){

                var imageArray =  [];
                for(var image in data){
                    imageArray.push({
                       text: image,
                        imageUrl: data[image]
                    });
                }
                res.json( JSON.stringify({
                    slideImageArray: imageArray,
                    isError: false
                }) );
            }else {
                res.json( JSON.stringify({
                    isError: true,
                    error: data
                }) );
            }
        });
    });

    /* 读取热门内容列表 */
    app.post('/test/readHot', function (req, res) {

        // 获取热门数据
        AllTest.getPopular(function (err, popularArray) {

            if(err){
                console.log('获取课程热门数据出错!');
                return res.json( JSON.stringify({
                    isError: true,
                    error: err
                }) );
            }

            for(var i = 0; i < popularArray.length; i++){
                popularArray[i].preDress = '/test/detail/';
            }

            // 返回数据
            res.json( JSON.stringify({
                isError: false,
                popularArray: popularArray
            }) );
        });
    });
}

module.exports = index;
































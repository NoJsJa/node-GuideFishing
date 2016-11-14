/**
 * Created by yangw on 2016/11/8.
 * 带渔课程路由管理
 */

/* 课程模型 */
var Course = require('../models/Course');
/* 读取磁盘图片数据形成地址 */
var ReadCourseImg = require('../models/ReadTypeImg');
/* 获取当前时间和日期 */
var getDate = require('../models/tools/GetDate');
/* 获取根目录 */
var locateFromRoot = require('../models/tools/LocateFromRoot');

function course(app){

    // 获取课程主页
    app.get('/course/index', function (req, res) {

        res.render('course_index', {
            title: "课程主页"
        });
    });

    // 获取课程详情介绍页面
    app.get('/course/detail/:courseType/:courseName', function (req, res) {

        // 读取详情条件
        // select 确定选定区间
        // condition 确定筛选条件

        var totalCondition = {
            select: {},
            condition: {}
        };
        totalCondition.condition.courseType = req.params.courseType;
        totalCondition.condition.courseName = req.params.courseName;
        totalCondition.select = {
            courseAbstract: 1,
            clickRate: 1,
            date: 1
        };

        Course.readOne(totalCondition, function (err, data) {

            console.log(data.courseAbstract);
            if(err){
                return res.json( JSON.stringify({
                    title: "课程详情",
                    courseType: "error!!",
                    courseName: "error!!",
                    courseAbstract: "error!!",
                    clickRate: "error!!",
                    date: getDate()
                }) );
            }
            // 读取成功
            res.render('course_detail', {

                title: "课程详情",
                courseType: req.params.courseType,
                courseName: req.params.courseName,
                courseAbstract: data.courseAbstract,
                clickRate: data.clickRate,
                date: data.date
            });
        });
    });
    
    // 获取类型图片
    app.post('/course/detail/readTypeImage', function (req, res) {

        var readUrl = locateFromRoot('/public/images/courseType/');
        var visitUrl = '/images/courseType/';
        ReadCourseImg(readUrl, visitUrl, function (imgArray) {

            res.json(JSON.stringify({
                imageArray: imgArray
            }))
        });
    });
    
    // 获取课程学习页面
    app.get('/course/view/:courseType/:courseName', function (req, res) {

        res.render('course_view', {

            title: "课程学习",
            courseType: req.params.courseType,
            courseName: req.params.courseName
        });
    });

    /* 获取某一个课程的详细内容 */
    app.post('/course/view/readOneCourse', function (req,res) {

        // 查询条件
        var totalCondition = {
            condition: {},
            select: {}
        };
        totalCondition.condition.courseType = req.body.courseType;
        totalCondition.condition.courseName = req.body.courseName;
        // 选择条件
        totalCondition.select = {
            courseContent: 1,
            teacher: 1,
            date: 1
        };

        Course.readOne(totalCondition, function (err, data) {

            console.log(data);
            if(err){
                return res.json(JSON.stringify({
                    error: err
                }));
            }
            res.json(JSON.stringify({
                courseContent: data.courseContent,
                teacher: data.teacher,
                date: data.date
            }));
        });
    });

    // 读取课程列表
    app.post('/course/readCourseList', function (req, res) {

        var condition = {};
        // 课程图片地址
        var typeImgUrl = {};
        // 阅读地址和客户端访问地址
        // locateFromRoot 是当前执行文件的所在地址
        var readUrl = locateFromRoot('/public/images/courseType/');
        var visitUrl = '/images/courseType/';
        ReadCourseImg(readUrl, visitUrl, function (data) {
            typeImgUrl = data;
        });
        if(req.body.courseName) {
            condition.courseName = req.body.courseName;
        }
        //筛选的读取课程类型
        if(req.body.courseType != "ALL"){
            condition.courseType = req.body.courseType;
        }
        if(req.body.skip){
            condition.skip = req.body.skip;
        }
        if(req.body.limit){
            condition.limit = req.body.limit;
        }
        if(req.body.select){
            condition.select = req.body.select;
        }
        if(req.body.courseTypeArray){
            condition.courseTypeArray = req.body.courseTypeArray;
        }

        console.log("筛选条件: " + JSON.stringify(condition));

        Course.readList(condition, function (err, testArray) {
            if(err) {
                console.log('readCourseList error.');
                return res.json(JSON.stringify({
                    error: err,
                }));
            }
            console.log('readCourseList success.');
            res.json(JSON.stringify({
                courseArray: testArray,
                typeImgUrl: typeImgUrl
            }));
        });
    });

}

module.exports = course;
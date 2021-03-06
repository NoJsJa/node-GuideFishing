
/**
 * Created by yangw on 2016/11/8.
 * 课程学习主页
 */

/* 初始化函数 */
$(function () {

    // 初始化观察者
    GuideFishing.sideNav.sideNavContainer = document.querySelector('.side-nav-container');
    nojsja['ObserverPattern'].init(GuideFishing.sideNav.sideNavContainer);
    // 页面事件绑定
    GuideFishing.pageEventBind();
    // 更新课程类型
    GuideFishing.updateCourseType();
    // 更新讨论组信息
    GuideFishing.updateBroadcast({
        limit: 2
    });
    // 更新招聘信息
    GuideFishing.updateRecruitment();
    //加载指定数量的测试题目列表
    GuideFishing.readCourseList({
        courseType: "ALL",
        limit: GuideFishing.pageLimit
    });
    // 更新热门内容
    GuideFishing.updateCourseHot();
    GuideFishing.updateTestHot();
    // 滑动图片初始化
    GuideFishing.buildSlideView();
});

/**
 * [GuideFishing 页面全局变量]
 * */
var GuideFishing = {
    headerDown: false,      //heder是否降下
    scrollOver: false,      //检测页面滚动
    sideNav: {      // 页边导航页事件对象
        isActive: false,        // 是否正在激活
        sideNavContainer: null,     // 缓存的DOM对象
        touch: {        // 移动端触摸数据
            pageStartX: 0,
            pageStartY: 0,
            pageEndX: 0,
            pageEndY: 0
        },
        /**
         * [touchMoveCheck 触摸滑动检测]
         * @param {String} pageEndX [停止坐标X]
         * @param {String} pageEndY [停止坐标Y]
         * */
        touchMoveCheck: function (pageEndX, pageEndY) {
            this.touch.pageEndX = pageEndX;
            this.touch.pageEndY = pageEndY;
            // 向右滑动
            if(Math.abs(pageEndX - this.touch.pageStartX) >
                Math.abs(pageEndY - this.touch.pageStartY) &&
                (pageEndX - this.touch.pageStartX > 0) ){

                if(!this.isActive){
                    return;
                }
                this.sideNavAction['right']();
            }
            // 向左滑动
            if(Math.abs(pageEndX - this.touch.pageStartX) >
                Math.abs(pageEndY - this.touch.pageStartY) &&
                (pageEndX - this.touch.pageStartX < 0) ){

                if(this.isActive){
                    return;
                }
                this.sideNavAction['left']();
            }
        },
        /**
         * [clickCheck 点击检测]
         * */
        clickCheck: function () {
            if(this.isActive){
                this.sideNavAction['right']();
            }else {
                this.sideNavAction['left']();
            }
        },
        /**
         * [sideNavAction 滑动动作]
         * */
        sideNavAction: null,
    },
    lastScrollOver: false,      //检测上次页面滚动的状态
    pageStart: 0,       //页面加载起点
    pageLimit: 4,       //页面加载条数
    courseType: "ALL",      //加载的测试类型
    isClear: false,     //是否清除页面已存数据
    courseTypeChina: {}     // 中英文对应
};

/* 页面主要事件绑定 */
GuideFishing.pageEventBind = function () {

    // 跳转到课程页面
    $('#courseMore').click(function () {
        window.location.href = '/course/classification';
    });

    // 跳转到测评页面
    $('#testMore').click(function () {
        window.location.href = '/test/classification';
    });
    //  跳转到公司招聘页面
    $('#recruitmentMore').click(function () {
        window.location.href = '/recruitment/index';
    });
    // 跳转到讨论组页面
    $('#broadcastMore').click(function(){
        window.location.href = '/course/broadcast/index';
    });

    // 检查登录账户信息
    $('#userInfo').click(function () {

        window.location.href = '/userInfo';
    });

    //顶部和底部跳转
    $('#top').click(GuideFishing.goTop);
    $('#bottom').click(GuideFishing.goBottom);

    // 右边菜单滑动事件
    nojsja['EventUtil'].addHandler($('.nav-trigger')[0], 'click', function () {
        GuideFishing.sideNav.clickCheck();
    });

    // 开始触摸
    var touchStart = function (event) {
        // 函数去抖
        nojsja["FnDelay"](function (_event) {

            var event = nojsja['EventUtil'].getEvent(_event);
            // 阻止浏览器默认的事件
            nojsja['EventUtil'].preventDefault(event);
            // 当前事件手指的坐标
            GuideFishing.sideNav.touch.pageStartX = event.changedTouches[0].pageX;
            GuideFishing.sideNav.touch.pageStartY = event.changedTouches[0].pageY;

        }, 100, false, event);
    };
    // 触摸
    var touchMove = function (event) {

        // 函数去抖
        nojsja["FnDelay"](function (_event) {

            var event = nojsja['EventUtil'].getEvent(_event);
            // 阻止浏览器默认的事件
            nojsja['EventUtil'].preventDefault(event);

            GuideFishing.sideNav.touchMoveCheck(event.changedTouches[0].pageX, event.changedTouches[0].pageY);

        }, 200, false, event);
    };
    // 移动端开始触摸事件
    nojsja['EventUtil'].addHandler($('.nav-trigger')[0], 'touchstart', touchStart);
    nojsja['EventUtil'].addHandler(GuideFishing.sideNav.sideNavContainer, 'touchstart', touchStart);
    // 移动端触摸移动事件
    nojsja['EventUtil'].addHandler($('.nav-trigger')[0], 'touchmove', touchMove);
    nojsja['EventUtil'].addHandler(GuideFishing.sideNav.sideNavContainer, 'touchmove', touchMove);

    /* 页边导航滑动事件 */
    GuideFishing.sideNav.sideNavAction = (function(){

        // 初始化标致
        var init = false;
        // 请求个人数据
        if(!init){
            var url = '/userInfo';
            $.post(url, {}, function (JSONdata) {

                var JSONobject = JSON.parse(JSONdata);
                console.log(JSONobject);
                if(JSONobject.isError){
                    return;
                }
                // 个人信息
                var selfInfo = JSONobject.selfInfo;
                $('.content-info-nickName > span').text(selfInfo.nickName);
                $('.content-info-account').text('Email: ' + selfInfo.account);
                $('.content-info-password').text('Key: ' + selfInfo.password);
                $('.content-info-admin').text('Admin: ' + selfInfo.root);

                init = !init;

            }, "JSON");
        }

        var sideNavContainer = GuideFishing.sideNav.sideNavContainer;
        sideNavContainer.listen(function () {
            $(this).css('margin-right', '0%');
            $('.nav-trigger > i').prop('class', 'icon-arrow-right')
            GuideFishing.sideNav.isActive = !GuideFishing.sideNav.isActive;
        }, 'show');
        sideNavContainer.listen(function () {
            $(this).css('margin-right', '-75%');
            $('.nav-trigger > i').prop('class', 'icon-arrow-left')
            GuideFishing.sideNav.isActive = !GuideFishing.sideNav.isActive;
        }, 'hidden');

        var _sideNavAction = {
            left: function () {
                sideNavContainer.trigger('show');
            },
            right: function () {
                sideNavContainer.trigger('hidden');
            }
        };

        return _sideNavAction;
    })();
};


/* 获取课程类型更新页面 */
GuideFishing.updateCourseType = function () {

    var url = "/course/courseType";
    $.post(url, {}, function (JSONdata) {

        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.isError){
            return GuideFishing.modalWindow('[error]: ' + JSONobject.error);
        }

        // 类型列表
        var $typeItemList = $('.type-item-list');
        GuideFishing.courseTypeChina = JSONobject.courseTypeChina;

        // for(var type in GuideFishing.courseTypeChina){
        //     var $type = $('<div class="type-item">');
        //     $type.text(GuideFishing.courseTypeChina[type])
        //         .prop('id', type);
        //
        //     $typeItemList.append($type);
        // }
        //
        // //指定类型的课程
        // $('.type-item').click(function () {
        //     GuideFishing.courseTypeDefine.call(this, arguments);
        // });

    }, "JSON");
};

/* 创建滑动视图 */
GuideFishing.buildSlideView = function () {

    var readUrl = '/course/readSlideImage';
    $.post(readUrl, function (jsonData) {
        var jsonObject = JSON.parse(jsonData);
        if(jsonObject.isError){
            return GuideFishing.modalWindow(jsonObject.error);
        }
        // 滑动组件1
        var slideDivID = $('#slideDiv').prop('id');
        // 实例化一个组件
        var slideView1 = new nojsja['SlideViewFrame'](slideDivID, jsonObject.slideImageArray);
        slideView1.build();
    });
};

/* 读取课程列表 */
GuideFishing.readCourseList = function (condition) {

    var url = "/course/readCourseList";
    //请求服务器
    $.post(url, condition, function (JSONdata) {
        //更新页面
        GuideFishing.updatePage(JSONdata);
    }, "JSON");
};

/* 加载更多数量的测评文章 */
// GuideFishing.readMore = function () {
//
//     GuideFishing.readCourseList({
//         courseType: GuideFishing.courseType,
//         skip: GuideFishing.pageStart
//     }, function (JSONdata) {
//         //更新页面
//         GuideFishing.updatePage(JSONdata);
//     });
// };

/* 更新主页事件 */
GuideFishing.updatePage = function (JSONdata) {

    //转换成JSON对象
    var parsedData = JSON.parse(JSONdata);
    //测评类型的图片url数组
    var typeImgUrl = parsedData.typeImgUrl;

    if(parsedData.error){
        return this.modalWindow("服务器发生错误: " + parsedData.error);
    }
    //清除缓存数据
    if(GuideFishing.isClear) {
        $('#totalCourse').children().remove();
        //重置标志位
        GuideFishing.isClear = false;
    }
    //没有数据提示用户
    if(parsedData.courseArray.length === 0){
        return GuideFishing.modalWindow('抱歉,没有更多数据!');
    }
    //遍历对象数组构造DOM对象
    for(var courseIndex in parsedData.courseArray) {
        //增加游标控制页面读取的起始位置
        GuideFishing.pageStart += 1;
        (function () {
            var course = parsedData.courseArray[courseIndex];
            //最外层container
            var $courseContainer = $('<div class="content-item">');
            //图钉图标
            var $pushPin = $('<span class="glyphicon glyphicon-pushpin push-pin"></span>');
            //内容左部分区
            var $contentLeft = $('<div class="content-item-left">');
            //内容标题
            var $contentTitle = $('<a class="content-item-title">');
            var url = '/course/detail/' + course.courseType + '/' + course.courseName;
            //添加超链接
            $contentTitle.prop('href', url);
            $courseContainer.click(function () {
                window.location.href = url;
            });

            $contentTitle.text(course.courseName);
            //内容摘要和图标
            var $abstract = $('<div class="content-item-abstract">');
            var $pencil = $('<span class="glyphicon glyphicon-pencil">');
            $abstract.append($pencil.text(course.teacher));
            //DOM构造
            $contentLeft.append($contentTitle).append($abstract).append($pushPin);

            //内容右边分区
            var $contentRight = $('<div class="content-item-right">');
            //内容类型相关的图片
            var $typeImg = $('<div></div>');
            var imgUrl = typeImgUrl[course.courseType];
            $typeImg.prop('class', 'type-img').css({
                'background': ["url(", imgUrl, ")", " no-repeat"].join(''),
                'background-size': 'cover'
            });
            //该测评所属的类型
            var $courseType = $('<p class="type-text">');
            $courseType.text(GuideFishing.courseTypeChina[course.courseType]);
            $contentRight.append($typeImg).append($courseType);

            //显示的日期
            var $date = $('<p class="content-item-date">');
            var $dateIcon = $('<i class="icon-time">');
            $date.append($dateIcon.text(course.date));

            //组合所有DOM
            $courseContainer.append($contentLeft)
                .append($contentRight)
                .append($date)
                .css('display', 'none');
            //添加到页面上去
            $('#totalCourse').append($courseContainer);
            //以淡入淡出效果出现
            $courseContainer.fadeIn();
        })();
    }
};

/* 自定义课程类型 */
GuideFishing.courseTypeDefine = function () {

    //通过触发对象id获取函数执行环境下的courseType
    var courseType = $(this).prop('id');
    //重置分页数据
    GuideFishing.pageStart = 0;
    GuideFishing.pageLimit = 15;
    GuideFishing.courseType = courseType;
    GuideFishing.isClear = true;

    //读取指定类型的列表
    GuideFishing.readCourseList({
        courseType: GuideFishing.courseType,
        pageStart: GuideFishing.pageStart,
        pageLimit: GuideFishing.pageLimit

    }, function (err, JSONdata) {
        if(err){
            return this.modalWindow("发生错误: " + err);
        }
        GuideFishing.updatePage(JSONdata);
    });
};

/* 更新热门内容 */
GuideFishing.updateCourseHot = function () {

    var url = '/course/readHot';
    $.post(url, {}, function (JSONdata){

        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.isError){
            return GuideFishing.modalWindow('服务器发生错误,错误码: ' + JSONobject.error);
        }

        // 更新父组件
        var $popularFather = $('#hotCourseList');
        // 清除缓存
        $popularFather.children().remove();
        // 更新页面
        for (var index in JSONobject.popularArray){
            var popular  = JSONobject.popularArray[index];
            var $li = $('<li>');
            var $a = $('<a>');
            // 课程url由前缀、课程类型和课程名字组成
            $a.text((Number(index) + 1) + ' . ' + popular.courseName)
                .prop({
                    href: [popular.preDress, popular.courseType, '/', popular.courseName].join('')
                });
            $li.append($a);
            $popularFather.append($li);
        }
    }, "JSON");
};

/* 更新热门内容 */
GuideFishing.updateTestHot = function () {

    var url = '/test/readHot';
    $.post(url, {}, function (JSONdata){

        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.isError){
            return GuideFishing.modalWindow('服务器发生错误,错误码: ' + JSONobject.error);
        }

        // 更新父组件
        var $popularFather = $('#hotTestList');
        // 清除缓存
        $popularFather.children().remove();
        // 更新页面
        for (var index in JSONobject.popularArray){
            var popular  = JSONobject.popularArray[index];
            var $li = $('<li>');
            var $a = $('<a>');
            // 课程url由前缀、课程类型和课程名字组成
            $a.text((Number(index) + 1) + ' . ' + popular.testTitle)
                .prop({
                    href: [popular.preDress, popular.testType, '/', popular.testTitle].join('')
                });
            $li.append($a);
            $popularFather.append($li);
        }
    }, "JSON");
};

/* 更新招聘信息 */
GuideFishing.updateRecruitment = function () {

    var url = '/recruitment/index';
    $.post(url, {
        action: 'getCompanyList',
        limit: 3
    }, function (JSONdata) {

        // 更新页面
        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.error){
            return nojsja["ModalWindow"].show('发生错误!');
        }

        var companys = JSONobject.companys;
        // 删除页面缓存
        $('#totalRecruitment').children().remove();

        // 遍历创建DOM
        for(var index in companys){

            var company = companys[index].company;
            var $companyBorder = $('<div class="company-border">');
            $companyBorder.click(function () {
                window.location.href =  "/recruitment/" + company;
            });
            var $companyItem = $('<div class="company-item">');
            var $companyImage = $('<img src="/images/testType/communication.jpg">');
            var $shadow = $('<div class="shadow">');
            var $a = $('<a class="company-title">');
            $a.attr('href', '/recruitment/' + company)
                .text(company);

            $companyItem
                .append($shadow)
                .append($companyImage)
                .append($a)
                .appendTo($companyBorder);

            $('#totalRecruitment').append($companyBorder);
        }

    }, "JSON");
};

/*** 更新课程讨论组信息 ***/

/* 读取直播列表 */
GuideFishing.updateBroadcast = function (condition) {

    var url = "/course/broadcast/readList";
    //请求服务器
    $.post(url, condition, function (JSONdata) {
        //更新页面
        GuideFishing.updateBroadcastPage(JSONdata);
    }, "JSON");
};

/* 更新讨论组事件 */
GuideFishing.updateBroadcastPage = function (JSONdata) {

    //转换成JSON对象
    var parsedData = JSON.parse(JSONdata);
    //测评类型的图片url数组
    var typeImgUrl = parsedData.typeImgUrl;
    // url前缀
    var preAddressUser = parsedData.preAddressUser;
    var preAddressAdmin = parsedData.preAddressAdmin;

    if(parsedData.error){
        return nojsja["ModalWindow"].show("服务器发生错误: " + parsedData.error);
    }

    //没有数据提示用户
    if(parsedData.broadcastArray.length === 0){
        return nojsja["ModalWindow"].show('抱歉,没有更多数据!');
    }
    // 做DOM缓存
    // GuideFishing.broadcastArray = parsedData.broadcastArray;
    //遍历对象数组构造DOM对象
    for(var broadcastIndex in parsedData.broadcastArray) {
        //增加游标控制页面读取的起始位置
        // GuideFishing.pageStart += 1;
        (function () {
            var broadcast = parsedData.broadcastArray[broadcastIndex];
            //最外层container
            var $broadcastContainer = $('<div class="content-item">');
            //图钉图标
            var $pushPin = $('<span class="glyphicon glyphicon-pushpin push-pin"></span>');
            //内容左部分区
            var $contentLeft = $('<div class="content-item-left  content-item-broadcast">');
            //内容标题
            var $contentTitle = $('<a class="content-item-title">');
            //添加超链接
            var url = preAddressUser + broadcast.courseName;
            $broadcastContainer.click(function () {
                window.location.href = url;
            });
            $contentTitle.prop('href', url);
            $contentTitle.text(broadcast.courseName);
            //内容摘要和图标
            var $abstract = $('<div class="content-item-abstract">');
            var $teacher = $('<div class="teacher"></div>');
            // var $intoRoom = $('<input type="button" class="btn btn-default btn-sm" value="管理员登入">');
            // $intoRoom.click(function () {
            //     window.location = preAddressAdmin + broadcast.courseName;
            // });
            $abstract.append($teacher.text(broadcast.teacher.name));

            // $abstract.append($intoRoom);
            //DOM构造
            $contentLeft.append($contentTitle).append($abstract).append($pushPin);

            // 内容右边分区 //
            var $contentRight = $('<div class="content-item-right">');
            //内容类型相关的图片
            var $typeImg = $('<div></div>');
            var imgUrl = typeImgUrl[broadcast.courseType];
            $typeImg.prop('class', 'type-img').css({
                'background': ["url(", imgUrl, ")", " no-repeat"].join(''),
                'background-size': 'cover'
            });
            //该测评所属的类型
            var $broadcastType = $('<p class="type-text">');
            $broadcastType.text(GuideFishing.courseTypeChina[broadcast.courseType]);
            $contentRight.append($typeImg).append($broadcastType);

            //显示的日期
            var $date = $('<p class="content-item-date">');
            var $dateIcon = $('<i class="icon-time">');
            $date.append($dateIcon.text(broadcast.date));

            //组合所有DOM
            $broadcastContainer.append($contentLeft)
                .append($contentRight)
                .append($date);

            //添加到页面上去
            $('#totalBroadcast').append($broadcastContainer);
        })();
    }
};

/* 模态弹窗 */
GuideFishing.modalWindow = function (text) {
    nojsja.ModalWindow.show(text);
};

/* 页面底部和底部跳转 */
GuideFishing.goTop = function goTop() {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
};

GuideFishing.goDiv = function goDiv(div) {
    var a = $("#" + div).offset().top;
    $("html, body").animate({ scrollTop: a }, 'slow');
};

GuideFishing.goBottom = function goBottom() {
    //两个参数分别是左上角显示的文档的x坐标和y坐标
    //scrollHeight 和 clientHeight分别是文档能够滚动的总高度和文档在当前窗口的可见高度
    window.scrollTo(0, document.documentElement.scrollHeight -
        document.documentElement.clientHeight);
};

/* 滚动侦测 */
GuideFishing.scrollCheck = function () {

    //可见高度
    var clientHeight = $(window).height();
    //总高度,包括不可见高度
    var totalHeight = $(document).height();
    //可滚动高度,只有不可见高度
    var scrollHeight = $(window).scrollTop();

    //文档总长度比较短
    if(clientHeight >= (totalHeight * 1) / 2){
        return;
    }

    //当滑动到1/2页面处的时候就显示跳转按钮
    if(clientHeight + scrollHeight >= (totalHeight * 1) / 2){
        GuideFishing.scrollOver = true;
        if(GuideFishing.lastScrollOver !== GuideFishing.scrollOver){
            $('.page-anchor').fadeIn();
        }
        GuideFishing.lastScrollOver = GuideFishing.scrollOver;
    }else {
        GuideFishing.scrollOver = false;
        if(GuideFishing.lastScrollOver !== GuideFishing.scrollOver){
            $('.page-anchor').fadeOut();
        }
        GuideFishing.lastScrollOver = GuideFishing.scrollOver;
    }
};



/* 窗口各种高度检测函数 */
function windowHeightCheck() {
    console.log('$(window).height() = ' + $(window).height());
    console.log('document.body.clientHeight = ' + document.body.clientHeight);
    console.log('document.body.scrollHeight = ' + document.body.scrollHeight);
    console.log('$(document).height() = ' + $(document).height());
    console.log('$(window).scrollTop() = ' + $(window).scrollTop());
    console.log('window.innerHeight = ' + window.innerHeight);
    console.log('document.documentElement.clientHeight = ' + document.documentElement.clientHeight);
    console.log('document.documentElement.scrollHeight = ' + document.documentElement.scrollHeight);
}

/**
 * Created by yangw on 2017/4/13.
 */

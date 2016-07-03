(function(){


    var itemsPerLoad = 10;// 每次加载添加多少条目
    var obj_g = {}; //全局变量用来保存其他变量
    obj_g.itemsPerLoad = 10; // 每次加载添加多少条目

    //海报图原始尺寸
    var poster = {
        "width": 800,
        "height": 455,
    }

    //获取当前页面的宽度
    var showWidth = $(window).width();
    var showHeight = showWidth * poster.height / poster.width;

    //ajax请求数据
    /**
     * @page 页码, JSON文件的编码
     * return 返回的是回调
     * 回调的参数是活动列表json的数组
     */
    function getData(page,cb){
        var pageStr = page === 0 ? "" : page;
        //通过AJAX请求数据
        $.get("static/data/activity" + pageStr + ".json",function(res){
            if(res.success == 1){
                //获取到数据后, 返回数据
                return cb(res.data);
            }else{
                return 0;
            }
        })
    }


    /**
     * 返回一条domString数据;  包含了多条itme dom字符串
     * @ Obj 参数 是一个对象
     * Obj.itemsPerLoad 每次加载的条目数; 要循环获取dom字符串并拼接后返回
     * Obj.maxItems  最多可加载的条目
     * Obj.lastIndex  已经加载的数据的序号
     * Obj.data_JSON  ajax获取的json数据, 也是原json
     * Obj.page_json  当前json数据的序号
     * obj.newJson  新的json数据
     * return obj
     */
    function getDomStr(obj) {

        var domStr = "";
        for(var i = 0 ; i < obj_g.itemsPerLoad ; i ++ ){
            var _obj = {}; //临时对象保存返回值
            //1 获取每条item dom对应的json数据
            /**
             * @ obj
             * i 当前循环的序号
             */
            var _obj2 = getItemObj(obj_g,i);
            var itemJson = _obj2.itemJson;
            _obj.lastIndex = _obj2.lastIndex;
            _obj.page_json = _obj2.page_json ? _obj2.page_json : obj.page_json;
            _obj.data_JSON = _obj2.data_JSON ? _obj2.data_JSON : obj.data_JSON;
            _obj.lastIndex = _obj2.lastIndex ? _obj2.lastIndex : obj.lastIndex;

            obj_g.lastIndex = _obj.lastIndex;
            obj_g.page_json = _obj.page_json;
            obj_g.data_JSON = _obj.data_JSON;
            obj_g.lastIndex = _obj.lastIndex;

            //2 根据json数据获取每条item的dom字符串
            itemJson.page = obj_g.page_json;
            itemJson.height = showHeight;
            var itemDomStr = jsonToDomStr(itemJson);

            //3 组装domStr
            domStr += itemDomStr;
        }
        _obj.domStr = domStr;


        //返回值
        return _obj;
    }

    //获取每条活动的数据, 是一个obj对象 ; 如果json数据不够了, 就发出ajax请求获取新的数据;
     /**
     * 获取单条item dom对应的json数据
     * @ obj
     * n 当前循环的序号
     * @ Obj 参数 是一个对象
     * Obj.itemsPerLoad 每次加载的条目数; 要循环获取dom字符串并拼接后返回
     * Obj.maxItems  最多可加载的条目
     * Obj.lastIndex  已经加载的数据的序号 ,也是起始索引
     * Obj.data_JSON  当前的json数据, 也是原json
     * Obj.page_json  当前json数据的序号
     * obj.newJson 新的json数据
      * 返回 obj
     */
    function getItemObj(){

        //如果当前json已经读取完, 则开始读取新的json文件.
         if(obj_g.lastIndex   >= (obj_g.data_JSON.activities.length - 1 ) ){
            obj_g.data_JSON = obj_g.newJson;
             obj_g.lastIndex = 0;
             obj_g.page_json ++;
         }else{
             obj_g.lastIndex++;
         }
        obj_g.itemJson = obj_g.data_JSON.activities[obj_g.lastIndex];

         return obj_g;

    }

    //把json数据生成domString; 每次处理一个条目
    /**
     * @param activity 对象,即活动内容
     * activity.height 图片的高度 需要添加,
     * activity.page 当前json的页码 需要动态添加
     * activity.id 活动id
     * activity.content 活动的标题文本
     * @returns domString  一条dom字符串
     */

    function jsonToDomStr (activity){
        var domString = "";
        var template =
            '  <div class="activityList" href="view?id=' +  activity.id + '" activityid= ' + activity.id + ' > ' +
            ' <div class="activity-block"><img class="activity-photo" style="height:'+ activity.height +'px"  src='+ activity.poster +' alt="activity photo"> ' +
            '      <div class="activity-describe"><a class="" href="view.html?id='+ activity.id +'&amp;page='+ activity.page  +'">'+ activity.content +'</a></div> ' +
            '  </div> ' +
            '  </div> ' ;
        domString += template;
        return domString;

    }


    /**
     * 向页面中添加条目; 添加多个活动条目
     * @paramObj 是一个对象
     * paramObj.itemsPerLoad 每次加载的条目数; 要循环获取dom字符串并拼接后返回
     * paramObj.maxItems  最多可加载的条目
     * paramObj.lastIndex  已经加载的数据的序号(是数组的序号)
     * paramObj.data_JSON  当前的json数据
     * paramObj.page_json  当前json文件的序号
     * paramObj.newJson  新的json文件
     */
    function addItems(paramObj) {

        // 生成新条目的HTML
        var html = '';
        var obj_new = getDomStr(paramObj);   //返回的也是一个对象
        html = obj_new.domStr;

        // 添加新条目
        $('.infinite-scroll-bottom .list-container').append(html);
        // 预加载下一屏幕的图片
        for(var i = 0 ; i < itemsPerLoad ; i ++ ){
            if(obj_g.lastIndex + i >= obj_g.data_JSON.activities.length - 1){

                //如果当前dataJson中的文件不够下一轮的显示,则发出ajax请求新的json
                if( obj_g.lastIndex + obj_g.itemsPerLoad >= obj_g.data_JSON.activities.length ){
                    getData(obj_g.page_json + 1,function(data){
                        obj_g.newJson = data;  //新的json文件

                    });
                }

                return;
            }
            var src = obj_new.data_JSON.activities[obj_new.lastIndex + i].poster;

            preLoad(src);

        }
    }


    //页面加载时, 先执行一次获取数据并加载
    //第一次加载
    window.onload = function() {

        //首次加载时定义一些起始的参数
        obj_g.page_json = 1 //首次加载的json文件的序号
        obj_g.lastIndex = 0 //上一次已经加载的条目序号, 也是下一次加载的起始序号(是数组序号)
        obj_g.maxItems = maxItems //最多可加载的条目数
        obj_g.itemsPerLoad = itemsPerLoad //每次加载的条目数; 要循环获取dom字符串并拼接后返回

        getData(obj_g.page_json, function (data) {
            obj_g.data_JSON = data; //ajax获取的json数据
            addItems(obj_g);
        });
    }



    //无限加载函数
    // 加载flag
    var loading = false;
    // 最多可加载的条目
    var maxItems = 90;
    //循环相关的数据
    var num = 0; //已经加载的数据的序号

    // 注册'infinite'事件处理函数
    $(document).on('infinite', '.infinite-scroll-bottom',function() {

        // 如果正在加载，则退出
        if (loading) return;

        // 设置flag
        loading = true;

        // 模拟1s的加载过程
        setTimeout(function() {
            // 重置加载flag
            loading = false;
            num += obj_g.itemsPerLoad ;
            if (num >= maxItems) {
                // 加载完毕，则注销无限加载事件，以防不必要的加载
                $.detachInfiniteScroll($('.infinite-scroll'));
                // 删除加载提示符
                $('.infinite-scroll-preloader').remove();
                return;
            }

            // 添加新条目
            addItems(obj_g);

            //容器发生改变,如果是js滚动，需要刷新滚动
            $.refreshScroller();
        }, 1000);
    });


//图片预先加载
    function preLoad(src){
     //创建img标签
     var oImage = new Image;
     // 给img标签的src赋值url时,系统就会去下载这个url资源,加载成功后的资源被保存在了浏览器的缓存中, 在需要的时候再直接把这个url地址赋值给需要的元素, 这样减少了等待时间,可以提高用户体验,特别是对于一些比较大的资源更有效
     oImage.src = src;
 }



//页面初始化
    $.init()



})()

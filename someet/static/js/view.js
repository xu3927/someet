/**
 * Created by leo on 2016/6/29 22:59.
 */

(function(){
    $(document).on("pageInit", function(e, pageId, $page) {
        if(pageId == "routerView") {

            var searchUrl = window.location.search;
            var str = searchUrl.substr(1);
            str = str.replace(/\&/g,"','");
            str = "{'"+str.replace(/\=/g,"':'")+"'}";
            var strJSON = eval("(" + str + ")");
            var json_num = strJSON.page == 0 ? "" : strJSON.page;
            var itemId = strJSON.id;

            //发出ajax请求来获取当前的详情数据

            $.get("static/data/activity"+json_num+".json",function(res){
                var itemData = {};
                if(res.success == 1){
                    var data = res.data.activities;
                    $.each(data,function(i){
                        if(res.data.activities[i].id==itemId){
                            itemData = res.data.activities[i];
                        }
                    })
                    var poster = {
                        "width": 800,
                        "height": 455,
                    }

                    //获取当前页面的宽度
                    var showWidth = $(window).width();
                    var showHeight = parseInt(showWidth * poster.height / poster.width);

                    var imgDom = '<img class="activity-photo" style="height:'+ showHeight +'px";width= "' + showWidth + 'px "  src='+ itemData.poster +' alt="activity photo">'
                    $(".detail-title").html(imgDom);
                    $(".detail-activity").html(itemData.details)
                    //渲染视图
                }
            })

            //设置导航栏的样式
            var $nav = $page.find("header");


            var direction = 2; //1 up 2 down
            $(".content").on("swipeUp",function () {
                if(direction !== 1) {
                    $nav.fadeOut();
                    direction = 1;
                }
            })

            $(".content").on("swipeDown",function (e) {
                if(direction !== 2){
                    $nav.fadeIn();
                    direction = 2;
                }
            })
        }

    });

    


    
})()
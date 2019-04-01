$(function () {
    var that = this,
        win = $(window),
        doc = $(document);
    //左侧导航box
    that.leftNav = $("#j_leftBarList");
    //目录是否存在的标识,默认为false,不存在
    that.leftNavCatalog = false;
    //目录是否已显示,默认为false,未显示
    that.showCatalog = false;
    //标识目录是否已经发送ajax , 默认为false , 未发送
    that.catalogAjaxbool = false;
    //做左侧弹窗菜单方位
    var leftBar = $("#j_leftBarList"),
        nowLeftTop = (leftBarTop = 119);
    var rightBar = $("#j_rightBarList"),
        nowRightBottom = (rightBarBottom = 120),
        pageHeight,
        bottomTo;
    var goTop = $("#j_goTop");
    win
        .on("scroll", function () {
            winScrollTop = win.scrollTop();
            pageHeight = doc.height();
            //console.log(winScrollTop, pageHeight);
            if (winScrollTop >= leftBarTop && nowLeftTop != 0) {
                nowLeftTop = 0;
                leftBar.css("top", nowLeftTop);
            } else if (winScrollTop < leftBarTop) {
                nowLeftTop = leftBarTop - winScrollTop;
                leftBar.css("top", nowLeftTop);
            }
            bottomTo = pageHeight - that.winHeight - rightBarBottom;
            if (winScrollTop <= bottomTo && nowRightBottom != 0) {
                nowRightBottom = 0;
                rightBar.css("bottom", nowRightBottom);
            } else if (winScrollTop > bottomTo) {
                nowRightBottom =
                    rightBarBottom - pageHeight + that.winHeight + winScrollTop;
                rightBar.css("bottom", nowRightBottom);
            }
            if (winScrollTop > 0) {
                goTop.show();
            } else {
                goTop.hide();
            }
        })
        .trigger("scroll");
    //返回顶部
    win[0].topClick = function () {
        $("body,html").animate({
                scrollTop: 0
            },
            220
        );
    };
    //小说信息
    let queryURL = window.location.href
    let params = queryURL.slice(queryURL.indexOf("?") + 1).split('&')
    let book = {}
    for (let i = 0; i < params.length; i++) {
        book[params[i].slice(0, params[i].indexOf("="))] = params[i].slice(params[i].indexOf("=") + 1)
    }
    let {an,bn,num} = book
    //上下章节
    let u1 = `/reading?an=${an}&bn=${bn}&num=${Number(num)+1}&time=${(new Date()).getTime()}`
    let u2 = `/reading?an=${an}&bn=${bn}&num=${Number(num)-1}&time=${(new Date()).getTime()}`
    $("#j_chapterNext").attr("href", u1);
    $("#j_chapterPrev").attr("href", u2);
    //打开目录弹窗-浮层
    window.chapterListClick = function () {
        if (that.showCatalog === false) {
            if (that.leftNavCatalog === false) {
                $.get("/read/list", {an,bn},
                    function (data) {
                        let {err,div,list,msg} = data
                        if (!err) {
                            that.leftNav.append(div);
                            let ul = document.getElementById("showlist").children[0]
                            let lia = ""
                            for (let i = 0; i < list.length; i++) {
                                lia += `<li><a href="/reading?bn=${bn}&an=${an}&num=${list[i].c_num}">${list[i].c_title}</a></li>`
                            }
                            ul.innerHTML = lia
                            that.leftNavCatalog = true;
                            that.showCatalog = true;
                        } else {
                            alert(msg);
                        }
                    },
                );
            } else {
                $("#j_catalog").show();
                that.showCatalog = true;
            }
        } else {
            $("#j_catalog").hide();
            that.leftNavCatalog = true;
            that.showCatalog = false;
        }
    }
    window.closeCatalog = function () {
        $("#j_catalog").hide();
        that.leftNavCatalog = true;
        that.showCatalog = false;
    }
})
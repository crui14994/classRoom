// $(function(){
    var cutUrl;

        //弹出框水平垂直居中
        (window.onresize = function () {
            var win_height = $(window).height();
            var win_width = $(window).width();
            if (win_width <= 768) {
                $(".tailoring-content").css({
                    "top": (win_height - $(".tailoring-content").outerHeight()) / 2,
                    "left": 0
                });
            } else {
                $(".tailoring-content").css({
                    "top": (win_height - $(".tailoring-content").outerHeight()) / 2,
                    "left": (win_width - $(".tailoring-content").outerWidth()) / 2
                });
            }
        })();

        //弹出图片裁剪框
        $("#replaceImg").on("click", function () {
            $(".tailoring-container").toggle();
        });
        //图像上传
        function selectImg(file) {
            if (!file.files || !file.files[0]) {
                return;
            }
            var reader = new FileReader();
            reader.onload = function (evt) {
                var replaceSrc = evt.target.result;
                //更换cropper的图片
                $('#tailoringImg').cropper('replace', replaceSrc, false);//默认false，适应高度，不失真
            }
            reader.readAsDataURL(file.files[0]);
        }
        //cropper图片裁剪
        $('#tailoringImg').cropper({
            aspectRatio: 1 / 1,//默认比例
            preview: '.previewImg',//预览视图
            guides: false,  //裁剪框的虚线(九宫格)
            autoCropArea: 0.5,  //0-1之间的数值，定义自动剪裁区域的大小，默认0.8
            movable: false, //是否允许移动图片
            dragCrop: true,  //是否允许移除当前的剪裁框，并通过拖动来新建一个剪裁框区域
            movable: true,  //是否允许移动剪裁框
            resizable: true,  //是否允许改变裁剪框的大小
            zoomable: false,  //是否允许缩放图片大小
            mouseWheelZoom: false,  //是否允许通过鼠标滚轮来缩放图片
            touchDragZoom: true,  //是否允许通过触摸移动来缩放图片
            rotatable: true,  //是否允许旋转图片
            crop: function (e) {
                // 输出结果数据裁剪图像
            }
        });
        //旋转
        $(".cropper-rotate-btn").on("click", function () {
            $('#tailoringImg').cropper("rotate", 45);
        });
        //复位
        $(".cropper-reset-btn").on("click", function () {
            $('#tailoringImg').cropper("reset");
        });
        //换向
        var flagX = true;
        $(".cropper-scaleX-btn").on("click", function () {
            if (flagX) {
                $('#tailoringImg').cropper("scaleX", -1);
                flagX = false;
            } else {
                $('#tailoringImg').cropper("scaleX", 1);
                flagX = true;
            }
            flagX != flagX;
        });

        //裁剪后的处理
        $("#sureCut").on("click", function () {
            if ($("#tailoringImg").attr("src") == null) {
                return false;
            } else {
                var cas = $('#tailoringImg').cropper('getCroppedCanvas');//获取被裁剪后的canvas
                var base64url = cas.toDataURL('image/png'); //转换为base64地址形式
                $("#finalImg").prop("src", base64url);//显示为图片的形式
                cutUrl = convertBase64UrlToBlob(base64url);
                //关闭裁剪框
                closeTailor();
            }
        });
        //关闭裁剪框
        function closeTailor() {
            $(".tailoring-container").toggle();
        }

        /**
        * 将以base64的图片url数据转换为Blob
        * 用url方式表示的base64图片数据
        */
        function convertBase64UrlToBlob(urlData) {

            var bytes = window.atob(urlData.split(',')[1]);        //去掉url的头，并转换为byte

            //处理异常,将ascii码小于0的转换为大于0
            var ab = new ArrayBuffer(bytes.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < bytes.length; i++) {
                ia[i] = bytes.charCodeAt(i);
            }

            return new Blob([ab], { type: 'image/png' });
        }


        $("#upBtn").on("click", function () {
            var uploadFormData = new FormData($('#uploadForm')[0]);//序列化表单，$("form").serialize()只能序列化数据，不能序列化文件
            if (cutUrl) { //如果用户更换了头像将头像加入uploadFormData中
                uploadFormData.append("avatarName", cutUrl);  //append函数的第一个参数是后台获取数据的参数名,和html标签的input的name属性功能相同
            }
            $.ajax({
                url: "./doUpInfo",
                type: "POST",
                data: uploadFormData,
                processData: false,
                contentType: false,
                async: false,
                success: function (result) {
                    if (result == "-1" || result == "-2") {
                        alert("修改失败!");
                    } else if (result == "1") {
                        alert("修改成功！");
                        window.location = "./";
                    }
                }
            })
        })
// })
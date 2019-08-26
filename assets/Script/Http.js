var HTTP = {
    Request : function(path,data,handler,port){
            var xhr = cc.loader.getXMLHttpRequest();
            var url = "http://127.0.0.1:"+port;
            xhr.timeout = 10000;
            var str = "?";
            for(var k in data){
                if(str != "?"){
                    str += "&";
                }
                str += k + "=" + data[k];
            }
           
            var requestURL = url + path + encodeURI(str);
            console.log("RequestURL:" + requestURL);
            xhr.open("GET",requestURL, true);
            if (cc.sys.isNative){
                xhr.setRequestHeader("Accept-Encoding","gzip,deflate","text/html;charset=UTF-8");
            }
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)){
                    try {
                        var ret = xhr.responseText;
                        if(handler !== null){
                            handler(ret);
                        }                        /* code */
                    } catch (e) {
                        console.log("err:" + e);
                        //handler(null);
                    }
                }
            };
            
            xhr.send();
            return xhr;
    },
    send : function(path,data,handler,port){
        var xhr = cc.loader.getXMLHttpRequest();
        var url = "http://127.0.0.1:"+port;
        xhr.timeout = 5000;
        var str = "";
        for(var k in data){
            if(str != "?"){
                str += "&";
            }
            str += k + "=" + data[k];
        }
        var extraUrl = url;
        var requestURL = extraUrl +path
        console.log("RequestURL:" + requestURL);
        xhr.open("post",requestURL, true);
        if (cc.sys.isNative){
            xhr.setRequestHeader("Accept-Encoding","gzip,deflate","text/html;charset=UTF-8");
        }
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)){
                try {
                    var ret = xhr.responseText;
                    if(handler !== null){
                        handler(ret);    
                    }  
                } catch (e) { 
                    console.log("err:" + e);
                    //handler(null);
                }
            }
        }; 
        xhr.send(str);
        return xhr;
    },   
};

module.exports = HTTP
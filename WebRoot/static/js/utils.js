define(function(require, exports){
    exports.build_url = function(controller){
        return String.format("{0}", controller);
    }
    //------------------------------------------------
    function http_request(url, param_obj, succFun, failFun){
        Ext.Ajax.request({
            url: url, 
            params: param_obj,
            method : "POST",
            timeout : 0,
            success: function(resp, opts){
                var obj = Ext.decode(resp.responseText);
                if(obj.success){
                    if(succFun) succFun(obj);
                }else{
                    if(failFun){
                        failFun(obj);
                    }
                    else{
                        if(obj && obj.msg){
                            show_msg(obj.msg);
                        }
                    }
                }
            },
            failure: function(resp, otps){
                show_msg('server-side failure with status code ' + resp.status);
            }
        });
    }

    function multi_http_request(callback/*, req1, req2, ...*/){
        var result_arr = [];
        var len = arguments.length - 1;
        for(var i=1; i<arguments.length; ++i){
            var req = arguments[i];
            http_request(req.url, req.param, function(result){
                result_arr.push(result);

                //当result_arr.length跟请求数一样的时候，认为全部请求完成
                //FIXME 仅考虑每个req必然返回的情况
                if(result_arr.length == len){
                    callback(result_arr);
                }
            })
        }
    }

    function multi_store_load(callback/*, store1, store2, ...*/){
        var result_arr = [];
        var len = arguments.length - 1;
        var onLoad = function(sto, recs, opts){
            //加载完卸载该监听器
            sto.un("load", onLoad);

            //FIXME 仅考虑每个store加载必然返回的情况
            result_arr.push(recs);
            if(result_arr.length == len){
                callback(result_arr);
            }
        };

        for(var i=1; i<arguments.length; ++i){
            var sto = arguments[i];
            sto.on("load", onLoad);
            sto.load();
        }
    }

    exports.http_request = http_request;
    exports.multi_http_request = multi_http_request;
    exports.multi_store_load = multi_store_load;
    //---------------------------------------------

    //--------------------------------------------
    //一些通用方法
    /**
     * 返回值说明
     * 1 检验通过，非1的都是检验不通过
     * 2 检验文件路径为空
     * 3 检验文件名称非法
     * 4 图片类型数组入参为空
     * 5 不支持的图片类型
     */
    function validate_image_type(filename, imgTypeArr) {
    	if(filename == "" || filename == undefined || filename == null) {
    		return 2;
    	}
    	if(null == imgTypeArr || undefined == imgTypeArr) {
    		return 4;
    	}
    	if(-1 == filename.lastIndexOf(".")) {
			return 3;	
		}
		var imgType = filename.substr(filename.lastIndexOf(".")+1).toLowerCase();
		var flag = false;
		for(var i=0; i<imgTypeArr.length; i++) {
			if(-1 != imgType.indexOf(imgTypeArr[i])) {
				flag = true;
				break;
			}
		}
		if(!flag) {
			return 5;
		}
		return 1;
    }
    
    function get_random_num(Min,Max) {   
	    var Range = Max - Min;   
	    var Rand = Math.random();   
	    return(Min + Math.round(Rand * Range));   
    }
    
    function get_random_num(Min,Max) {   
    	var Range = Max - Min;   
    	var Rand = Math.random();   
    	return(Min + Math.round(Rand * Range));   
    }   
    
    function show_msg(msg){
        Ext.Msg.alert("提示", msg);
    }

    function show_confirm(msg, ok_func, no_func){
        Ext.Msg.confirm("提示", msg, function(rtn){
            if(rtn == "yes"){
                if(ok_func) ok_func();
            }else{
                if(no_func) no_func();
            }
        });
    }

    function mask(msg){
        Ext.getCmp("main-panel").getEl().mask(msg);
    }

    function unmask(){
        Ext.getCmp("main-panel").getEl().unmask();
    }

    exports.validate_image_type = validate_image_type;
    exports.get_random_num = get_random_num;
    exports.show_msg = show_msg;
    exports.show_confirm = show_confirm;
    exports.mask = mask;
    exports.unmask = unmask;

    //---------------------------------------------
    //对于seajs的一些封装
    function load_resource(url, callback){
        seajs.use(url, callback);
    }

    exports.load_resource = load_resource;

    //---------------------------------------------
    function htmlEncode(str) {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
    function htmlDecode(str) {
        var div = document.createElement("div");
        div.innerHTML = str;
        return div.innerHTML;
    }

    exports.htmlEncode = htmlEncode;
    exports.htmlDecode = htmlDecode;


    //----------------------------------------------
    //cookie的操作
    function setCookie(key, val){
        Ext.util.Cookies.set(key, val);
    }

    function getCookie(key){
        return Ext.util.Cookies.get(key);
    }

    function clearCookie(key){
        Ext.util.Cookies.clear(key);
    }

    exports.setCookie = setCookie;
    exports.getCookie = getCookie;
    exports.clearCookie = clearCookie;


    //为gridpanel的cell创建button
    function createGridBtn(cfg){
        var btnId = Ext.id();
        var btn = (function(){
            return new Ext.Button(cfg).render(document.body, btnId);
        }).defer(1, this);

        return btnId;
    }   
    exports.createGridBtn = createGridBtn;

    //解析如 xx=xx&xx=xx的格式数据
    function parseStr(str){
        if(!str || str.length == 0)
            return [];

        var r = {};
        var e_arr = str.split("&");
        for(var i=0; i<e_arr.length; ++i){
            var e = e_arr[i].split("=");
            if(e.length == 0){
                continue;
            }else if(e.length == 1){
                r[e[0]] = "";
            }else{
                r[e[0]] = e[1];
            }
        }

        return r;
    }
    exports.parseStr = parseStr;

    exports.get_record_value = function(record, name, defaultVal){
        if(!defaultVal){
            defaultVal = "";
        }
        return record ? record.get(name) : defaultVal;
    }

    //--------------------------------------------------------------
    //pop气泡通知
    var tips = function(){
        var msgCt;

        function createBox(t, s){ 
            return ['<div class="msg">',
                    '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
                    '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>', t, '</h3><div class="x-box-content">', s, '</div></div></div></div>',
                    '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
                    '</div>'].join('');
        }   
        return {
            msg : function(title, format, time){
                time = time || 2;
                if(!msgCt){
                    msgCt = Ext.DomHelper.insertFirst(document.body, {id:'msg-div'}, true);
                }   
                msgCt.alignTo(document, 't-t');
                var s = String.format.apply(String, Array.prototype.slice.call(arguments, 1));
                var m = Ext.DomHelper.append(msgCt, {html:createBox(title, s)}, true);
                m.slideIn('t').pause(time).ghost("t", {remove:true});
            }
        };  
    }();

    exports.tips = function(msg, pause){
        tips.msg("提示", msg, pause);
    }


    //---------------------------------------------------------------------
    //客户端存储
    var cache = {};
    exports.set_data = function(key, data){
        cache[key] = data;
    }
    exports.get_data = function(key, erase){
        if(cache[key] != undefined){
            var value = cache[key];
            if(erase){
                delete cache[key];
            }
            return value;
        }
        return null;
    }
    exports.delete_data = function(key){
        if(cache[key] != undefined){
            delete cache[key];
        }
    }

    //---------------------------------------------------------------------
    exports.http_build_query = function(data){
        var s = "";
        for(var k in data){
            var v = data[k];
            if(v != undefined){
                s += k + "=" + encodeURIComponent(v) + "&";
            }
        }
        s = s.substr(0, s.length - 1);
        return s;
    }
    
    exports.parseInt = function(str){
        var r = parseInt(str);
        if(r)
            return r;
        //NaN和0都返回0
        return 0;
    }
    var cache = {}; 
    exports.set_data = function(key, data){
        cache[key] = data;
    }   
    exports.get_data = function(key, erase){
        if(cache[key] != undefined){
            var value = cache[key];
            if(erase){
                delete cache[key];
            }   
            return value;
        }   
        return null;
    }   
    exports.delete_data = function(key){
        if(cache[key] != undefined){
            delete cache[key];
        }   
    }
    exports.operation_name = function(value){
    	if(value == "add"){
    		return "新增";
    	}
    	if(value == "update"){
    		return "更新";
    	}
    	if(value == "delete"){
    		return "删除";
    	}
    	if(value == "addOrUpdate"){
    		return "新增或更新";
    	}
    	if(value == "import"){
    		return "导入";
    	}
    	return value;
    }
    
    exports.get_trade_mode_name = function(value){
    	if(value==1){
 			return 'API模式';
 		}else if(value==2){
 			return 'C2C模式-游戏币';
 		}else if(value==3){
 			return 'C2C模式-装备';
 		}else if(value==4){
 			return 'C2C模式-账号';
 		}else if(value==5){
 			return 'IOS-8868';
 		}else if(value==6){
 			return '首充号';
 		}else if(value==7){
 			return '首充号代充';
 		}else if(value==8){
 			return '代充';
 		}else if(value==9){
 			return '秒充-首充';
 		}else if(value==10){
 			return '秒充-首代';
 		}else if(value==11){
 			return '退游';
 		}else if(value==12){
 			return '换游';
 		}else if(value==13){
 			return '自营商品-游戏币';
 		}else if(value==14){
 			return '自营商品-装备';
 		}else if(value==15){
 			return '自营商品-账号';
 		}else if(value==16){
 			return '1771合作单';
 		}else if(value==17){
 			return '7881合作单';
 		}else if(value==18){
 			return '商铺商品-游戏币';
 		}else if(value==19){
 			return '商铺商品-首充';
 		}else if(value==20){
 			return '商铺商品-代充';
 		}else if(value==21){
 			return '担保交易-账号';
 		}else if(value==22){
 			return '0元首充-秒发';
 		}else if(value==23){
 			return '代购';
 		}
 		else{
 			return '未知';
 		}
    }
    exports.get_product_status_name = function(value){
    	if(value==1){
			return '暂存中';
		}else if(value==3){
			return '待审核';
		}else if(value==4){
			return '审核中';
		}else if(value==5){
			return '审核失败';
		}else if(value==7){
			return '出售中';
		}else if(value==8){
			return '用户下架';
		}else if(value==9){
			return '已售完';
		}else if(value==10){
			return '游戏下架';
		}else if(value==11){
			return '已过期';
		}else if(value==12){
			return '管理员下架';
		}else if(value==13){
			return '下架失败';
		} else if(value==15){
			return '支付中';
		}
    }
    
    
    //ext中的 datefield 组件获取的值格式化, new Date("Y-m-d H:i:s") 格式，兼容firefox
    exports.dateFormat = function(value){ 
    	if("" != value){ 
    	  	var da = value.replace("年", "-").replace("月", "-").replace("日", "").replace(/-/g, "/").split(/\/|\:|\ /);
			return new Date(da[0],da[1]-1,da[2],da[3],da[4],da[5]).format("Y-m-d H:i:s");
        }else{ 
            return ""; 
        } 
    }
    
    exports.extDateFormate = function(value){
    	if("" != value){ 
    	  	return value_date = new Date(value).format('Y-m-d H:i:s'); 
        }else{ 
            return ""; 
        } 
    }
    
    exports.extDayFormat = function(value, format){
    	if("" != value){ 
    		var f = 'Y-m-d H:i:s';
    		if(undefined != format && "" != format) {
    			f = format;
    		}
    		return value_date = new Date(value).format(f); 
    	}else{ 
    		return ""; 
    	} 
    }
    
});

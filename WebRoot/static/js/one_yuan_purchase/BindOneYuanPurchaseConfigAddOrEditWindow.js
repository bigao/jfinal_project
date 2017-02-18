define(function(require, exports){
	

	var utils = require("../utils");
	var xw = require("../../com/XWindow.js");
	

	var QuickSearch = function(config){
        var that = this;
        if(!config){
            config = {}; 
        }   
        var defaultConfig = Ext.apply({
            id: config.id || Ext.id(),
            fieldLabel: config.fieldLabel,
            name: config.name,
            minChars: 0,
            hiddenName: config.name,
            resizable : false,
            allowAddNewData: true,
            store: new Ext.data.Store({
                baseParams: config.baseParams,
                proxy: new Ext.data.HttpProxy({
                    method: 'POST',
                    url: config.url,
                }), 
//                autoLoad: true,
                reader: new Ext.data.JsonReader({
                    root : 'data',
                    totalProperty: 'totalCount',
                    fields: Ext.data.Record.create([{name: config.id}, {name: config.name}]),
                }),
                listeners : {
                	load : function(s){
                		if(config.initValues){
                			for(var i = 0; i < config.initValues.length; ++i){
                				var initValues = config.initValues[i];
                				if("product_type_group_id" == config.id){
                					initValues = parseInt(initValues);
                				}
                				
                    			var index = s.findExact(config.id, initValues);
                    			var record = s.getAt(index);
                    			if(record == undefined)
                    				console.log("not find "+initValues);
                    			that.addRecord(record);
                			}
                			config.initValues = null;
                		}
                	},
                },
            }), 
            listeners :{
                  beforequery: function(qe){
                        delete qe.combo.lastQuery;
                    },
                    render: function(combo){
                    	combo.store.load();
                    }
            },
            valueDelimiter: ',',
            mode: 'remote',
            displayField: config.name,
            valueField: config.id,
            displayFieldTpl: "{"+config.name+"}",
            forceSelection : true,
            allowQueryAll : true,
        }, config);
    
        QuickSearch.superclass.constructor.call(this, defaultConfig);
    }
	
	
	Ext.extend(QuickSearch, Ext.ux.form.SuperBoxSelectEx, {});
	
	var BindOneYuanPurchaseConfigAddOrEditWindow = Ext.extend(xw.XWindow,{
		__make_id : function(name){
			return "BindOneYuanPurchaseConfigAddOrEditWindow:" + this.type_status + name;
		},
		
		__get_comp : function(name){
            var id = this.__make_id(name);
            return Ext.getCmp(id);
        },
        
        constructor : function(id, data, type){
        	this.data = data;
        	var me = this;
        	me.type = type;
        	me.data = data;

        	//初始化值
        	initChannels = [];
        	initTypeGroups = [];
        	
        	if(me.data){
        		initChannels = initChannels.concat(data.channelIds);
        		initTypeGroups = initTypeGroups.concat(data.typeGroups);
        	}
        	var type_name = "";
        	if(type == "add"){
        		type_name = "【<font color='red'>新增</font>】";
        	}
        	else if(type == "edit"){
        		type_name = "【<font color='red'>修改</font>】";
        	}
        	else if(type == "look"){
        		type_name = "【<font color='red'>查看</font>】";
        	}
        	this.type_status = type;
        	this.fields = this.createFields();
        	
        	BindOneYuanPurchaseConfigAddOrEditWindow.superclass.constructor.call(this,{
        		id : id,
        		title : type_name + "绑定1元购配置",
        		autoDestroy : true,
        		closable: true,
                closeAction: "close",
                width: 900,
                bodyStyle: 'background:Silver;',
                height:600,
                modal: true,
                frame: true,
                layout: "fit",
                y : 100,
                items : [
                	{xtype : "panel", border: false, padding: 5, layout: "fit", items : [this.createForm()]},
                ],
                bbar : this.createBbar(),
                listeners : {
                    render : function(p){
                        if(data){
                            me._init(data);
                        }
                        if("add" != type){
                        	if("look" == type || data.status ==3){
                        		me.__get_comp("ok_button").setDisabled(true);
                        	}
                        	if(type == "edit" && data.status == 1){
                        	
                        		
                        	}
                        }
                    }
                }
        	});
        },
        
        createBbar : function(){
            var me = this;
            return [
                 "->",
                {xtype : "button", text : "保存",width : 80, icon : "static/libs/icons/accept.png", id : me.__make_id("ok_button"),
                    handler : function(b){
                    	var data  = me.get_data();
                        if(!data){
                            return;
                        }
                        
                        if("add" == me.type){
                        	
                        }
                        
                        
                        Ext.MessageBox.confirm('保存窗体','点击“是”,确认保存"', function(btn) { 
           				    if(btn == 'yes'){
           				    	
        						var str = Ext.util.JSON.encode(data);
                           
                                //XXX 使用html5的功能
                                var form = new FormData();
                                form.append("data", str);
                                var xmlhttp = new XMLHttpRequest();
                             	var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "请耐心等待正在更新中..." });
                     			myMask.show();
                     			
                                xmlhttp.open("POST", utils.build_url("bindOneYuanPurchaseConfig/addOrUpdateConfig"), true);
                                xmlhttp.onload = function(e){
                                	var resp = Ext.util.JSON.decode(e.currentTarget.response);
                                    if(resp.success){
                                    	  utils.tips(resp.msg);
      	                                 me.close();
                                    }else{
    	                                 utils.show_msg(resp.msg);
    	                             } 
                                	myMask.hide();
                                };
                                xmlhttp.send(form);
                                function callback() {  
                                   	//接收响应数据  
                               	    //判断对象状态是否交互完成，如果为4则交互完成 
                               	     if(xmlhttp.readyState == 4) {  
                               	    	myMask.hide();
                               	         //判断对象状态是否交互成功,如果成功则为200 ,如果 500则不成功
                               	        if(xmlhttp.status == 500) {  
                               	            //接收数据,得到服务器输出的纯文本数据  
                               	            utils.show_msg("后台异常!");
                               	            return;
                               	        }  
                               	    }   
	                             }
           				    	
           				    }
                    	});	
                    }
                },'-','-',
                {xtype : "button", text : "取消", width : 80, icon : "static/libs/icons/cancel.png", id : me.__make_id("cancel_button"),
                	handler : function(b){
                		me.close();
                	}
                }
            ];
        },
        
        createForm : function(){
        	var me = this;
        	var form = new Ext.form.FormPanel({
        		border: false,
                width: 450,
                labelWidth : 105,
                id : 'activite_formpanel_id',
                autoScroll:true, 
                labelAlign : "right",
                bodyStyle: 'background:Silver;padding:20px',
                items : [
	                    {xtype : "hidden",id : me.__make_id("id")},
	                   
	                    {xtype : "compositefield",fieldLabel : "文案内容<font color = 'red'>*</font>", 
	                    	items : [ 
	                    	         {xtype : "textarea", fieldLabel : "文案内容", id : me.__make_id("content"),width : 250},
	                    	         {xtype : "displayfield", value : "<font color='red'>(不能超过30个汉字)</font>"},
	                        ]
	                    },
	                    {xtype : "displayfield", value : ""},
	                    {xtype : "displayfield", value : ""},
	                    {xtype : "radiogroup", 
		                     columns : 3,
		                     width : 250,
		                     id : me.__make_id("is_default_check"),
		                     fieldLabel : "是否默认勾选<font color = 'red'>*</font>",
		                     items : [
		                         {boxLabel : "是", name : "modes",value : 1, id : me.__make_id("is_check_yes")},
		                         {boxLabel : "否",name : "modes",value : 0,id : me.__make_id("is_check_no"),checked : true},
		                     ],
		                     listeners : {
		                         change : function(settlement){
		
		                         }
		                     }
		                 },
		                 {xtype : "displayfield", value : ""},
		                 {xtype : "displayfield", value : ""},
		                 {xtype : "radiogroup", 
		                     columns : 3,
		                     width : 250,
		                     id : me.__make_id("status"),
		                     fieldLabel : "状态<font color = 'red'>*</font>",
		                     items : [
		                         {boxLabel : "上线", name : "mode",value : 1, id : me.__make_id("status_onsale")},
		                         {boxLabel : "下线",name : "mode",value : 0,id : me.__make_id("status_offsale"),checked : true},
		                     ],
		                     listeners : {
		                         change : function(settlement){
		
		                         }
		                     }
		                 },
		                 {xtype : "displayfield", value : ""},
		                 {xtype : "displayfield", value : ""},
		                 
	                     {xtype : "compositefield",fieldLabel : "售价<font color = 'red'>*</font>", 
	                    	items : [ 
	                    	         {xtype : 'numberfield',allowDecimals: true,fieldLabel : "售价", id : me.__make_id("sell_price"),width : 120},
	                    	         {xtype : "displayfield", value : "元"},
	                        ]
	                    },
	                    
	                    {xtype : "displayfield", value : ""},
	                    {xtype : "displayfield", value : ""},
	                    {xtype : "compositefield",fieldLabel : "购买的1元购商品<font color = 'red'>*</font>", 
	                    	items : [ 
	                    	         {xtype : 'textfield',fieldLabel : "购买的1元购商品", id : me.__make_id("product_id"),width : 250},
	                    	         {xtype : "displayfield", value : "<font color='red'>(请填写1元购商品ID)"},
	                        ]
	                    },
	                     
	                    {xtype : "displayfield", value : ""},
	                    {xtype : "displayfield", value : ""},
	                 
	                    {xtype : "compositefield", fieldLabel : "渠道<font color = 'red'>*</font>", 
							items : [
								new QuickSearch({fieldLabel: "", name: "channel_name",id : "channel_id", url : utils.build_url("adminChannel/getListChannelIds?operation="+me.type+"&one_yuan_purchase_config_id="+me.data.id), width: 300, height : 150, initValues: initChannels}),
								{xtype : "displayfield", value : "&nbsp;&nbsp;&nbsp;一级分类<font color = 'red'>*</font>:"},
								new QuickSearch({fieldLabel: "", name: "name",id : "product_type_group_id", url : utils.build_url("adminProductTypeGroup/getList"), width: 300, height : 150, initValues: initTypeGroups}),
								
						    ]
					 },
                ],
                listeners:{  
                    render:function(){  
                        
                    }  
                }   
            });
            return form;
        },
        
        createFields : function(){
        	var me = this;
        	return Ext.data.Record.create([
               {name: "value"},
               {name: "name"},
            ]);
        },
        
        get_data : function(){
        	
        	var data = {};
            //id
            data.id = this.__get_comp("id").getValue();
           
            //文案内容
            var content = this.__get_comp("content").getValue();
            
            if(!content){
            	utils.show_msg("<font color='red'>文案内容不能为空</font>");
            	return false;
            }
            var realLength = 0, len = content.length, charCode = -1;  
            for (var i = 0; i < len; i++) {  
                charCode = content.charCodeAt(i);  
                if (charCode >= 0 && charCode <= 128) realLength += 1;  
                else realLength += 2;  
            }  
            
            if(realLength > 60){
            	utils.show_msg("<font color='red'>文案内容 不能输入超过30个汉字哦</font>");
            	return ;
            }
            
            data.content = content;
            //售价
            var sell_price = this.__get_comp("sell_price").getValue();
            if(!sell_price){
            	utils.show_msg("<font color='red'>售价不能为空</font>");
            	return false;
            }
            data.sell_price = sell_price;
            
            var product_id = this.__get_comp("product_id").getValue();
            if(!product_id){
            	utils.show_msg("<font color='red'>一元购商品不能为空</font>");
            	return false;
            }
            data.product_id = product_id;
            
          
            //渠道
            var select_channels = Ext.getCmp("channel_id").getValueEx();
            if(select_channels.length == 0){
            	utils.show_msg("<font color='red'>请选择渠道</font>");
            	return false;
            }
            var channels = new Array();
            for(var i = 0; i<select_channels.length; i++){
				var channel_id = select_channels[i].channel_id;
				var channel_name = select_channels[i].channel_name;
				channels[i] ={"channel_id": channel_id,"channel_name" :channel_name}
            }
            data.channels = channels;
            
            //一级分类
            var select_typeGroups = Ext.getCmp("product_type_group_id").getValueEx();
            if(select_typeGroups.length == 0){
            	utils.show_msg("<font color='red'>请选择一级分类</font>");
            	return false;
            }
            var typeGroups = new Array();
            for(var i = 0; i<select_typeGroups.length; i++){
				var product_type_group_id = select_typeGroups[i].product_type_group_id;
				var name = select_typeGroups[i].name;
				typeGroups[i] ={"product_type_group_id": product_type_group_id,"name" :name}
            }
            data.typeGroups = typeGroups;
            
            //状态
            data.status = this.__get_comp("status").getValue().value;
            //是否默认勾选
            data.is_default_check = this.__get_comp("is_default_check").getValue().value;
          
            
        	return data;
        },
        
        
        
        _init : function(data){
        	
            this.__get_comp("id").setValue(data.id);
            this.__get_comp("content").setValue(data.content);
            this.__get_comp("sell_price").setValue(data.sell_price);
            this.__get_comp("product_id").setValue(data.product_id);
            var status = this.__get_comp("status");
            if(data.status == 1){
            	status.setValue(this.__make_id("status_onsale"),true);
            }else if(data.status == 0){
            	status.setValue(this.__make_id("status_offsale"),true);
            }
            var check = this.__get_comp("is_default_check");
            if(data.is_default_check == 1){
            	check.setValue(this.__make_id("is_check_yes"),true);
            }else if(data.is_default_check == 0){
            	check.setValue(this.__make_id("is_check_no"),true);
            }
        }
        
	});
	

	
	
 	exports.BindOneYuanPurchaseConfigAddOrEditWindow = BindOneYuanPurchaseConfigAddOrEditWindow;
});
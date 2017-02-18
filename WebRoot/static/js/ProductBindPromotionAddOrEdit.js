define(function(require, exports){

	var URLS = {
        LIST: "adminProductBindPromotion/list"  //获取列表url
    };

	var utils = require("./utils");
	var xw = require("./../com/XWindow.js");
	

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
                    url: config.url
                }), 
//                autoLoad: true,
                reader: new Ext.data.JsonReader({
                    root : 'data',
                    totalProperty: 'totalCount',
                    fields: Ext.data.Record.create([{name: config.id}, {name: config.name}])
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
                    			if(record != undefined) {
                    				that.addRecord(record);
                    			} else {
                    				console.log("not find "+initValues);
                    			}
                			}
                			config.initValues = null;
                		}
                	}
                }
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
            allowQueryAll : true
        }, config);
    
        QuickSearch.superclass.constructor.call(this, defaultConfig);
    }
	
	
	Ext.extend(QuickSearch, Ext.ux.form.SuperBoxSelectEx, {});
	
	var ProductBindPromotionAddOrEdit = Ext.extend(xw.XWindow,{
		__make_id : function(name){
			return "ProductBindPromotionAddOrEdit:" + this.type_status + name;
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
        	
        	ProductBindPromotionAddOrEdit.superclass.constructor.call(this,{
        		id : id,
        		title : type_name + "商品捆绑配置(<font color='red'>新增或修改，记录将被置为下线状态</font>)",
        		autoDestroy : true,
        		closable: true,
                closeAction: "close",
                width: 900,
                bodyStyle: 'background:Silver;',
                height:630,
                modal: true,
                frame: true,
                layout: "fit",
                y : 100,
                items : [
                	{xtype : "panel", border: false, padding: 5, layout: "fit", items : [this.createForm()]}
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
                     			
                                xmlhttp.open("POST", utils.build_url("adminProductBindPromotion/addOrUpdateConfig"), true);
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
	                    {xtype:"textfield",fieldLabel : "方案标题<font color = 'red'>*</font>", id : me.__make_id("title"),value : "",width : 400,allowBlank:false},
		                {xtype : "displayfield", value : ""},
	                    {xtype : "radiogroup", 
		                     columns : 3,
		                     width : 250,
		                     id : me.__make_id("is_default_check"),
		                     fieldLabel : "是否默认勾选<font color = 'red'>*</font>",
		                     items : [
		                         {boxLabel : "是", name : "modes",value : 1, id : me.__make_id("is_check_yes")},
		                         {boxLabel : "否",name : "modes",value : 0,id : me.__make_id("is_check_no")}
		                     ],
		                     listeners : {
		                         change : function(settlement){
		
		                         }
		                     }
		                 },
		                 /*{xtype : "radiogroup", 
		                     columns : 3,
		                     width : 250,
		                     id : me.__make_id("is_enable"),
		                     fieldLabel : "状态<font color = 'red'>*</font>",
		                     items : [
		                         {boxLabel : "上线", name : "status",value : 1, id : me.__make_id("is_enable_yes")},
		                         {boxLabel : "下线(新增或修改)",name : "status",value : 0,id : me.__make_id("is_enable_no"),checked : true}
		                     ],
		                     listeners : {
		                         change : function(settlement){
		
		                         }
		                     }
		                 },*/
		                 {xtype : "displayfield", value : ""},
		               	 {xtype : "compositefield",fieldLabel : "售价<font color = 'red'>*</font>", 
	                    	items : [ 
	                    	         {xtype : 'numberfield',allowDecimals: true,fieldLabel : "售价", id : me.__make_id("price"),width : 120,allowBlank:false},
	                    	         {xtype : "displayfield", value : "元"}
	                        ]
	                     },
	                     {xtype : "displayfield", value : ""},
	                     {xtype : "compositefield", items: [ 
	                             {xtype:"textfield",fieldLabel : "第三方活动ID<font color = 'red'>*</font>", id : me.__make_id("s_third_act_id"),value : "",width : 120,allowBlank:false},
	                             {xtype : "displayfield", value : "<font color = 'blue'>如疯狂夺宝为1000001</font>"},
		                 ]},
		                 {xtype : "displayfield", value : ""},
		                 {xtype : "compositefield", items: [ 
		                        {xtype:"textfield",fieldLabel : "第三方活动标识<font color = 'red'>*</font>", id : me.__make_id("s_third_act_val"),value : "",width : 120,allowBlank:false},
		                        {xtype : "displayfield", value : "<font color = 'blue'>只填数字，如疯狂夺宝为场次 1-初级 2-中级 3-高级</font>"},
		                 ]},
		                 {xtype : "displayfield", value : ""},
		                 {xtype : "compositefield", items: [ 
	                            {xtype:"textfield",fieldLabel : "第三方发货地址", id : me.__make_id("s_third_act_dest"),value : "",width : 400},
	                            {xtype : "displayfield", value : "<font color = 'blue'>暂可不填</font>"},
	                     ]},
	                     {xtype : "displayfield", value : ""},
	                     {xtype : "compositefield", items: [ 
                                {xtype:"numberfield",fieldLabel : "支付流水转入uid", id : me.__make_id("transfer_uid"),value : "",width : 120},
	                            {xtype : "displayfield", value : "<font color = 'blue'>暂可不填</font>"},
                         ]},
	                     {xtype : "displayfield", value : ""},
	                     {xtype : "compositefield", fieldLabel : "渠道<font color = 'red'>*</font>", 
							items : [
								new QuickSearch({fieldLabel: "", name: "channel_name",id : "channel_id", url : utils.build_url("adminChannel/getBindProChIds?operation="+me.type+"&config_id="+me.data.id), width: 300, height : 220, initValues: initChannels}),
								{xtype : "displayfield", value : "&nbsp;&nbsp;&nbsp;一级分类<font color = 'red'>*</font>:"},
								new QuickSearch({fieldLabel: "", name: "name",id : "product_type_group_id", url : utils.build_url("adminProductTypeGroup/getList"), width: 300, height : 220, initValues: initTypeGroups})
						    ]
					     },
					     {xtype : "button", fieldLabel : " ", text : "选择全部渠道", icon: "static/libs/icons/application_edit.png", height : 20, handler : function(b){
							var search_channel = Ext.getCmp("channel_id");
							var search_channel_store = search_channel.store;
							var records = search_channel_store.getRange();
							for(var i = 0; i < records.length; i++){
								var record = records[i];
								search_channel.addRecord(record);
							}
							utils.show_msg("成功添加"+records.length+"条渠道");
						}}
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
               {name: "name"}
            ]);
        },
        
        get_data : function(){
        	
        	var data = {};
            //id
            data.id = this.__get_comp("id").getValue();
            
            //是否默认勾选
            data.is_default_check = this.__get_comp("is_default_check").getValue().value;
            
             //状态
//            data.is_enable = this.__get_comp("is_enable").getValue().value;
            
            
            //方案（标题）
            var title = this.__get_comp("title").getValue();
            if(!title){
            	utils.show_msg("<font color='red'>方案不能为空</font>");
            	return false;
            }
             data.title = title;
             
            //售价
            var price = this.__get_comp("price").getValue();
            if(!price){
            	utils.show_msg("<font color='red'>售价不能为空</font>");
            	return false;
            }
            data.price = price;
            
            //第三方活动ID
            data.third_act_id = this.__get_comp("s_third_act_id").getValue();
            if(!data.third_act_id){
            	utils.show_msg("第三方活动ID不能为空");
            	return false;
            }
            
            //第三方活动标识（场次）
            data.third_act_val = this.__get_comp("s_third_act_val").getValue();
            if(!data.third_act_val){
            	utils.show_msg("第三方活动标识不能为空");
            	return false;
            }
            
            //第三方发货地址
            data.third_act_dest = this.__get_comp("s_third_act_dest").getValue();
            
            //支付流水转入uid
            data.transfer_uid = this.__get_comp("transfer_uid").getValue();
            
            //渠道
            var select_channels = Ext.getCmp("channel_id").getValueEx();
            if(select_channels.length == 0){
            	utils.show_msg("请选择渠道");
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
            	utils.show_msg("请选择一级分类");
            	return false;
            }
            var typeGroups = new Array();
            for(var i = 0; i<select_typeGroups.length; i++){
				var product_type_group_id = select_typeGroups[i].product_type_group_id;
				var name = select_typeGroups[i].name;
				typeGroups[i] ={"product_type_group_id": product_type_group_id,"name" :name}
            }
            data.typeGroups = typeGroups;
          
            
        	return data;
        },
        
        
        
        _init : function(data){
        	
            this.__get_comp("id").setValue(data.id);
            var check = this.__get_comp("is_default_check");
            if(data.is_selected == 1){
            	check.setValue(this.__make_id("is_check_yes"),true);
            }else if(data.is_selected == 0){
            	check.setValue(this.__make_id("is_check_no"),true);
            }
            
            /*var enable = this.__get_comp("is_enable");
            if(data.is_enable == 1){
            	enable.setValue(this.__make_id("is_enable_yes"),true);
            }else if(data.is_enable == 0){
            	enable.setValue(this.__make_id("is_enable_no"),true);
            }*/
            
            this.__get_comp("title").setValue(data.title);
            this.__get_comp("price").setValue(data.price);
            this.__get_comp("s_third_act_val").setValue(data.third_act_val);
            this.__get_comp("s_third_act_id").setValue(data.third_act_id);
            this.__get_comp("s_third_act_dest").setValue(data.third_act_dest);
            this.__get_comp("transfer_uid").setValue(data.transfer_uid);
        }
        
	});
	

	
	
 	exports.ProductBindPromotionAddOrEdit = ProductBindPromotionAddOrEdit;
});
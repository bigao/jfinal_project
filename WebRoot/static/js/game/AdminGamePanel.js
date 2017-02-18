define(function(require, exportss, module){
	var utils = require('../utils.js');
	var gip = require('./GameBaseInfoPanel.js');
	var agpp = require('./GameChannelGroupPanel.js');
	var gptp = require('./GameProductTypePanel.js');
	//var game_id = game_id;
	var AdminGamePanel = Ext.extend(Ext.Panel,{
		__make_id : function(name){
			return "AdminGamePanel" + name;
		},
		__get_cmp : function(name){
            var id = this.__make_id(name);
            return Ext.getCmp(id);
        },
        constructor : function(){
        	var me = this;
        	var game_id = check_game_id;
        	this.game_id = game_id;
        	this.base_info = "";
        	this.channel_groups = "";
        	this.product_types = "";
        	this.gameInfoPanel = new gip.GameBaseInfoPanel("GameBaseInfoPanel");
        	this.gameChannelGroupPanel = new agpp.GameChannelGroupPanel("GameChannelGroupPanel", game_id);
        	this.gameProductTypePanel = new gptp.GameProductTypePanel("", game_id);
        	var title = "";
        	if(!this.check_game_id()){
        		title = "新增游戏";
        	}
        	else{
        		title = "游戏编辑";
        	}
        	AdminGamePanel.superclass.constructor.call(this,{
        		title : title,
        		layout : 'fit',
        		border: false,
        		tbar : this.createTbar(),
                items:[
                    this.createTabPanel(),
                ],
                listeners : {
        			render : function(p){
        				//当游戏id存在时才初始化数据
        				if(me.check_game_id()){
        					this._init();
        				}
        			}
        		}
        	});
        },
        createTabPanel : function(){
        	var me = this;
        	var tabPanel = new Ext.TabPanel({
                activeTab: 0,
                frame:true,
                defaults:{autoScroll: true},
                items:[
                    {title: '游戏基础信息', items : [me.gameInfoPanel], name : "gameInfoPanel", id : me.__make_id("gameInfoPanel")},
                    {title: '游戏区服信息', items : [me.gameChannelGroupPanel], name : "gameChannelGroupPanel", id : me.__make_id("gameChannelGroupPanel")},
                    {title: '商品类型信息', items : [me.gameProductTypePanel], name : "gameProductTypePanel", id : me.__make_id("gameProductTypePanel")},
                ],
                listeners : {
                	render : function(){
                		//保存游戏基本信息
                		me.gameInfoPanel.on_save = function(){
                			var data = me.gameInfoPanel.get_data();
    						if(data == false){
    							return false;
    						}
    						var str = Ext.util.JSON.encode(data);
                            //logo需要单独一个字段
                            var logo_file = data.logo;
                            //编辑游戏保存之前的游戏名称
                            var  game_name_start_value =  data.game_name_start_value;
                            //XXX 使用html5的功能
                            var form = new FormData();
                            form.append("data", str);
                            form.append("game_name_start_value", game_name_start_value);
                            form.append("logo", logo_file);
                            var xmlhttp = new XMLHttpRequest();
                            xmlhttp.onreadystatechange=callback;  
                            var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "请耐心等待正在保存关联商品游戏名称中..." });
                 			myMask.show();
                            xmlhttp.open("POST", utils.build_url("baseGameInfo/addOrUpdateBaseInfo"), true);
                            xmlhttp.onload = function(e){
                            	//
                            	var resp = Ext.util.JSON.decode(e.currentTarget.response);
                                //失败了
                                if(!resp.success){
                                    utils.show_msg(resp.msg);
                                    return;
                                }
                                //设置game_id
                                var data = resp.data;
                                console.log("game_id"+data.game_id);
                                me.gameInfoPanel.game_id = data.game_id;
                                me.game_id = data.game_id;
            					me.gameChannelGroupPanel.game_id = data.game_id;
            		        	me.gameProductTypePanel.game_id = data.game_id;
                                //设置全局变量
                                utils.set_data("game_name", data.game_name);
            					utils.set_data("game_id", data.game_id);
                                utils.tips(resp.msg);
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
                            	            utils.show_msg("同步更新关联的商品游戏名称数据过大超时 或者 后台异常!");
                            	            return;
                            	        }  
                            	    }   
                            	 }
                		}
                	},
                	tabchange : function(t, new_tab){
                		var gameInfoPanelCmp = me.__get_cmp("gameInfoPanel");
                		var gameChannelGroupPanel = me.__get_cmp("gameChannelGroupPanel");
                		var gameProductTypePanel = me.__get_cmp("gameProductTypePanel");
                		if(new_tab.name != "gameInfoPanel"){
                			//如果tab的焦点不在游戏基础信息了，判断是否有游戏id
                			if(!me.check_game_id()){
                				utils.show_msg("请保存游戏信息");
                				tabPanel.setActiveTab(gameInfoPanelCmp);
                			}
                		}
                		if(!me.check_game_id()){
                			return;
                		}
                		if(new_tab == gameInfoPanelCmp){
                			if(me.base_info == ""){
                				//获取游戏基本信息
                    			var params = {game_id : me.game_id};
                    			utils.http_request(utils.build_url("baseGameInfo/getGameBaseInfo"), params, function(json){
                    				if(json.success){
                    					var base_info = json.data;
                    					me.base_info = base_info;
                    					me.gameInfoPanel.set_data(base_info);
                    					
                    					
                    				}
                    			});
                			}
                		}
                	}
                }
        	});
        	return tabPanel;
        },
        //true 存在, false 不存在
        check_game_id : function(){
        	return this.game_id != undefined && this.game_id != ""
        },
        createTbar : function(){
        	var me = this;
        	return new Ext.Toolbar({
        		buttonAlign : "center",
        		items : [
    		         {xtype :"label", id :me.__make_id("top_label"), height : 50, text : "游戏区服信息" },
        		],
        	});
        },
        refresh_info : function(){
        	var top_cmp = this.__get_cmp("top_label");
        	//游戏基本信息
        	var game_info_data = this.gameInfoPanel.get_data();
        	var game_name = game_info_data.game_name;
        	var channel_groups = this.gameChannelGroupPanel.get_data().channel_groups;
        	//区服分组个数
        	var category_num = 0;
        	//区服总个数
        	var partition_num =0;
        	for(var i = 0; i<channel_groups.length; i++){
        		var categorys = channel_groups[i].partition_category;
        		category_num +=categorys.length;
        		for(var j = 0; j<categorys.length; j++){
        			partition_num +=categorys[j].partitions.length;
        		}
        	}
        	var product_types = this.gameProductTypePanel.get_data();
        	var str = String.format("游戏【"+game_name+"】区服信息：已添加{0}个渠道组{1}个区分组{2}个区服, 游戏类型信息：已添加{3}个类型",channel_groups.length, category_num, partition_num, product_types.length);
        	top_cmp.setText(str);
        },
        _init : function(){
        	var me = this;
        	var params = {game_id : this.game_id};
			utils.http_request(utils.build_url("adminGamePanel/getGameInfo"), params, function(json){
				if(json.success){
					var data = json.data;
					var game_name = data.game_name;
					var game_id = data.game_id;
					//将一些相关信息保存为全局变量
					utils.set_data("game_name", game_name);
					utils.set_data("game_id", game_id);
					
					//初始化数据
					//游戏基本信息
					var base_info = data.base_info;
					me.base_info = base_info;
					me.gameInfoPanel.set_data(base_info);
					
					//游戏额外信息，子包、其它信息、截图等
					var sub_games = data.sub_games;
					var game_pics = data.game_pics;
					var game_channel = data.game_channels;
					me.gameInfoPanel.set_ext_data(sub_games,game_pics,base_info,game_channel);
					
					//游戏区服信息
					var channel_groups = data.channel_groups;
					me.channel_groups = channel_groups;
					me.gameChannelGroupPanel.set_data(channel_groups);
					
					//游戏商品类型信息
                    var product_types = data.product_types;
                    me.product_types = product_types;
                    me.gameProductTypePanel.set_data(product_types);
                    
                    //刷新显示
                    me.refresh_info(data);
                    
				}
            });
			////刷新显示
			me.gameProductTypePanel.refresh_info = function(){
        		me.refresh_info();
        	}
			//刷新显示
			me.gameChannelGroupPanel.info_change = function(){
				me.refresh_info();
			}
        }
        
	});
	
	var viewPort = new Ext.Viewport({
        layout: 'fit',
        items: [{
            xtype: 'panel',
            items: [new AdminGamePanel("AdminGamePanel")],
            layout: 'fit',
            region: 'center'
        }]
    });

    viewPort.render(document.body);
});

define(function(require, exportss, module){
	var utils = require('../utils.js');
	var gptp = require('./GameKeFuProductTypePanel.js');
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
        	this.gameProductTypePanel = new gptp.GameProductTypePanel("", game_id);
        	var title = "";
        	if(!this.check_game_id()){
        		title = "客服新增游戏";
        	}
        	else{
        		title = "客服游戏编辑";
        	}
        	AdminGamePanel.superclass.constructor.call(this,{
        		title : title,
        		layout : 'fit',
        		border: false,
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
                    {title: '客服商品类型信息', items : [me.gameProductTypePanel], name : "gameProductTypePanel", id : me.__make_id("gameProductTypePanel")},
                ],
                listeners : {
                	render : function(){
}
                	},
                	tabchange : function(t, new_tab){
                		var gameProductTypePanel = me.__get_cmp("gameProductTypePanel");
                }
        	});
        	return tabPanel;
        },
        //true 存在, false 不存在
        check_game_id : function(){
        	return this.game_id != undefined && this.game_id != ""
        },
        refresh_info : function(){
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

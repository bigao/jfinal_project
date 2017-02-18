define(function(require, exports){
	var utils = require('../utils.js');
	var gcp = require('./GameChannelGroupInfoPanel.js');
	var agpw = require('./GameChannelGroupWindow.js');
	var GameChannelGroupPanel = Ext.extend(Ext.Panel,{
		__make_id : function(name){
			return "GameChannelGroupPanel" + name;
		},
		__get_cmp : function(name){
            var id = this.__make_id(name);
            return Ext.getCmp(id);
        },
        constructor : function(id, game_id){
        	var me = this;
        	this.groups = {};
        	this.game_id = game_id;
        	this.save_button_status = true; //true 为保存按钮不可用， false为可用
        	GameChannelGroupPanel.superclass.constructor.call(this, {
        		id : id,
        		//title : "游戏区服信息",
        		tbar : me.createTbar(),
        		listeners : {
        			render : function(p){
        				
        			}
        		}
        	});
        },
        
        createTbar : function(){
        	var me = this;
        	return new Ext.Toolbar({
        		items : [
        		     '-','-',
    		         {xtype : "button" , text : "添加渠道组", icon: 'static/libs/icons/add.png', 
        		    	width : 50, height : 30,
    		        	handler : function(b){
    		        		var other_channels = [];
                        	for(var n in me.groups){
                        		var panel = me.groups[n];
                        		other_channels = other_channels.concat(panel.channels);
                        	}
		    				var win = new agpw.GameChannelGroupWindow("add", other_channels);
		    				var group_name = utils.get_data("game_name");
		    				win.set_data({group_name : group_name, usable : 1,});
		    				//重写保存事件
		    				win.on_save = function(){
		    					var group_info = win.get_data();
		    					if(group_info == false){
		    						return false;
		    					}
                				//验证渠道组名是否已经存在
		    					if(!me.validate_add(group_info.group_name)){
		    		        		return false;
		    		        	}
                				//将信息的渠道组基本信息保存
		    					group_info.game_id = utils.get_data("game_id");
		    					var data = Ext.util.JSON.encode(group_info);
		    					var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "保存中，这可能需要一点时间..." });
		    					myMask.show();
	                    		utils.http_request(utils.build_url("gameChannelGroup/add"), {data: data}, function(json){
	                    			if(json.success){
	                    				//请求成功，将渠道组添加到界面上
	                    				group_info.id = json.data;
	                    				//新增的渠道分组中的区服分组为空的数组
	                    				group_info.partition_category = [];
	    		    					me.add_channel_group(group_info);
	                            		me.info_change();
	                            		myMask.hide();
	                            		win.close();
	                    			}
	                    		});
		    				}
		    				win.show();
    		        	}
    		         }
		         ],
        	});
        },
        add_channel_group : function(group){
        	var group_name = group.group_name;
        	if(!this.validate_add(group_name)){
        		return false;
        	}
        	var me = this;
        	var category_panel = new gcp.GameChannelGroupInfoPanel(Ext.id(), this.groups, group.channels, group.id);
    		category_panel.set_data(group);
    		category_panel.info_change = function(){
    			me.info_change();
            };
            //删除渠道组
            category_panel.delete_channel_group = function(){
            	delete me.groups[group.group_name];
            	me.remove(category_panel);
            };
            this.groups[group.group_name] = category_panel;
    		this.add(category_panel);
    		this.doLayout();
    		return true;
        },
        validate_add : function(group_name){
        	var panel = this.groups[group_name];
        	if(panel != undefined || panel !=null){
        		utils.show_msg("该渠道组名已经存在");
        		return false;
        	}
        	return true;
        },
        //当有内容变化时,调用
        info_change : function(){
        	// to be implement
        },
        get_data : function(){
        	var channel_groups_info = {game_id : this.game_id};
        	var channel_groups = [];
        	for(var group_name in this.groups){
        		var panel = this.groups[group_name];
        		var data = panel.get_data();
        		channel_groups.push(data);
        	}
        	channel_groups_info.channel_groups = channel_groups;
        	return channel_groups_info;
        },
        set_data : function(data, game_id){
        	this.game_id = game_id;
        	for(var i = 0; i<data.length; i++){
        		var group = data[i];
        		this.add_channel_group(group);
        	}
        }
	});
	exports.GameChannelGroupPanel = GameChannelGroupPanel;
});
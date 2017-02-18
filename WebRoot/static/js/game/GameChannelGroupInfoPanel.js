define(function(require, exports){
	var utils  = require('../utils');
	var agpcp = require('./GamePartitionCategoryPanel.js');
	var agpw = require('./GameChannelGroupWindow.js');
	var gcpcp = require('./CreateGamePartitionCategoryPanel.js');
	var GameChannelGroupInfoPanel = Ext.extend(Ext.Panel, {
		__make_id : function(name){
			return "GameChannelGroupInfoPanel :" + this.id + name;
		},
		__get_cmp : function(name){
            var id = this.__make_id(name);
            return Ext.getCmp(id);
        },
		constructor : function(id, groups, channels, group_id){
			var me = this;
			this.group_info = {};
			this.id = id;
			this.groups = groups;
			this.channels = channels;
			this.game_create_part_Panel = new gcpcp.CreateGamePartitionCategoryPanel(Ext.id(), group_id);
			GameChannelGroupInfoPanel.superclass.constructor.call(this, {
				id : id,
				layout : "fit",
        		autoHeight:true,
        		tbar : new Ext.Toolbar({
        			style: "background:#D3D3D3",
        			items :[
                    {xtype : "hidden", id : me.__make_id("id")},
                    "渠道组名称:",{xtype : "textfield", id : me.__make_id("group_name"), readOnly : true,},
                    "-","-",
                    {xtype : "combo", allowBlank: false, width : 120, triggerAction: 'all', disabled : true,
                        typeAhead : true, mode : "local", 
                        id : me.__make_id("usable"),
                        store : [[1, "上线"], [0, "下线"]],
                    },
                    "-","-",
                    "渠道:",{xtype : "textfield",width : 700, id : me.__make_id("channels"), readOnly : true },
                    "->",
                    {xtype : "button", text : "修改该渠道组区服", icon : "static/libs/icons/application_edit.png", handler : function(){
                    	var other_channels = [];
                    	for(var n in me.groups){
                    		var panel = me.groups[n];
                    		if(panel.getId() == me.getId())
                    			continue;
                    		other_channels = other_channels.concat(panel.channels);
                    	}
                    	var win = new agpw.GameChannelGroupWindow("modify", other_channels);
                    	var group_info = me.get_data();
                    	win.set_data(group_info);
                    	win.on_save = function(){
                    		//重写保存方法
                    		var group_info = win.get_data();
                    		if(!group_info){
                    			return ;
                    		}
                    		group_info.game_id = utils.get_data("game_id");
                    		var data = Ext.util.JSON.encode(group_info);
                    		utils.http_request(utils.build_url("gameChannelGroup/update"), {data: data}, function(json){
                    			if(json.success){
                    				me._refresh_data(group_info);
                            		me.info_change();
                            		win.close();
                    			}
                    		});
                    	}
        				win.show();
                    }},
                    "-","-",
                    {xtype : "button", text : "删除该渠道组及区服", icon : "static/libs/icons/cancel.png", handler : function(){
                    	utils.show_confirm("删除该渠道组中的所有区服是不可恢复的操作，确定要删除吗？",function(){
                    		//先蒙起来
    		        		var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "删除中，这可能需要一点时间..." });
    		        		myMask.show();
                    		var id = me.__get_cmp("id").getValue();
                    		var game_id = utils.get_data("game_id");
                        	utils.http_request(utils.build_url("gameChannelGroup/delete"), {group_id : id, game_id : game_id}, function(json){
                        		if(json.success){
                    				me.info_change();
                                	me.game_create_part_Panel.remove_all();
                                	
                                	me.group_info.partition_category = [];
                                	me.delete_channel_group();
                                	me.doLayout();
                    			}
                        		//完成请求后重新去除蒙板
                   			 	myMask.hide();
                    		}, function(json){
                    			//完成请求后重新去除蒙板
                   			 	myMask.hide();
                   			 	utils.show_msg(json.msg);
                    		});
                    	});
                    }},
                ]}),
        		items : [this.game_create_part_Panel],
			});
		},
		_convert_channels_to_string: function(channels){
            if(channels.length > 0){
                var str_channels = channels[0].channel_name.replace("客户端", "");
                for(var i=1; i<channels.length; ++i){
                    str_channels += "，" + channels[i].channel_name.replace("客户端", "");
                }
                return str_channels;
            }
            return "";
        },
        _refresh_data : function(group){
        	//重新设置值
        	this._set_data(group);
			
        },
        info_change : function(){
        	//to be implement
        },
        delete_channel_group : function(){
        	//to be implement
        },
        get_data : function(){
        	var id = this.__get_cmp("id").getValue();
        	var group_name = this.__get_cmp("group_name").getValue();
        	var usable = this.__get_cmp("usable").getValue();
        	var channels = this.group_info.channels;
        	var partition_category = this.game_create_part_Panel.get_data();
        	var group_info = {id : id, group_name : group_name, usable : usable, channels : channels, partition_category : partition_category};
        	return group_info;
        },
        _set_data : function(group){
        	this.group_info = {
				id : group.id,
				group_name : group.group_name, 
				usable : group.usable, 
				channels : group.channels, 
				partition_category : group.partition_category
			};
			this.__get_cmp("id").setValue(group.id);
			this.__get_cmp("group_name").setValue(group.group_name);
			this.__get_cmp("usable").setValue(group.usable);
			var channels_name = this._convert_channels_to_string(group.channels);
			this.channels = group.channels;
			this.__get_cmp("channels").setValue(channels_name);
        },
		set_data : function(group){
			this._set_data(group);
			//添加该渠道组的游戏区服分组
			this.game_create_part_Panel.set_data(group.partition_category, group.id);
		}
	});
	exports.GameChannelGroupInfoPanel = GameChannelGroupInfoPanel;
});
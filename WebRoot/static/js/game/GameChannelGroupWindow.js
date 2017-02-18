define(function(require, exports){
	var utils = require("../utils.js");
	var xw = require("../../com/XWindow.js");
	var gcp = require('./GameChannelPanel.js');
	var gcpcp = require('./CreateGamePartitionCategoryPanel.js');
	var GameChannelGroupWindow = Ext.extend(xw.XWindow, {
		__make_id : function(name){
			return "GameChannelGroupWindow" + name;
		},
		__get_cmp : function(name){
            var id = this.__make_id(name);
            return Ext.getCmp(id);
        },
        constructor : function(op_type, other_channels){
        	var me = this;
        	var op_name = "";
        	if(op_type == "add"){
        		op_name = "新增";
        	}
        	if(op_type == "modify"){
        		op_name = "修改";
        	}
        	this.other_channels = other_channels;
        	this.game_channel_panel = new gcp.GameChannelPanel(other_channels);
        	GameChannelGroupWindow.superclass.constructor.call(this, {
        		id : Ext.id(),
        		title : op_name + "渠道组",
        		width : 800,
        		height : 500,
                autoDestroy: true,
                autoScroll : true,
                closable: true,
                closeAction: "close",
                resizable: true,
                modal: true,
                frame : true,
                tbar : new Ext.Toolbar(
            		{items : [{xtype : "button", text : "保存", icon : "static/libs/icons/accept.png", width : 100, height : 30,
            			handler : function(){
            				me.on_save();
            			}
            		}]}
                ),
        		items : [me.createFormPanel(), this.game_channel_panel],
        	});
        	
        },
        createFormPanel : function(){
        	var me = this;
        	var form = new Ext.form.FormPanel({
        		padding : 20,
                autoHeight: true,
        		items : [
        		     {xtype : "hidden", id : me.__make_id("id")},
    		         {xtype : "textfield", fieldLabel : "渠道组名称", width : 220, id : me.__make_id("group_name")},
    		         {xtype : "combo", fieldLabel : "是否上线", allowBlank: false, width : 220, triggerAction: 'all', editable : false,
                         typeAhead : true, mode : "local", 
                         id : me.__make_id("usable"),
                         store : [[1, "上线"], [0, "下线"]],
                     },
    		    ],
        	});
        	return form;
        }, 
        _on_save : function(){
        	// 外部调用时重写，已满足是新增保存还是修改保存操作
        },
        get_data : function(){
        	var id = this.__get_cmp("id").getValue();
        	var group_name = this.__get_cmp("group_name").getValue();
        	if(group_name == ""){
        		utils.show_msg("请填写渠道组名称");
        		return false;
        	}
        	var usable = this.__get_cmp("usable").getValue();
        	var channels = this.game_channel_panel.get_data();
        	var group = {id : id, group_name : group_name, usable : usable,channels : channels};
        	return group;
        },
        set_data : function(group){
        	this.__get_cmp("id").setValue(group.id);
        	this.__get_cmp("group_name").setValue(group.group_name);
        	this.__get_cmp("usable").setValue(group.usable);
        	if(group.channels != undefined)
        		this.game_channel_panel.set_data(group.channels);
        	this.doLayout();
        }
	});
	exports.GameChannelGroupWindow = GameChannelGroupWindow;
});
define(function(require, exports, module){
    var gcw = require("./GameChannelSelectWindow.js");
    var utils = require("../utils.js");

	var GameChannelPanel = Ext.extend(Ext.grid.EditorGridPanel, {
		constructor: function(other_channels){
			var me = this;
            this.other_channels = other_channels;
            this.record_fields = Ext.data.Record.create([
                {name: "channel_id"},
                {name: "channel_name"},
                {name: "down_url"},
                {name: "file_size"}
            ]);
            this.store = new Ext.data.JsonStore({
                root: "data",
                fields: this.record_fields
            });

			GameChannelPanel.superclass.constructor.call(this, {
				loadMask : true,
                stripeRows : true,
                layout: "fit",
                autoHeight: true,
                clicksToEdit: 1,
                anchor: "95%",
                border: false,
                columnLines: true,
                view: new Ext.grid.GridView({
                    forceFit: true,
                    enableRowBody: true
                }),
                store: this.store,
                columns: [
                    {header:"渠道名称", dataIndex:"channel_name", align:"center", width:50, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                        return "<b>" + value + "</b>";
                    }},
                    /*{header:"渠道包下载地址", dataIndex:"down_url", align:"center", width:50, editor: new Ext.form.TextField()},
                    {header:"渠道包大小(MB)", dataIndex:"file_size", align:"center", width:50, editor: new Ext.form.NumberField()},*/
                    {header:"操作", dataIndex:"opt", align:"center", width:30, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                        return "<a href='javascript:void(0)'>删除</a>";
                    }},
                ],
                tbar: [
                    '->',
                    {xtype: "button", text: "添加渠道", icon: "static/libs/icons/add.png", handler: function(){
                        var records = me.store.getRange();
                        var exclu_channels = [];
                        for(var i=0; i<records.length; ++i){
                            exclu_channels.push({channel_id: records[i].get("channel_id")});
                        }
                        if(me.other_channels){
                        	for(var i = 0;i<me.other_channels.length; i++){
                        		exclu_channels.push({channel_id : me.other_channels[i].channel_id});
                        	}
                        }
                        var channel_win = new gcw.GameChannelSelectWindow(exclu_channels);
                        channel_win.onAccept = function(selections){
                            for(var i=0; i<selections.length; ++i){
                                var v = selections[i];
                                var record = new me.record_fields({channel_id: v.get("channel_id"), channel_name: v.get("channel_name"), down_url: "", file_size: ""});
                                me.store.add(record);
                            }

                            channel_win.close();

                            //刷新标题中的统计数据
                            me.refresh_info(me);
                        }
                        channel_win.show();
                    }}
                ],
                listeners: {
                    cellclick: function(p, rowIndex, columnIndex, e){
                        var fieldName = me.getColumnModel().getDataIndex(columnIndex);
                        if(fieldName == "opt"){
                        	Ext.MessageBox.confirm('删除游戏渠道弹出框',"删除该游戏渠道后,<font color='red'>就不能上该游戏渠道的商品,对应的游戏商品分类也无效,搜索不到关联的商品</font>,确认删除吗?",function(btn){
                        		if("yes" == btn){
                                    me.store.removeAt(rowIndex);
                                    //刷新标题中的统计数据
                                    me.refresh_info(me);
                        		}
                        	});
                        }
                    }
                }
			});
		},

		get_records: function(){
			return this.store.getRange();
		},

        refresh_info: function(panel){
            //to be implemented
        },

		is_valid : function(){
            return this.store.getCount() != 0;
        },

        //获取数据
        get_data : function(){
            var data = [];
            var records = this.store.getRange();
            for(var i=0; i<records.length; ++i){
                data.push({
                    channel_id: records[i].get("channel_id"),
                    channel_name: records[i].get("channel_name"),
                    down_url: records[i].get("down_url"),
                    file_size: records[i].get("file_size")
                });
            }
            return data;
        },

        reset : function(){
            this.store.removeAll();
        },

        set_data: function(channel_info){
            for(var i=0; i<channel_info.length; ++i){
                var record = new this.record_fields({
                    channel_id: channel_info[i].channel_id,
                    channel_name: channel_info[i].channel_name,
                    down_url: channel_info[i].down_url,
                    file_size: channel_info[i].file_size,
                });
                this.store.add([record]);
            }

            this.refresh_info(this);
        }
	});

	exports.GameChannelPanel = GameChannelPanel;
});
define(function(require, exports, module){
    var utils = require("../utils.js");
    var xsm = require("../../com/SelectionModelRectify.js");
    var xw = require('../../com/XWindow.js');
    var GameChannelSelectWindow = Ext.extend(Ext.Window, {
        constructor: function(exclu_channels){
            this.exclu_channels = exclu_channels;

            var me = this;
            var grid = this.create_channel_grid();
            GameChannelSelectWindow.superclass.constructor.call(this, {
                id: "GameChannelSelectWindow",
                title: "游戏渠道列表",
                layout: "fit",
                autoDestroy: true,
                closable: true,
                closeAction: "close",
                resizable: true,
                modal: true,
                frame : true,
                width: 1000,
                height: 600,
                tbar: [
                    {xtype: "button", text: "确认选择", icon: "static/libs/icons/accept.png", style: "border: solid 1px gray; background-color: #ccc;", width: 100, height: 30, handler: function(){
                        var selections = grid.getSelectionModel().getSelections();
                        if(selections.length == 0){
                            utils.show_msg("请选择需要添加的渠道");
                            return;
                        }
                        me.onAccept(selections);
                    }}
                ],
                items: [grid],
                listeners: {
                    show: function(p){
                        var coord = p.getPosition(true);
                        var x = coord[0];
                        var y = coord[1];
                        if(x < 0)
                            x = 10;
                        if(y < 0)
                            y = 10;
                        p.setPosition(x, y);
                    }
                }
            });
        },

        create_channel_grid: function(){
            var me = this;
            var sm = new xsm.XCheckboxSelectionModel();
            
            var grid = new Ext.grid.GridPanel({
                autoDestroy: true,
                layout: "fit",
                loadMask : true,
                stripeRows : true,
                autoScroll : true,
                view: new Ext.grid.GridView({
                    forceFit: true,
                    enableRowBody: true
                }),
                sm: sm,
                store: new Ext.data.JsonStore({
                    url: utils.build_url("adminChannel/getList"),
                    totalProperty: "total_count",
                    root: "data",
                    fields: [
                        {name: "id"},
                        {name: "channel_id"},
                        {name: "weight"},
                        {name: "channel_home_url"},
                        {name: "usable"},
                        {name: "channel_name"},
                    ],
                    listeners: {
                        beforeload: function(s){
                            var qudaos = "";
                            if(me.exclu_channels && me.exclu_channels.length > 0){
                                qudaos += me.exclu_channels[0].channel_id;
                                for(var i=1; i<me.exclu_channels.length; ++i){
                                    qudaos += "," + me.exclu_channels[i].channel_id;
                                }
                            }
                            s.baseParams.page = 1;
                            s.baseParams.rows = 1000;
                            s.baseParams.sort = "weight";
                            s.baseParams.order = "desc";
                            s.baseParams.qudaos = qudaos;
                            s.baseParams.usable = 1;
                            return true;
                        },
                        load: function(s){
                            //grid.getSelectionModel().selectAll();
                        	s.filterBy(function(record, id){
                        		var exclu_channels = me.exclu_channels;
                        		for(var i = 0; i < exclu_channels.length; i++){
                        			var value = exclu_channels[i].channel_id;
                        			if(record.get("channel_id") == value){
                        				return false;
                            		}
                        		}
                        		return true;
                        	});
                        }
                    }
                }),
                columns: [
                    new Ext.grid.RowNumberer(),
                    sm,
                    {header:"编号", dataIndex:"channel_id", align:"center", width:25},
                    {header:"渠道名称", dataIndex:"channel_name", align:"center", width:50},
                    {header:"状态", dataIndex:"usable", align:"center", width:30, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	if(value == 1){
                    		return "上线";
                    	}
                    	else{
                    		return "<font color='red'>下线</font>";
                    	}
                    }},
                    {header:"权重", dataIndex:"weight", align:"center", width:30, },
                    {header:"渠道官方地址", dataIndex:"channel_home_url", align:"center", width:80}
                ],
                listeners: {
                    render: function(g){
                        g.store.load();
                    }
                }
            });
            return grid;
        },

        //to be implemented
        onAccept: function(selections){
            alert("fuck...");
        }
    });

    exports.GameChannelSelectWindow = GameChannelSelectWindow;
});
define(function(require, exports, module) {
   
	var URLS = {
        GET: "adminGame/getList",//获取列表url
    };
        
    var utils = require('./utils.js');
    
    var createDataStore =  function() {
        return new Ext.data.JsonStore({
            autoDestroy: true,
            url: URLS.GET,
            baseParams: {start:0, limit: 50},
            root: 'data',
            idProperty: 'id',
            totalProperty: 'total_count',
            fields:[ 
                {name: 'id'},
                {name: 'game_id'},
                {name: 'game_name'},
                {name: 'game_initial'},
                {name: 'game_info'},
                {name: 'game_pic'},
                {name: 'weight'},
                {name: 'usable'},
                {name: 'create_time'},
                {name: 'modify_time'},
                {name: 'platform'},
                {name: 'game_home_url'}
            ],
            listeners :{
    			beforeload : function(s){
    				 var game_name = Ext.getCmp('select_game_name').getValue();
				     // 首字母
				     var game_initial = Ext.getCmp('select_game_initial').getValue();
				     var game_id = Ext.getCmp('select_game_id').getValue();
			        //加载条件参数查询....
			        s.baseParams.game_name = game_name;
         			s.baseParams.game_initial = game_initial;
         			s.baseParams.game_id = game_id;
   			}
   		}
        });
    };

    var myPanel = Ext.extend(Ext.grid.EditorGridPanel, {
        createColumn: function(me) {
            return [
                // new Ext.grid.RowNumberer,
                me.sm,
                {header: 'ID', dataIndex: 'id', align: 'left', sortable: true, width: 100,hidden:true},
                {header: '游戏编号', dataIndex: 'game_id', align: 'left', sortable: false, width: 100},
                {header: '游戏名称', dataIndex: 'game_name', align: 'left', sortable: false, width: 100},
                {header: '首字母', dataIndex: 'game_initial', align: 'left', sortable: false, width: 100},
                {header: '游戏描述', dataIndex: 'game_info', align: 'left', sortable: false, width: 100},
                {header: '图片URL', dataIndex: 'game_pic', align: 'left', sortable: false, width: 100},
                {header: '权重', dataIndex: 'weight', align: 'left', sortable: false, width: 100},
                {header: '是否上线', dataIndex: 'usable', align: 'left', sortable: false, width: 100, 
                	renderer: function(value){
                		if(value==1){
                			return '上线';
                		}else{
                			return '下线';
                		}
                	}
                },
                {header: '创建时间', dataIndex: 'create_time', align: 'left', sortable: false,width: 100},
                {header: '修改时间', dataIndex: 'modify_time', align: 'left', sortable: false,width: 100},
                {header: '所属平台', dataIndex: 'platform', align: 'left', sortable: false, width: 100},
                {header: '游戏官方首页URL', dataIndex: 'game_home_url', align: 'left', sortable: false, width: 100},
                {header: '编辑', align: 'left', sortable: false, width: 100, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                	var OpLogId = utils.createGridBtn({
                        text : "编辑游戏",
                        icon : "static/libs/icons/application_form_magnify.png",
                        width : 80,
                        handler : function(){
                        	var gid = record.get("game_id");
                        	var gn = record.get("game_name");
                        	var link = prefix_path+"adminGamePanel?game_id="+gid;
                    		var node = {
                    			"attributes":{ "url":link}, 
                    			"checked":false,
                    			"iconCls":"",
                    			"state":"closed",
                    			"text":"编辑游戏["+gn+"]页" 
                    		};
//                    		window.open(link, "_blank");
//                    		parent.addTab(node);
                    		parent.postMessage(node, '*');
                        }
                    });
                	return '<div style="width:100px;float:left;"><span id="' + OpLogId + '" /></div>';
                }},
            ];
        },
      
        viewConfig : {
        	forceFit: true,
        },
        
        constructor: function() {
            var me = this;
            me.pageSize = 50; 
            me.store = createDataStore();
            me.sm = new Ext.grid.CheckboxSelectionModel();
            me.column = me.createColumn(me);
            Ext.QuickTips.init();
            Ext.form.Field.prototype.msgTarget='side';
            myPanel.superclass.constructor.call(this, {
                id: "tab:admin:game_list",
                title: "游戏列表",
                columns: me.column,
                layout: 'fit',
                loadMask: true,
                bbar: new Ext.PagingToolbar({store: this.store, pageSize: this.pageSize, displayInfo: true}),
                tbar: new Ext.Toolbar([
                   '游戏ID:',
                  	' ', ' ', ' ',
                  	{xtype: 'textfield', width: 150,id: 'select_game_id',name: 'select_game_id',enableKeyEvents : true,
  						listeners : {
  							keydown : function(t, e){
  								if(e.getKey() == e.ENTER){
  									me.load_data();
  								}
  							}
  						}
                  	},
                  	'游戏名称:',
                  	' ', ' ', ' ',
                  	{xtype: 'textfield', width: 150,id: 'select_game_name',name: 'select_game_name',enableKeyEvents : true,
                  		listeners : {
                  		keydown : function(t, e){
                  		if(e.getKey() == e.ENTER){
                  			me.load_data();
                  		}
                  	}
                  	}
                  	},
                   '首字母:',
                  	' ', ' ', ' ',
                  	{xtype: 'textfield', width: 150, id: 'select_game_initial',name: 'select_game_initial',enableKeyEvents : true,
  						listeners : {
  							keydown : function(t, e){
  								if(e.getKey() == e.ENTER){
  									me.load_data();
  								}
  							}
  						}
                  	},
                  	' ', ' ', ' ',
   					{xtype: 'button', text: '查 询',  width: 60, icon: 'static/libs/icons/zoom.png', 
   					    handler: function() {
   					    	me.load_data();
   					    }
   					 }
                ]),
                listeners:  {
                    render: function(g) {
                        me.load_data();
                        var tbar2 = me.createTbar2();
                        tbar2.render(g.tbar);
                    },
                    rowdblclick : function(grid, rowIndex, columnIndex, e){
                    	var record = grid.getStore().getAt(rowIndex);  // Get the Record
                        var gid = record.get("game_id");
                        var gn = record.get("game_name");
                    	var link = prefix_path+"adminGamePanel?game_id="+gid;
                		var node = {
                			"attributes":{ "url":link}, 
                			"checked":false,
                			"iconCls":"",
                			"state":"closed",
                			"text":"编辑游戏["+gn+"]页" 
                		};
//                		window.open(link, "_blank");
//                		parent.addTab(node);
                		parent.postMessage(node, '*');
                    }

                }
            });
        },
        load_data : function(){
        	this.store.load({params: {start:0, limit: this.pageSize}});
        },
        createTbar2 : function(){
        	return new Ext.Toolbar({
        		items : [
    		        {xtype : "button", text : "新增游戏", icon : "static/libs/icons/add.png", 
    		        	handler : function(){
//    		        		var link = "adminGamePanel";
    		        		var link = prefix_path+"adminGamePanel";
                    		var node = {
                    			"attributes":{ "url":link}, 
                    			"checked":false,
                    			"iconCls":"",
                    			"state":"closed",
                    			"text":"新增游戏页" 
                    		};
                    		parent.postMessage(node, '*');
//    		        		window.open(link, "_blank");
    		        	}
    		        }
		        ]
        	});
        }
        
    });
    
    var viewPort = new Ext.Viewport({
        layout: 'fit',
        items: [{
            xtype: 'panel',
            items: [new myPanel()],
            layout: 'fit',
            region: 'center'
        }]
    });

    viewPort.render(document.body);
});

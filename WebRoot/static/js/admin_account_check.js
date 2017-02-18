define(function(require, exports, module) {
    var QUERY_URLS = {
        LIST: "adminAccountCheck/list", //获取列表url
        GET: "adminAccountCheck/get"//查询详情
    };
    
    var isEnableStore = new Ext.data.SimpleStore({
        fields:['value','text'],
        data: [  
           [0,'否'],  
           [1,'是'] 
        ]  
    });
    
	var utils = require('../utils.js');
//	var clip = require('../../libs/ZeroClipboard.js');
    var createDataStore =  function() {
        return new Ext.data.JsonStore({
            autoDestroy: true,
            url: QUERY_URLS.LIST,
            id: 'allStore',
            baseParams: {start:0, limit: 50},
            root: 'data',
            idProperty: 'id',
            totalProperty: 'total_count',
            fields:[ 
                {name: 'id'},
                {name: 'busi_type'},
                {name: 'game_id'},
                {name: 'game_name'},
                {name: 'busi_id'},
                {name: 'channel_id'},
                {name: 'channel_name'},
                {name: 'account'},
                {name: 'password'}, 
                {name: 'info'},
                {name: 'remark'},
                {name: 'sync_status'},
                {name: 'create_time'},
                {name: 'update_time'},
                {name: 'result'},
                {name: 'deal_count'},
                {name: 'task'}
            ],
            listeners :{
    			beforeload : function(s){
			        var game_id = Ext.getCmp('select_game_id').getValue();
			        var busi_id = Ext.getCmp('select_busi_id').getValue();
			        var channel_id = Ext.getCmp('select_channel_id').getValue();
			        var account = Ext.getCmp('select_account').getValue();
			         //加载条件参数查询....
			        s.baseParams.game_id = game_id;
			        s.baseParams.busi_id = busi_id;
			        s.baseParams.channel_id = channel_id;
			        s.baseParams.account = account;
   			}
   		}
        });
    };
    
    var myPanel = Ext.extend(Ext.grid.EditorGridPanel, {
        createColumn: function(me) {
            return [
                // new Ext.grid.RowNumberer,
                me.sm,
                {header: 'ID', dataIndex: 'id', align: 'left', sortable: true, width: 90},
                {header: '业务类型', dataIndex: 'busi_type', align: 'left', sortable: false, width: 90},
                {header: '游戏ID', dataIndex: 'game_id', align: 'left', sortable: false, width: 90},
                {header: '游戏名称', dataIndex: 'game_name', align: 'left', sortable: false,width: 150},
                {header: '业务ID', dataIndex: 'busi_id', align: 'left', sortable: false,width: 250},
                {header: '渠道ID', dataIndex: 'channel_id', align: 'left', sortable: false,width: 90},
                {header: '渠道名称', dataIndex: 'channel_name', align: 'left', sortable: false,width: 120},
                {header: '账号', dataIndex: 'account', align: 'left', sortable: false,width: 120},
                {header: '密码', dataIndex: 'password', align: 'left', sortable: false,width: 120},
                {header: '说明', dataIndex: 'info', align: 'left', sortable: false,width: 250},
                {header: '备注', dataIndex: 'remark', align: 'left', sortable: false,width: 150},
                {header: '状态', dataIndex: 'sync_status', align: 'left', sortable: false, width: 60, 
                	renderer: function(value){
	             	   var store = isEnableStore;
	             	   for(var i=0; i<store.data.items.length; i++) {
	             		   if(store.data.items[i].data.value==value) {
	             			   return store.data.items[i].data.text;
	             		   }
	             	   }
	             	   return '';
     		   		}
                },
                {header: '创建时间', dataIndex: 'create_time', align: 'left', sortable: false,width: 150},
                {header: '更新时间', dataIndex: 'update_time', align: 'left', sortable: false,width: 150},
                {header: '返回结果', dataIndex: 'result', align: 'left', sortable: false,width: 90},
                {header: '处理次数', dataIndex: 'deal_count', align: 'left', sortable: false,width: 90},
                {header: '任务', dataIndex: 'task', align: 'left', sortable: false,width: 120}
           ];
        },
      
        viewConfig : {
        	//列数过多时，关闭自动调整列宽，显示横向滚动条，以显示完整的数据
        	//forceFit: true
        },
        
        constructor: function() {
            var me = this;
            me.pageSize = 50; 
            me.isEnableStore = isEnableStore;
            me.store = createDataStore();
            me.sm = new Ext.grid.CheckboxSelectionModel();
            me.column = me.createColumn(me);
            Ext.QuickTips.init();
            Ext.form.Field.prototype.msgTarget='side';
            myPanel.superclass.constructor.call(this, {
                id: "tab:admin:account_check_list",
                title: "账户检查列表",
                columns: me.column,
                layout: 'fit',
                loadMask: true,
                bbar: new Ext.PagingToolbar({store: this.store, pageSize: this.pageSize, displayInfo: true}),
                tbar: new Ext.Toolbar([
                  	'游戏ID:',
                  	' ', ' ', ' ',
                  	{xtype: 'textfield', width: 90,id: 'select_game_id',name: 'select_game_id',enableKeyEvents : true,
                  		listeners : {
                  			keydown : function(t, e){
                  				if(e.getKey() == e.ENTER){
                  					me.load_data();
                  				}
                  			}
                  		}
                  	},
                  	'业务ID:',
                  	' ', ' ', ' ',
                  	{xtype: 'textfield', width: 200,id: 'select_busi_id',name: 'select_busi_id',enableKeyEvents : true,
                  		listeners : {
                  			keydown : function(t, e){
                  				if(e.getKey() == e.ENTER){
                  					me.load_data();
                  				}
                  			}
                  		}
                  	},
                  	'渠道ID:',
                  	' ', ' ', ' ',
                  	{xtype: 'textfield', width: 90,id: 'select_channel_id',name: 'select_channel_id',enableKeyEvents : true,
                  		listeners : {
                  			keydown : function(t, e){
                  				if(e.getKey() == e.ENTER){
                  					me.load_data();
                  				}
                  			}
                  		}
                  	},
                  	'账号:',
                  	' ', ' ', ' ',
                  	{xtype: 'textfield', width: 120,id: 'select_account',name: 'select_account',enableKeyEvents : true,
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
                //为加载数据、新增、修改、删除方法添加事件监听
                listeners:  {
                    render: function(g) {
                        me.load_data();                
                        var tbar2 = me.createTbar2();
                        tbar2.render(g.tbar);
                    }
                }
            });
        },
        //加载数据
        load_data : function(){
        	this.store.load({params: {start:0, limit: this.pageSize}});
        },
          
        createTbar2 : function(){
        	var me = this;
        	return new Ext.Toolbar({
        		
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

define(function(require, exports, module) {
    var QUERY_URLS = {
        LIST: "adminBusiGame/list", //获取列表url
        GET: "adminBusiGame/get" //查询详情
    };
    
    var isEnableStore = new Ext.data.SimpleStore({
        fields:['value','text'],
        data: [  
           [0,'否'],  
           [1,'是'] 
        ]  
    });
    
    //支持的类型下拉列表的数据源
    var combostore = new Ext.data.ArrayStore({
        fields: ['value', 'text'],
        data: [
        	[1, '渠道有在售商品的游戏'],
        	[2, '渠道支持发布的游戏'], 
        	[3, '有在售商品的游戏'],
        	[4, '支持发布的游戏'],
        	[5, '百度在售商品游戏']
        ]
    });
    
    
	var utils = require('./utils.js');
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
                {name: 'game_type'},
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
                {name: 'game_home_url'},
                {name: 'file_size'},
                {name: 'down_url'},
                {name: 'product_type_group_ids'}
            ],
            listeners :{
    			beforeload : function(s){
    				var game_type = Ext.getCmp('select_game_type').getValue();
			        var game_id = Ext.getCmp('select_game_id').getValue();
			        var game_name = Ext.getCmp('select_game_name').getValue();
			         //加载条件参数查询....
			        s.baseParams.game_type = game_type;
			        s.baseParams.game_id = game_id;
			        s.baseParams.game_name = game_name;
   			}
   		}
        });
    };
    
    var myPanel = Ext.extend(Ext.grid.EditorGridPanel,{
        createColumn: function(me) {
            return [
                // new Ext.grid.RowNumberer,
                me.sm,
                {header: 'ID', dataIndex: 'id', align: 'left', sortable: true, width: 90},
                {header: '支持的类型', dataIndex: 'game_type', align: 'left', sortable: false, width: 150,
	                renderer: function(value){
		             	   var store = combostore;
		             	   for(var i = 0; i < store.data.items.length; i++) {
		             		   if(store.data.items[i].data.value == value) {
		             			   return store.data.items[i].data.text;
		             		   }
		             	   }
		             	   return '';
	     		   		}
                },
                {header: '游戏ID', dataIndex: 'game_id', align: 'left', sortable: false, width: 90},
                {header: '游戏名称', dataIndex: 'game_name', align: 'left', sortable: false,width: 200},
                {header: '首字母', dataIndex: 'game_initial', align: 'left', sortable: false,width: 60},
                {header: '游戏描述', dataIndex: 'game_info', align: 'left', sortable: false,width: 500},
                {header: '图片URL', dataIndex: 'game_pic', align: 'left', sortable: false,width: 600},
                {header: '权重', dataIndex: 'weight', align: 'left', sortable: false,width: 90},
                {header: '状态', dataIndex: 'usable', align: 'left', sortable: false, width: 60,
                	renderer: function(value){
	             	   var store = isEnableStore;
	             	   for(var i=0; i<store.data.items.length; i++) {
	             		   if(store.data.items[i].data.value == value) {
	             			   return store.data.items[i].data.text;
	             		   }
	             	   }
	             	   return '';
     		   		}
                },
                {header: '创建时间', dataIndex: 'create_time', align: 'left', sortable: false,width: 150},
                {header: '更新时间', dataIndex: 'modify_time', align: 'left', sortable: false,width: 150},
                {header: '所属平台', dataIndex: 'platform', align: 'left', sortable: false,width: 90},
                {header: '游戏官方首页URL', dataIndex: 'game_home_url', align: 'left', sortable: false,width: 350},
                {header: '文件大小', dataIndex: 'file_size', align: 'left', sortable: false,width: 90},
                {header: '游戏下载URL', dataIndex: 'down_url', align: 'left', sortable: false,width: 500},
                {header: '一级分类字符串', dataIndex: 'product_type_group_ids', align: 'left', sortable: false,width: 90}
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
            me.combostore = combostore;
            me.store = createDataStore();
            me.sm = new Ext.grid.CheckboxSelectionModel();
            me.column = me.createColumn(me);
            Ext.QuickTips.init();
            Ext.form.Field.prototype.msgTarget='side';
            myPanel.superclass.constructor.call(this, {
                id: "tab:admin:busi_game_list",
                title: "业务游戏列表",
                columns: me.column,
                layout: 'fit',
                loadMask: true,
                //底部翻页栏
                bbar: new Ext.PagingToolbar({store: this.store, pageSize: this.pageSize, displayInfo: true}),
                //头部参数栏
                tbar: new Ext.Toolbar([
                	'支持的类型:',
                  	' ', ' ', ' ',
                  	{xtype: 'combo', width: 150,id: 'select_game_type',name: 'select_game_type',store:this.combostore,
                  		displayField: 'text',valueField: 'value',triggerAction: 'all', emptyText: '请选择...', 
                  		editable: false,mode: 'local',enableKeyEvents : true,
                  		listeners : {
                  			keydown : function(t, e){
                  				if(e.getKey() == e.ENTER){
                  					me.load_data();
                  				}
                  			}
                  		}
                  	},
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
                  	'游戏名称:',
                  	' ', ' ', ' ',
                  	{xtype: 'textfield', width: 180,id: 'select_game_name',name: 'select_game_name',enableKeyEvents : true,
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

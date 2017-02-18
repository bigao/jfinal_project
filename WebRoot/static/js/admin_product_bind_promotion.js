define(function(require, exports, module) {
   
	var URLS = {
        LIST: "adminProductBindPromotion/list", //获取列表url
        ADD:"adminProductBindPromotion/add",    //添加数据 
        UPDATE:"adminProductBindPromotion/update",//更新数据
        ENABLE:'adminProductBindPromotion/enable',//删除数据
    	DISABLE:'adminProductBindPromotion/disable'//删除数据
    };
    var CHANNEL_URL = {
    	LIST:"adminChannel/getList"  //获取渠道url
    }
    var PRODUCT_TYPE_GROUP_URL = { 
    	LIST:"adminProductTypeGroup/getList"   //一级分类url      
    }
    
    var isSelectedStore = new Ext.data.SimpleStore({
        fields:['value','text'],
        data: [  
           [0,'否'],  
           [1,'是'] 
        ]  
    });
    
    var isEnbaleStore = new Ext.data.SimpleStore({
        fields:['value','text'],
        data: [  
           [0,'下线'],  
           [1,'上线'] 
        ]  
    });
        
    var utils = require('./utils.js');
	var atw = require("./ProductBindPromotionAddOrEdit.js");
    
    var createDataStore =  function() {
        return new Ext.data.JsonStore({
            autoDestroy: true,
            url: URLS.LIST,
            baseParams: {start:0, limit: 50},
            root: 'data',
            idProperty: 'id',
            totalProperty: 'total_count',
            fields:[ 
                {name: 'id'},
                {name: 'title'},
                {name: 'is_selected'},
                {name: 'price'},
                {name: 'third_act_id'},
                {name: 'third_act_val'},
                {name: 'third_act_dest'},
                {name: 'channel_ids'},
                {name: 'product_type_group_ids'},
                {name: 'is_enable'},
                {name: 'op_uid'},
                {name: 'transfer_uid'},
                {name: 'create_time'},
                {name: 'update_time'}
            ],
            listeners :{
    			beforeload : function(s){
    				
			        // 状态
			        var is_enable = Ext.getCmp('is_enable').getValue();
			        // 渠道ID
			        var channel_ids = Ext.getCmp('s_channel_id').getValue();
			        // 一级分类ID
			        var product_type_group_ids = Ext.getCmp('s_product_type_group_id').getValue();
         			s.baseParams.is_enable = is_enable;
         			s.baseParams.channel_ids = channel_ids;
         			s.baseParams.product_type_group_ids = product_type_group_ids;
   			 }
           }
        });
    };

    var myPanel = Ext.extend(Ext.grid.EditorGridPanel, {
        createColumn: function(me) {//创建列
            return [
                // new Ext.grid.RowNumberer,
                me.sm,
                {header: 'ID', dataIndex: 'id', align: 'left', sortable: true, width: 90},
                {header: '方案', dataIndex: 'title', align: 'left', sortable: false, width: 90},
                {header: '是否默认勾选', dataIndex: 'is_selected', align: 'left', sortable: false, width: 90,
                	renderer: function(value){
	             	   var store = isSelectedStore;
	             	   for(var i=0; i<store.data.items.length; i++) {
	             		   if(store.data.items[i].data.value == value) {
	             			   return store.data.items[i].data.text;
	             		   }
	             	   }
	             	   return '';
     		   		}
                },
                {header: '售价', dataIndex: 'price', align: 'left', sortable: false, width: 90},
                {header: '第三方活动ID', dataIndex: 'third_act_id', align: 'left', sortable: false, width: 90},
                {header: '第三方活动标识', dataIndex: 'third_act_val', align: 'left', sortable: false, width: 110},
                {header: '第三方活动发货地址', dataIndex: 'third_act_dest', align: 'left', sortable: false, width: 90, hidden:true},
                {header: '生效渠道集合', dataIndex: 'channel_ids', align: 'center', sortable: false, width: 300,
                	renderer : function(value){
                		if(value){
                			var channelIdStr = "";
                			var strs= new Array(); //定义一数组 
                			strs = value.split(","); //字符分割 
                			for (i = 0; i < strs.length ;i++ ){ 
                				var value = strs[i];
                				if(me.channelStore.getById(value) == undefined){
                					channelIdStr = channelIdStr + value;
                            	}else{
                            		var channelName = me.channelStore.getById(value).get("channel_name");
                            		channelIdStr = channelIdStr + channelName;
                            	}
                				if(i != strs.length -1){
                					channelIdStr = channelIdStr+" ; ";
                				}
                			}
                			return channelIdStr;
                			
                		}
                		return value;
                    }	
                },
                {header: '生效一级分类集合', dataIndex: 'product_type_group_ids', align: 'center', sortable: false, width: 300,
                	renderer : function(value){
                		if(value){
                			var typeGroupIdStr = "";
                			var strs= new Array(); //定义一数组 
                			strs = value.split(","); //字符分割 
                			for (i = 0; i < strs.length ;i++ ){ 
                				var value = strs[i];
                				if(me.groupStore.getById(value) == undefined){
                					typeGroupIdStr = typeGroupIdStr + value;
                            	}else{
                            		var channelName = me.groupStore.getById(value).get("name");
                            		typeGroupIdStr = typeGroupIdStr + channelName;
                            	}
                				if(i != strs.length -1){
                					typeGroupIdStr = typeGroupIdStr+" ;  ";
                				}
                			}
                			
                			return typeGroupIdStr;
                			
                		}
                		
                		return value;
                    }
                },
                {header: '状态', dataIndex: 'is_enable', align: 'center', sortable: false, width: 120,
                	renderer: function(value){
                		if(value==1){
                			return "<font color = 'red'>上线</font>";
                		}else{
                			return '下线';
                		}
                	}	
                
                },
                {header: '操作用户uid', dataIndex: 'op_uid', align: 'left', sortable: false, width: 90},
                {header: '支付流水账入uid', dataIndex: 'transfer_uid', align: 'left', sortable: false, width: 120},
                {header: '创建时间', dataIndex: 'create_time', align: 'left', sortable: false,width: 150},
                {header: '更新时间', dataIndex: 'update_time', align: 'left', sortable: false,width: 150}
            ];
        },

        constructor: function() {
            var me = this;
            me.pageSize = 50; 
            me.store = createDataStore();
            me.groupStore = createGroupStore(); 
            me.channelStore = createChannelStore();
            me.sm = new Ext.grid.CheckboxSelectionModel();
            me.column = me.createColumn(me);
            myPanel.superclass.constructor.call(this, {
                id: "tab:admin:product_log_list",
                title: "捆绑商品列表(<font color = 'red'>双击记录可查看信息</font>)",
                columns: me.column,
                layout: 'fit',
                loadMask: true,
                bbar: new Ext.PagingToolbar({store: this.store, pageSize: this.pageSize, displayInfo: true}),
                tbar: new Ext.Toolbar({ 
                	autoScroll : true,
                	items : [
                	         {
           	                    xtype: 'buttongroup',
//           	                    columns: 21,
           	                    columns: 25,
           	                    defaults: {
           	                        scale: 'small'
           	                    },
           	                    items: [
           	                            {},{},
           	                            {xtype: 'label', text: '渠道： '},
           	                            {width: 120, mode: 'local', triggerAction: 'all', forceSelection: true,editable: true,fieldLabel: '一级分类选择',
   		           		                 emptyText:	'请选择渠道',name: 'channel_name', id :"s_channel_id",
   		           		                 xtype: 'combo', displayField: 'channel_name',valueField:'channel_id',
   		           		                 store : me.channelStore
   		           			             },{},{},
   		           			            
		            					{xtype: 'label', text: ' 一级分类 ： '},
		           	 		            {width: 120, mode: 'local', triggerAction: 'all', forceSelection: true,editable: true,fieldLabel: '一级分类选择',
		           		                 emptyText:	'请选择一级分类',name: 'name', id :"s_product_type_group_id",
		           		                 xtype: 'combo', displayField: 'name',valueField:'product_type_group_id',
		           		                 store : me.groupStore
		           			            },{},{},	
		           			            
                                     	{xtype: 'label', text: '状态： '},
               			                {width: 120, mode:'local', triggerAction: 'all', forceSelection: true,
	               		                     editable: true, fieldLabel:'选择状态', emptyText:'选择状态',
	               		                     name: 'is_enable', id :"is_enable", xtype: 'combo',
	               		                     hiddenName: 'title', displayField: 'name', valueField: 'value',
	               		                     store:  new Ext.data.JsonStore({
	               		                     fields : ['name', 'value'],
	               		                     data   : [
	               		                               {name : '上线',  value: '1'},
	               		                               {name : '下线',   value: '0'}
	               		                         ]
	               		                     })
               			                },{},
               			                
         								{xtype: 'button', text: "<font color ='red'>查 询</font>",  width: 60, icon: 'static/libs/icons/zoom.png', 
         									    handler: function() {
         									    	 me.store.load();  
         									    }
         								},{},
         								{xtype: "button", text: "<font color = 'black'>添加</font>", icon: "static/libs/icons/add.png", handler: function(){
	          								 var win = new atw.ProductBindPromotionAddOrEdit("ProductBindPromotionAddOrEdit",'',"add");
	          	                             win.on("close", function(p){
	          	                                me.store.reload();
	          	                             });
	          	                             win.show();
          							  	}
          							   },{},
	          						   {xtype: "button", text: "<font color = 'black'>修改</font>", icon: "static/libs/icons/application_edit.png", handler: function(){
		          							 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
		          								if(sels && sels.length != 1){
		          									utils.show_msg('请选择一条记录修改!');
		          									return false;
		          								}
		          							var data = sels[0].data;
		          							
		          							var is_enable = data.is_enable;
		          							if(is_enable == 1) {
		          								utils.show_msg("请先置为下线再修改");
		          								return;
		          							}
		          							
		          							var channelIds = new Array(); //定义游戏数组 
		          							var typeGroups = new Array(); //定义一级分类数组 
		          							if(data.channel_ids){
		          								channelIds = data.channel_ids.split(","); //字符分割 
		          							}
		          							if(data.product_type_group_ids){
		          								typeGroups = data.product_type_group_ids.split(","); //字符分割 
		          							}
		          							data.channelIds = channelIds;
		          							data.typeGroups = typeGroups;
		          							 
	          								 var win = new atw.ProductBindPromotionAddOrEdit("ProductBindPromotionAddOrEdit",data,"edit");
	          	                             win.on("close", function(p){
	          	                                me.store.reload();
	          	                             });
	          	                             win.show();
	      							  	 }
	      							   },{},
	      							   {xtype: 'button', text: '启用',  width: 45, icon : "static/libs/icons/application_edit.png", handler: function(){
	      								 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
		          							if(sels && sels.length != 1){
		          								utils.show_msg('请选择一条记录修改!');
		          								return false;
		          							}
		          							var data = sels[0].data;
		          							if(null == data || undefined == data) {
		          								utils.show_msg("获取当前记录为空");
		          				            	return false;
		          							}
		          							var id = data['id'];
		          							var product_type_group_ids = data['product_type_group_ids'];
		          							var channel_ids = data['channel_ids'];
		          							
		          							Ext.MessageBox.confirm('启用','确定要启用吗？"', function(btn) { 
		          	           				    if(btn == 'yes'){
		          	           				    	utils.http_request(utils.build_url(URLS.ENABLE), {'id': id,'product_type_group_ids':product_type_group_ids,'channel_ids':channel_ids}, function(json){
		          	           				    		if(json.success) {
		          	           				    			utils.show_msg("启用成功");
		          	           				    			me.store.reload();
		          	           				    		} else {
		          	           				    			utils.show_msg(json.msg);
		          	           				    		}
		          	           				    	}, function(json){
		          	           				    		utils.show_msg(json.msg);
		          	           				    	});
		          	           				    }
		          							});
	      							   }},
	      							   {},
                    				   {xtype: 'button', text: '禁用',  width: 45, icon : "static/libs/icons/application_edit.png", handler: function(){
		      								var sels = me.getSelectionModel().getSelections();// 获取选择的记录
		          							if(sels && sels.length != 1){
		          								utils.show_msg('请选择一条记录修改!');
		          								return false;
		          							}
		          							var data = sels[0].data;
		          							if(null == data || undefined == data) {
		          								utils.show_msg("获取当前记录为空");
		          				            	return false;
		          							}
		          							var id = data['id'];
		          							Ext.MessageBox.confirm('禁用','确定要禁用吗？"', function(btn) { 
		          	           				    if(btn == 'yes'){
		          	           				    	utils.http_request(utils.build_url(URLS.DISABLE), {'id': id}, function(json){
		          	           				    		if(json.success) {
		          	           				    			utils.show_msg("禁用成功");
		          	           				    			me.store.reload();
		          	           				    		} else {
		          	           				    			utils.show_msg(json.msg);
		          	           				    		}
		          	           				    	}, function(json){
		          	           				    		utils.show_msg(json.msg);
		          	           				    	});
		          	           				    }
		          							});
	      							   }},
         								
                	              ]
                	         }
                	      ]
                	}),
                	  listeners:  {
                      	
                      	afterrender : function(p){
                             	//按照顺序加载相应的store;  channelStor-->productTypeGroupId->store, 保证商品类型列表渲染的时候相应的store已经加载完毕
                                 me.load_store();
                             },
                         	rowdblclick: function(grid, rowIndex, e){
                     		    var record = grid.store.getAt(rowIndex);
                     		    var data = record.data;
                     		    var id = data.id;
                     		    var channelIds = new Array(); //定义游戏数组 
      							var typeGroups = new Array(); //定义一级分类数组 
      							if(data.channel_ids){
      								channelIds = data.channel_ids.split(","); //字符分割 
      							}
      							if(data.product_type_group_ids){
      								typeGroups = data.product_type_group_ids.split(","); //字符分割 
      							}
      							data.channelIds = channelIds;
      							data.typeGroups = typeGroups;
      							 
  								var win = new atw.ProductBindPromotionAddOrEdit("ProductBindPromotionAddOrEdit",data,"look");
  	                            win.on("close", function(p){
  	                               me.store.reload();
  	                            });
  	                            win.show();
                     	}
                    }
            });
        },
        
        
        load_store : function(){
        	var me = this;
        	 //商品一级分类store
        	this.groupStore.on("load", function(s){
        		
        		me.channelStore.on("load", function(s){
        			//加载列表
        			me.load_data();
        		});
        		
        		me.channelStore.load();
        	});
        	
        	this.groupStore.load();
        	
        },
        
        
        load_data : function(){
        	this.store.load({params: {start:0, limit: this.pageSize}});
        }
        
        
        
    });
    
    //渠道store
    var createChannelStore =  function() {
    	return new Ext.data.JsonStore({
	    	url: CHANNEL_URL.LIST,
	    	root: 'data',
	    	idProperty: 'channel_id',
	    	totalProperty: 'total_count',
	    	fields:[ 
	          {name: 'channel_id'},
	          {name: 'channel_name'}
	        ]
	    });
    };
    
    
    //商品一级分类store
    var createGroupStore = function(){
    	return new Ext.data.JsonStore({
    		autoDestory : true,
    		//autoLoad : true,
    		url : PRODUCT_TYPE_GROUP_URL.LIST,
    		root : 'data',
    		idProperty : 'product_type_group_id',
    		totalProperty : 'total_count',
    		fields: [ {name : 'product_type_group_id'},{name : 'name'}]
    	});
    	
    };
    
    
    
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

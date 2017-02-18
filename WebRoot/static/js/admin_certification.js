define(function(require, exports, module) {
    var URLS = {
        LIST: "adminCertification/getList", //获取列表url
        ADD:'adminCertification/add',    //添加数据 
        DELETE:'adminCertification/delete',//删除数据
        UPDATE:'adminCertification/update'//更新数据
    };
    var CHANNEL_URL = {
    	LIST:"adminChannel/getList"  //获取渠道url
    }
    
    var PTG_URL = {
    	LIST:"adminProductTypeGroup/getList"  //获取一级商品分类url
    }
    
    var stateStore = new Ext.data.SimpleStore({
        fields:['value','text'],
        data: [  
           [0,'不启用'],  
           [1,'启用'] 
        ]  
    });
    
	var utils = require('./utils.js');
//	var clip = require('../../libs/ZeroClipboard.js');
    var createDataStore =  function() {
        return new Ext.data.JsonStore({
            autoDestroy: true,
            url: URLS.LIST,
            id: 'allStore',
            baseParams: {start:0, limit: 50},
            root: 'data',
            idProperty: 'id',
            totalProperty: 'total_count',
            fields:[ 
                {name: 'id'},
                {name: 'product_type_group_id'},
                {name: 'product_type_group_name'},
                {name: 'channel_id'},
                {name: 'channel_name'},
                {name: 'status'},
                {name: 'create_time'},
                {name: 'update_time'},
                {name: 'remark'}
            ],
            listeners :{
    			beforeload : function(s){
    				//请求参数
			        var ptg_name = Ext.getCmp('ptg_name').getRawValue();
			        var channel_name = Ext.getCmp('channel_name').getRawValue();
			        var status = Ext.getCmp('status').getValue();
			          //加载条件参数查询....
			        s.baseParams.ptg_name = ptg_name;
			        s.baseParams.channel_name = channel_name;
			        s.baseParams.status = status;
   			}
   		}
        });
    };
    
    var myPanel = Ext.extend(Ext.grid.EditorGridPanel,{
        createColumn: function(me) {
            return [
                me.sm,
                {header: 'ID', dataIndex: 'id', align: 'left', sortable: true, width: 90},
                {header: '商品一级分类ID', dataIndex: 'product_type_group_id', align: 'left', sortable: true, width: 90},
                {header: '商品一级分类名称', dataIndex: 'product_type_group_name', align: 'left', sortable: false, width: 90},
                {header: '渠道编号', dataIndex: 'channel_id', align: 'left', sortable: false, width: 90},
                {header: '渠道名称', dataIndex: 'channel_name', align: 'left', sortable: false, width: 150},
                {header: '状态', dataIndex: 'status', align: 'left', sortable: false, width: 90,
                	renderer: function(value){
	             	   var store = stateStore;
	             	   for(var i=0; i<store.data.items.length; i++) {
	             		   if(store.data.items[i].data.value == value) {
	             			   return store.data.items[i].data.text;
	             		   }
	             	   }
	             	   return '';
     		   		}
                },
                {header: '创建时间', dataIndex: 'create_time', align: 'left', sortable: false,width: 150},
                {header: '更新时间', dataIndex: 'update_time', align: 'left', sortable: false,width: 150},
                {header: '备注', dataIndex: 'remark', align: 'left', sortable: false, width: 150}
           ];
        },
      
        viewConfig : {
        	//列数过多时，可设为false关闭自动调整列宽，显示横向滚动条，以显示完整的数据
        	forceFit: true
        },
        
        constructor: function() {
            var me = this;
            me.pageSize = 50; 
            me.stateStore = stateStore;
            me.channelNameStore = createChannelNameStore;
            me.ptgStore = createPTGStore;
            me.store = createDataStore();
            me.sm = new Ext.grid.CheckboxSelectionModel();
            me.column = me.createColumn(me);
            Ext.QuickTips.init();
            Ext.form.Field.prototype.msgTarget='side';
            myPanel.superclass.constructor.call(this, {
                id: "tab:admin:certification_list",
                title: "实名认证配置列表",
                columns: me.column,
                layout: 'fit',
                loadMask: true,
                //底部翻页栏
                bbar: new Ext.PagingToolbar({store: this.store, pageSize: this.pageSize, displayInfo: true}),
                //头部参数栏
                tbar: new Ext.Toolbar([
                   '商品一级分类:',
                  	' ', ' ', ' ',
              		{xtype: 'combo', width: 150,id: 'ptg_name',name: 'name',
              			displayField: 'name',valueField: 'product_type_group_id',
	              		editable: true,forceSelection: true,triggerAction: 'all',allowBlank:true, 
	              		emptyText: '请选择...',store:me.ptgStore,
	              		mode:'local', enableKeyEvents : true, 
	              		listeners:{ //模糊匹配
	                    	 render: function(combo){
	                            combo.store.load();
	                        }
		                  }
                  	},
                	'渠道:',
                  	' ', ' ', ' ',
                  	{xtype: 'combo', width: 150,id: 'channel_name',name: 'channel_name',editable: true,
                  		displayField: 'channel_name',valueField: 'channel_id',forceSelection: true,
                  		triggerAction: 'all',allowBlank:true, emptyText: '请选择...',store:me.channelNameStore,
                  		mode:'local', enableKeyEvents : true, 
                  		listeners:{ //模糊匹配
	                    	 render: function(combo){
                                combo.store.load();
                            }
		                  }
                  	},
                  	'状态:',
                  	' ', ' ', ' ',
                  	{xtype: 'combo', width: 150,id: 'status',name: 'status',store:me.stateStore,
                  		displayField: 'text',valueField: 'value',typeAhead: true,forceSelection: true,
                  		triggerAction: 'all', allowBlank:true,selectOnFocus:true,emptyText: '请选择...', 
                  		mode: 'local',enableKeyEvents : true,
                  		listeners : {
                  			keydown : function(t, e){
                  				if(e.getKey() == e.ENTER){
                  					me.load_data();
                  				}
                  			}
                  		}
                  	},
                  	' ', ' ', ' ',
   					{xtype: 'button', text: '查询',  width: 60, icon: 'static/libs/icons/zoom.png', 
   					    handler: function() {
   					    	me.load_data();
   					    }
   					}, 
   					 ' ', '-', ' ',   
	                {xtype: 'button', text: '清空条件',  width: 60, icon: 'static/libs/icons/reset.png', 
	                	 handler: function (){
	                		     Ext.getCmp('product_type_group_name').setValue(null);
	                		     Ext.getCmp('channel_name').setValue(null);
	                		     Ext.getCmp('status').setValue(null);
								 me.store.load({params: {start:0, limit: me.pageSize}});
	                	 }
	                },
   					' ', '-', ' ',                   
                    {xtype: 'button', text: '增加',  width: 60, icon: 'static/libs/icons/add.png', 
                         handler:  function(){
                        	 var addWin = null;
              		         if(!addWin){
              		        	addWin = new Ext.Window({//加载窗体
              		                 layout:'fit',
              		                 width:500,
              		                 height:250,
              		                 plain: true,
              		                 items: new Ext.FormPanel({//加载form表单
              		                 labelWidth: 110, // label settings
                      		               frame:true,
                      		               title: '新增实名认证配置信息',
                      		               bodyStyle:'padding:5px 5px 0',
                      		               width: 350,
                      		               defaults: {width: 230},
                      		               defaultType: 'textfield',
                      		               items: [
	                      		                   {xtype: 'combo', fieldLabel: '商品一级分类',width: 150,id: 'a_ptg_name',name: 'name',
								              			displayField: 'name',valueField: 'product_type_group_id',
									              		editable: true,forceSelection: true,triggerAction: 'all',allowBlank:true, 
									              		emptyText: '请选择...',store:me.ptgStore,
									              		mode:'local', enableKeyEvents : true, 
									              		listeners:{ //模糊匹配
									                    	 render: function(combo){
									                            combo.store.load();
									                        }
										                  }
								                  	},
								                   {xtype: 'combo', fieldLabel:'渠道',width: 150,id: 'a_channel_id',name: 'channel_name',editable: true,
								                  		displayField: 'channel_name',valueField: 'channel_id',forceSelection: true,
								                  		triggerAction: 'all',allowBlank:true, emptyText: '请选择...',store:me.channelNameStore,
								                  		mode:'local', enableKeyEvents : true, 
								                  		listeners:{ //模糊匹配
									                    	 render: function(combo){
								                                combo.store.load();
								                            }
										                  }
								                  	},
	                        		                {xtype: 'combo', fieldLabel:'状态', width: 150,id: 'a_status',name: 'a_status',store:me.stateStore,
								                  		displayField: 'text',valueField: 'value',triggerAction: 'all', allowBlank:true,
								                  		emptyText: '请选择...',editable: false,mode: 'local',enableKeyEvents : true,
								                  		editable: false,mode: 'local',enableKeyEvents : true,
								                  		listeners : {
								                  			keydown : function(t, e){
								                  				if(e.getKey() == e.ENTER){
								                  					me.load_data();
								                  				}
								                  			}
								                  		}
								                  	},
	                      		                   {fieldLabel: '备注', name: 'a_remark', id : "a_remark", value : ""}
                      		                  ]
              		                 }),
              		         		buttons: [
              		                   {text:'保存',
		                                 handler : function(){
		                                  if(Ext.getCmp("a_ptg_name").isValid()
		                                	&& Ext.getCmp("a_channel_id").isValid()
		                                	&& Ext.getCmp("a_status").isValid()
		                                	&& Ext.getCmp("a_remark").isValid()){
		                                		
		                                	 var productTypeGroupName = Ext.getCmp("a_ptg_name").getRawValue();
		                                	 var channelId = Ext.getCmp("a_channel_id").getValue();
		                                	 var channelName =  Ext.getCmp("a_channel_id").getRawValue();
		                                	 if(channelId == ""){
		                                		 utils.show_msg("请选择渠道");
		                                		 return false;
		                                	 }
		                                	 var status = Ext.getCmp("a_status").getValue();
		                                	 if(typeof(status) == 'string'){
		                                		 utils.show_msg("请选择状态");
		                                		 return false;
		                                	 }
		                                	 var remark = Ext.getCmp("a_remark").getValue();
		                                	 Ext.Ajax.request({
		                                		   url: URLS.ADD,
                            			   		   params: {"product_type_group_name":productTypeGroupName,"channel_id":channelId,"channel_name":channelName,
		                                			   		"status":status,"remark":remark},
		                                		   success: function(resp,otps){
		                                			   var obj = Ext.decode(resp.responseText);
		                                			   var success = obj.success;
		                                			   if(success){
		                                				   utils.show_msg(obj.msg);
		                                				   me.store.load({params: {start:0, limit: me.pageSize}});
		                                				   addWin.close();
		                                			   }else{
		                                				   utils.show_msg(obj.msg);
		                                			   }
		                                		   },
		                                		   failure : function(resp ,otps){
		                                			   utils.show_msg("新增失败!");
		                                		   }
		                                		});
		                                 }else{
		                                	 utils.show_msg("信息校验不通过!请重新填写!");
		                                 }
		                                }
                                 },
	                             {text: '取消', handler: function(){ addWin.close();}
	                            }]
              		           });
              		        }
              		       addWin.show(this);
                         }
                    },
                     ' ', '-', ' ',   
                    {xtype: 'button', text: '批量删除',  width: 60, icon: 'static/libs/icons/delete.png', 
                    	 handler: function (){
                    		 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
                    		 if(undefined == sels || sels.length < 1) {
                    			 utils.show_msg("请选择一条记录删除"); 
                    			 return;
                    		 }
                    		 var idStr = [];
                    		 for(var i=0; i<sels.length; i++) {
                    			 idStr.push(sels[i].data.id);
                    		 }
                    		 var ids = idStr.join(",");
                			 Ext.MessageBox.confirm('删除选择框', '确定要批量删除？', function(btn) {  
                				    if(btn == 'yes'){
               				    		var data = {'ids':ids};
            				    		var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "删除中，这可能需要一点时间..." });
            	        				myMask.show();
            	            			utils.http_request(URLS.DELETE, data, function(json){
            	            				//完成请求后重新去除蒙板
            								myMask.hide();
            								me.store.load({params: {start:0, limit: me.pageSize}});
            	            			});
                				    }
                				}); 
                    	 }
                    },
                        ' ', '-', ' ',   
                     {xtype: 'button', text: '修改',  width: 45, icon : "static/libs/icons/application_edit.png", id: 'certificationUpdateBtn',
                         handler:  function(){
                        	 var addWin = null;
                        	 //获取EditorGridPanel选中的行
                        	 var sels = me.getSelectionModel().getSelections();
                        	 if(undefined == sels || sels.length < 1) {
                    			 utils.show_msg("请选择一条记录修改"); 
                    			 return;
                    		 }
                    		 if(sels.length > 1){
                    		  	 utils.show_msg("每次只能修改一条记录"); 
                    			 return;
                    		 }
                        	 
                    		 var selected_id = sels[0].data.id;
                        	 var select_ptg_name = sels[0].data.product_type_group_name;
                        	 var selected_channel_name = sels[0].data.channel_name;
                        	 var selected_status = sels[0].data.status;
                        	 var selected_remark = sels[0].data.remark;
                        	
              		         if(!addWin){
              		        	addWin = new Ext.Window({//加载窗体
              		                 layout:'fit',
              		                 width:500,
              		                 height:250,
              		                 plain: true,
              		                 items: new Ext.FormPanel({//加载form表单
              		                 labelWidth: 110, // label settings
                      		               frame:true,
                      		               title: '修改实名认证配置信息',
                      		               bodyStyle:'padding:5px 5px 0',
                      		               width: 350,
                      		               defaults: {width: 230},
                      		               defaultType: 'textfield',
                      		               items: [
	                        		              {xtype: 'combo', fieldLabel: '商品一级分类',width: 150,id: 'u_ptg_name',name: 'name',
								              			displayField: 'name',valueField: 'product_type_group_id',value : select_ptg_name,
									              		editable: true,forceSelection: true,triggerAction: 'all',allowBlank:true, 
									              		emptyText: '请选择...',store:me.ptgStore,
									              		mode:'local', enableKeyEvents : true, 
									              		listeners:{ //模糊匹配
									                    	 render: function(combo){
									                            combo.store.load();
									                        }
										                  }
								                  	},
								                  	{xtype: 'combo', fieldLabel:'渠道',width: 150,id: 'u_channel_id',name: 'channel_name',editable: true,
								                  		displayField: 'channel_name',valueField: 'channel_id',value:selected_channel_name,
								                  		forceSelection: true,triggerAction: 'all',allowBlank:true, emptyText: '请选择...',
								                  		store:me.channelNameStore,mode:'local', enableKeyEvents : true, 
								                  		listeners:{ //模糊匹配
									                    	 render: function(combo){
								                                combo.store.load();
								                            }
										                  }
								                  	},
	                        		               {xtype: 'combo', fieldLabel:'状态', width: 150,id: 'u_status',name: 'u_status',store:me.stateStore,
								                  		displayField: 'text',valueField: 'value', value: selected_status, triggerAction: 'all', emptyText: '请选择...', 
								                  		editable: false,mode: 'local',enableKeyEvents : true,
								                  		listeners : {
								                  			keydown : function(t, e){
								                  				if(e.getKey() == e.ENTER){
								                  					me.load_data();
								                  				}
								                  			}
								                  		}
								                  	},
                      		               
	                      		                   {fieldLabel: '备注', id : "u_remark", name: 'u_remark',  value : selected_remark}
                      		               ]
              		                 }),
              		         		buttons: [
              		                   {text:'保存',
		                                 handler : function(){
		                                 if( selected_id != ""  
		                                	&& Ext.getCmp("u_ptg_name").isValid()		       
		                                	&& Ext.getCmp("u_channel_id").isValid()
		                                	&& Ext.getCmp("u_remark").isValid()
		                                	&& Ext.getCmp("u_status").isValid()){
		                                	 var productTypeGroupName = Ext.getCmp("u_ptg_name").getRawValue();
		                                	 var channelName = Ext.getCmp("u_channel_id").getRawValue()
		                                	 var status = Ext.getCmp('u_status').getValue();
		                                	 var remark = Ext.getCmp("u_remark").getValue();
		                                	 Ext.Ajax.request({
		                                		   url: URLS.UPDATE,
		                                		   params: {"id":selected_id,"product_type_group_name":productTypeGroupName,
		                                		   			"channel_name":channelName,"status":status,"remark":remark
		                                		   			},
		                                		   success: function(resp,otps){
		                                			   var obj = Ext.decode(resp.responseText);
		                                			   var success = obj.success;
		                                			   if(success){
		                                				   utils.show_msg(obj.msg);
		                                				   me.store.load({params: {start:0, limit: me.pageSize}});
		                                				   addWin.close();
		                                			   }else{
		                                				   utils.show_msg(obj.msg);
		                                			   }
		                                		   },
		                                		   failure : function(resp ,otps){
		                                			   utils.show_msg("修改失败!");
		                                		   }
		                                		});
		                                 }else{
		                                	 utils.show_msg("信息校验不通过!请重新填写!");
		                                 }
		                                }
                                 },
	                             {text: '取消', handler: function(){ addWin.close();}
	                            }]
              		           });
              		        }
              		       addWin.show(this);
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
    
     //渠道名称下拉框数据源
    var createChannelNameStore = new Ext.data.JsonStore({
        url:CHANNEL_URL.LIST,
        fields: ['channel_id','channel_name'],
        root:'data'
    });
    
    //一级商品分类下拉框数据源
    var createPTGStore = new Ext.data.JsonStore({
        url:PTG_URL.LIST,
        fields: ['product_type_group_id','name'],
        root:'data'
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

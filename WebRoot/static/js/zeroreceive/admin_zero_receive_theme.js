define(function(require, exports, module) {
    var QUERY_URLS = {
        LIST: "adminZeroReceiveTheme/list", //获取列表url
        GET: "adminZeroReceiveTheme/get"//查询详情
    };
    var DELETE_URLS = {
    	GET: "adminZeroReceiveTheme/delete"//删除对象url
    };
    var SAVE_URLS = {
         UPDATE: "adminZeroReceiveTheme/update",//更新
         ADD: "adminZeroReceiveTheme/add",//新增
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
                {name: 'theme_name'},
                {name: 'is_enable'},
                {name: 'url'},
                {name: 'remark'},
                {name: 'create_time'},
                {name: 'update_time'}
            ],
            listeners :{
    			beforeload : function(s){
    				 var is_enable = Ext.getCmp('select_is_enable').getValue();
    				 if(is_enable === "") {
    					 is_enable = -1;
    				 }
				     var theme_name = Ext.getCmp('select_theme_name').getValue();
			        //加载条件参数查询....
			        s.baseParams.is_enable = is_enable;
			        s.baseParams.theme_name = theme_name;
   			}
   		}
        });
    };
    
    var myPanel = Ext.extend(Ext.grid.EditorGridPanel, {
        createColumn: function(me) {
            return [
                // new Ext.grid.RowNumberer,
                me.sm,
                {header: 'ID', dataIndex: 'id', align: 'left', sortable: true, width: 30},
                {header: '主题', dataIndex: 'theme_name', align: 'left', sortable: false, width: 80},
                {header: '状态', dataIndex: 'is_enable', align: 'left', sortable: false, width: 30, 
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
                {header: 'URL', dataIndex: 'url', align: 'left', sortable: false, width: 150},
                /*{header: '复制', align: 'left', sortable: false, width: 40, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                	var rec_id = record.get("id");
                	var btn_id = 'copy_clipboard_btn_' +rec_id;
                	var urlId = utils.createGridBtn({
                        text : "复制",
                        icon : "static/libs/icons/application_form_magnify.png",
                        width : 80,
                        id: btn_id,
                        handler : function(){
							ZeroClipboard.setMoviePath("static/libs/ZeroClipboard.swf");  
				            var clip = new ZeroClipboard.Client();  
				            clip.setHandCursor(true);  
				            clip.glue(btn_id);
				            clip.addEventListener('mouseDown', function() {  
				            	clip.setText(rec_id);  
				            });  
				            clip.addEventListener("complete", function() {  
				                alert("复制成功");  
				            });  
                        }
                    });
                	return '<div style="width:100px;float:left;"><span id="' + urlId + '" />';
                }},*/
                {header: '备注', dataIndex: 'remark', align: 'left', sortable: false,width: 100},
                {header: '创建时间', dataIndex: 'create_time', align: 'left', sortable: false,width: 70},
                {header: '更新时间', dataIndex: 'update_time', align: 'left', sortable: false,width: 70},
                {header: '操作', align: 'left', sortable: false, width: 100, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                	var OpLogId = utils.createGridBtn({
                        text : "编辑管理",
                        icon : "static/libs/icons/application_form_magnify.png",
                        width : 80,
                        handler : function(){
                        	var theme_id = record.get("id");
                        	var theme_name = record.get("theme_name");
                        	var link = prefix_path+"adminZeroReceiveSubject?req_theme_id="+theme_id+"&req_theme_name="+theme_name;
                    		var node = {
                    			"attributes":{ "url":link}, 
                    			"checked":false,
                    			"iconCls":"",
                    			"state":"closed",
                    			"text":"编辑聚合页["+theme_name+"]" 
                    		};
//                    		window.open(link, "_blank");
//                    		parent.addTab(node);
                    		parent.postMessage(node, '*');
                        }
                    });
                	return '<div style="width:100px;float:left;"><span id="' + OpLogId + '" />';
                }},
           ];
        },
      
        viewConfig : {
        	forceFit: true,
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
                id: "tab:admin:theme_list",
                title: "游戏聚合页列表",
                columns: me.column,
                layout: 'fit',
                loadMask: true,
                bbar: new Ext.PagingToolbar({store: this.store, pageSize: this.pageSize, displayInfo: true}),
                tbar: new Ext.Toolbar([
                  	'主题名称:',
                  	' ', ' ', ' ',
                  	{xtype: 'textfield', width: 150,id: 'select_theme_name',name: 'select_theme_name',enableKeyEvents : true,
                  		listeners : {
                  			keydown : function(t, e){
                  				if(e.getKey() == e.ENTER){
                  					me.load_data();
                  				}
                  			}
                  		}
                  	},
                  	
                  	
                  	'是否启用:',
                  	' ', ' ', ' ',
                  	{xtype: 'combo', width: 80, id: 'select_is_enable',name: 'select_is_enable', triggerAction:'all',forceSelection: true,
                	  mode: 'local', displayField:'text', valueField:'value', store: me.isEnableStore,enableKeyEvents : true,
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
                    	Ext.getCmp('zeroReceiveThemeEditBtn').handler();
                    }
                }
            });
        },
        load_data : function(){
        	this.store.load({params: {start:0, limit: this.pageSize}});
        },
        createTbar2 : function(){
        	var me = this;
        	return new Ext.Toolbar({
        		items : [
					{xtype : "button", text : "新增", icon : "static/libs/icons/add.png", handler : function(){
						 var win = Ext.getCmp('zeroReceiveThemeAddWin');
						 var isEnableStore = me.isEnableStore;
          		         if(undefined == win || null == win){
          		        	win = new Ext.Window({//加载窗体
          		                 layout:'fit',
          		                 width:500,
          		                 height:300,
          		                 plain: true,
          		                 id: 'zeroReceiveThemeAddWin',
          		                 items: new Ext.FormPanel({//加载form表单
          		                 labelWidth: 110, // label settings
                  		               frame:true,
                  		               title: '新增游戏聚合页信息',
                  		               bodyStyle:'padding:5px 5px 0',
                  		               width: 350,
                  		               defaults: {width: 230},
                  		               defaultType: 'textfield',
                  		               items: [
							  	            {xtype:"textfield", id:"add_theme_name",name:"add_theme_name",fieldLabel : "主题<font color='red'>*</font>", allowBlank:false,anchor : "98%"},
							  	            {xtype: 'combo',  name: 'add_is_enable', id : "add_is_enable", triggerAction:'all',forceSelection: true,
		                                           editable: false, fieldLabel:"是否启用<font color='red'>*</font>", anchor : "98%",
		                                           mode: 'local', displayField:'text', valueField:'value', store: isEnableStore,  value: "0"},
											{xtype:"textfield", id:"add_remark",name:"add_remark",fieldLabel : "备注", allowBlank:true, anchor : "98%"},
                  		               ]
          		                 }),
		          		         buttons: [
	          		                   {text:'保存',
		                                 handler : function(){
		                                 if(Ext.getCmp("add_theme_name").isValid() && Ext.getCmp("add_is_enable").isValid()){
		                                	 
		                                	 var theme_name = Ext.getCmp("add_theme_name").getValue();
		                                	 var is_enable = Ext.getCmp("add_is_enable").getValue();
		                                	 var remark = Ext.getCmp("add_remark").getValue();
		                                	 Ext.Ajax.request({
		                                		   url: SAVE_URLS.ADD,
		                                		   params: {"theme_name":theme_name,"is_enable":is_enable,"remark":remark},
		                                		   success: function(resp,otps){
		                                			   var obj = Ext.decode(resp.responseText);
		                                			   var success = obj.success;
		                                			   if(success){
		                                				   me.store.reload();
		                                				   win.close();
		                                			   }else{
		                                				   utils.show_msg(obj.msg);
		                                			   }
		                                		   },
		                                		   failure : function(resp ,otps){
		                                			   utils.show_msg("新增失败，后台异常!");
		                                		   }
		                                		});
		                                 }else{
		                                	 utils.show_msg("信息校验不通过!请重新填写!");
		                                 }
		                                }
          		                   },
	                             	{text: '取消', handler: function(){ win.close();}
	                            }]
          		           });
          		        }
          		        win.show(this);
					}},
					' ', ' ', ' ',
    		        {xtype : "button", text : "修改", id: 'zeroReceiveThemeEditBtn', icon : "static/libs/icons/application_edit.png", 
    		        	handler : function(){
							var sels = me.getSelectionModel().getSelections();// 获取选择的记录
							if(null == sels || undefined == sels || sels.length != 1){
								utils.show_msg("请选择一条记录修改");
								return;
							}
	                  		var id = sels[0].data['id'];
	                  		Ext.Ajax.request({
                   	            url: QUERY_URLS.GET,
                   	            params: {"id":id},
                   	            method : "POST",
                   	            success: function(resp, opts){
                   	            	var obj = Ext.decode(resp.responseText);
                      	             var success = obj.success;
                      	             if(!success){
                      	            	 utils.show_msg(obj.msg);
                      	            	 return;
                      	             }
                      	             var updateObject = obj.data;
                      	             var win = Ext.getCmp('zeroReceiveThemeEditWin');
                    		         if(undefined == win || null == win){
                    		        	var opStore = me.operReasonStore;
                    		        	win = new Ext.Window({//加载窗体
                    		                 layout:'fit',
                    		                 width:500,
                    		                 height:300,
                    		                 plain: true,
                    		                 id: 'zeroReceiveThemeEditWin',
                    		                 items: new Ext.FormPanel({//加载form表单
                    		                 labelWidth: 110, // label settings
                            		               frame:true,
                            		               title: '编辑游戏聚合页信息',
                            		               bodyStyle:'padding:5px 5px 0',
                            		               width: 350,
                            		               defaults: {width: 230},
                            		               defaultType: 'textfield',
                            		               items: [
          		                                        {xtype:"textfield", id:"edit_id",name:"edit_id",hidden:true, value:updateObject.id},
          		                                        {xtype:"textfield", id:"edit_theme_name",name:"edit_theme_name",fieldLabel : "主题<font color='red'>*</font>", allowBlank:false,anchor : "98%", value:updateObject.theme_name},
          								  	            {xtype: 'combo',  name: 'edit_is_enable', id : "edit_is_enable", triggerAction:'all',forceSelection: true,
          			                                           editable: false, fieldLabel:"是否启用<font color='red'>*</font>", anchor : "98%",
          			                                           mode: 'local', displayField:'text', valueField:'value', store: isEnableStore, value:updateObject.is_enable},
  			                                            {xtype:"textfield", id:"edit_url",name:"edit_url",fieldLabel : "URL", anchor : "98%", value:updateObject.url,disabled:true},
          												{xtype:"textfield", id:"edit_remark",name:"edit_remark",fieldLabel : "备注", allowBlank:true, anchor : "98%", value:updateObject.remark},
                            		               ]
                    		                 }),
          		          		         buttons: [
          	          		                   {text:'保存',
          		                                 handler : function(){
          		                                 if(Ext.getCmp("edit_theme_name").isValid() && Ext.getCmp("edit_is_enable").isValid() && Ext.getCmp("edit_remark").isValid()){
          		                                	 
          		                                	 var id = Ext.getCmp("edit_id").getValue();
          		                                	 var theme_name = Ext.getCmp("edit_theme_name").getValue();
          		                                	 var is_enable = Ext.getCmp("edit_is_enable").getValue();
          		                                	 var remark = Ext.getCmp("edit_remark").getValue();
          		                                	 Ext.Ajax.request({
          		                                		   url: SAVE_URLS.UPDATE,
          		                                		   params: {"id":id, "theme_name":theme_name,"is_enable":is_enable,"remark":remark},
          		                                		   success: function(resp,otps){
          		                                			   var obj = Ext.decode(resp.responseText);
          		                                			   var success = obj.success;
          		                                			   if(success){
          		                                				   me.store.reload();
          		                                				   win.close();
          		                                			   }else{
          		                                				   utils.show_msg(obj.msg);
          		                                			   }
          		                                		   },
          		                                		   failure : function(resp ,otps){
          		                                			   utils.show_msg("修改失败，后台异常!");
          		                                		   }
          		                                		});
          		                                 }else{
          		                                	 utils.show_msg("信息校验不通过!请重新填写!");
          		                                 }
          		                                }
                    		                   },
          	                             	{text: '取消', handler: function(){ win.close();}
          	                            }]
                    		           });
                    		        }
                    		        win.show(this);
                   	            },
                   	            failure: function(resp, otps){
                   	            	utils.show_msg("修改之前获取游戏聚合页信息失败");
                   	            }
	                  		});
					}},
					' ', ' ', ' ',
    		        {xtype : "button", text : "删除", icon : "static/libs/icons/delete.png", 
    		        	handler : function(){
    		        		var sels = me.getSelectionModel().getSelections();// 获取选择的记录
		               		 if(sels && sels.length == 1){
		               			 Ext.MessageBox.confirm('删除游戏聚合页信息', '确定要删除吗？', function(btn) {  
		               				    if(btn == 'yes'){
		           	        				 var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "正在处理中,请耐心等待..." });
		                						 myMask.show();
		                                    	 Ext.Ajax.request({
		                                    		   url: DELETE_URLS.GET,
		                                    		   params: {'id':sels[0].data.id},
		                                    		   success: function(resp,otps){
		                                    			   myMask.hide();
		                                    			   var obj = Ext.decode(resp.responseText);
		                                    			   if(obj.success){
		                                    				   me.store.reload();
		                                    			   } else {
		                                    				   utils.show_msg(obj.msg);
		                                    			   }
		                                    		   },
		                                    		   failure : function(resp ,otps){
		                                    			   myMask.hide();
		                                    			   utils.show_msg("发送删除请求时发生错误");
		                                    		   }
	                                    		});
		               				    }
		               				}); 
		               		 } else{
		               			 utils.show_msg("请选择一条记录删除");
		               		 }
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

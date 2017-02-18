define(function(require, exports, module) {
    var URLS = {
        GET: "adminZeroYuanShop/getList",//获取列表url
        IMPORT_GET : "adminZeroYuanShop/importZeroProuduct" , // 导入寄售商品
        DOWNLOAD_GET : "adminZeroYuanShop/uploadTemplateUrl", //下载模板文件路径
	    GET_DICTIONARY: "adminDictionary/getItems",//获取字典项
	    DELETE_GET: "adminZeroYuanShop/delete",//删除号库记录
    };
   
    var utils = require('../utils.js');
    
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
                {name: 'game_login_id'},
                {name: 'game_login_password'},
                {name: 'game_id'},
                {name: 'game_name'},
                {name: 'channel_id'},
                {name: 'channel_name'},
                {name: 'useable'},
                {name: 'uid'},
                {name: 'create_time'},
                {name: 'order_id'},
                {name: 'type'}
                
            ],
            listeners :{
    			beforeload : function(s){
    				  //游戏账号
			    	    var game_login_id = Ext.getCmp('game_login_id').getValue();
				        // 游戏名称
				        var game_name = Ext.getCmp('game_name').getValue();
				        // 渠道名称
				        var channel_name = Ext.getCmp('channel_name').getValue();
				        // 是否可用
				        var useable = Ext.getCmp('useable').getValue();
				        // 账号类型
				        var type = Ext.getCmp('type').getValue();
				        //加载条件参数查询....
				        s.baseParams.game_login_id = game_login_id;
	         			s.baseParams.game_name = game_name;
	         			s.baseParams.channel_name = channel_name;
	         			s.baseParams.useable = useable;
	         			s.baseParams.type = type;
				      
  			 }
          }
        });
    };

    var myPanel = Ext.extend(Ext.grid.EditorGridPanel, {
        createColumn: function(me) {
            return [
                // new Ext.grid.RowNumberer,
                me.sm,
                {header: 'ID', dataIndex: 'id', align: 'left', sortable: true, width: 100,hidden : true},
                {header: '账号类型', dataIndex: 'type', align: 'left', sortable: false, width: 50,
                	renderer: function(value){
                		if(me.createGroupItemStore.getById(value) == undefined){
                    		return value;
                    	}
                    	return me.createGroupItemStore.getById(value).get('name');
                }},
                {header: '游戏账号', dataIndex: 'game_login_id', align: 'left', sortable: false, width: 80},
                {header: '游戏密码', dataIndex: 'game_login_password', align: 'left', sortable: false, width: 100},
                {header: '游戏名称', dataIndex: 'game_name', align: 'left', sortable: false, width: 80},
                {header: '渠道名称', dataIndex: 'channel_name', align: 'left', sortable: false, width: 80},
                {header: '是否已用', dataIndex: 'useable', align: 'left', sortable: false, width: 50, 
                	renderer: function(value){
                		if(value==1){
                			return "<font color = 'red'>是</font>";
                		}else{
                			return '否';
                		}
                	}
                },
                {header: '用户UID', dataIndex: 'uid', align: 'left', sortable: false, width: 50},
                {header: '订单号', dataIndex: 'order_id', align: 'left', sortable: false, width: 100},
                {header: '创建时间', dataIndex: 'create_time', align: 'left', sortable: false, width: 100}
            ];
        },
      
        viewConfig : {
        	forceFit: true,
        },
        
        constructor: function() {
            var me = this;
            me.pageSize = 50; 
            me.store = createDataStore();
            me.createGroupItemStore = createGroupItemStore();
            me.sm = new Ext.grid.CheckboxSelectionModel();
            me.column = me.createColumn(me);
            Ext.QuickTips.init();
            Ext.form.Field.prototype.msgTarget='side';
            myPanel.superclass.constructor.call(this, {
                id: "tab:admin:one_yuan_shop_list",
                title: "号库账号列表",
                columns: me.column,
                collapsible: true,
		        animCollapse: false,
                layout: 'fit',
                autoScroll : true,
                loadMask: true,
                bbar: new Ext.PagingToolbar({store: this.store, pageSize: this.pageSize, displayInfo: true}),
                tbar: new Ext.Toolbar({ 
                	autoScroll : true,
                	items : [
                	         {
           	                    xtype: 'buttongroup',
           	                    columns: 21,
           	                    defaults: {
           	                        scale: 'small'
           	                    },
           	                    items: [
           	                            {xtype: 'label', text: '游戏账号： '},
                                     	{xtype: 'textfield', width: 120, id: 'game_login_id',name: 'game_login_id'},
                                    	{xtype: 'label', text: '游戏名称： '},
                                     	{xtype: 'textfield', width: 120, id: 'game_name',name: 'game_name'},
                                     	{xtype: 'label', text: '渠道名称： '},
                                     	{xtype: 'textfield', width: 120, id: 'channel_name',name: 'channel_name'},
                                     	{xtype: 'label', text: '是否已用： '},
               			                {width: 120, mode:'local', triggerAction: 'all', forceSelection: true,
               		                     editable: true, fieldLabel:'选择是否已用', emptyText:'选择是否已用',
               		                     name: 'useable', id :"useable", xtype: 'combo',
               		                     hiddenName: 'title', displayField: 'name', valueField: 'value',
               		                     store:  new Ext.data.JsonStore({
               		                     fields : ['name', 'value'],
               		                     data   : [
               		                               {name : '是',  value: '1'},
               		                               {name : '否',   value: '0'},
               		                         ]
               		                     })
               			               },
               			               {xtype: 'label', text: '账号类型： '},
		           			           new Ext.form.ComboBox({
		            						id: 'type',name: 'type',
		            					    store: me.createGroupItemStore,
		            					    displayField:'name',  valueField:'code', typeAhead: true,
		            					    mode: 'remote' ,forceSelection: true,
		            					    triggerAction: 'all', allowBlank:true,
		            					    emptyText:'请选择类型', width: 120, selectOnFocus:true
		            					}),
           			               
         								{xtype: 'button', text: "<font color ='red'>查 询</font>",  width: 60, icon: 'static/libs/icons/zoom.png', 
         									    handler: function() {
         									    	 me.store.load();  
         									    }
         								} ,
         								{},{},
         								{xtype: 'button', text: "<font color ='black'>批量删除</font>",  width: 60, icon: 'static/libs/icons/delete.png', 
         									 handler : function(){
         			     				    	 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
         			     				    	 if(sels && sels.length > 0){
         			           				    	var  deleteIds = new Array();
         			           				    	var  game_login_ids = new Array();
         			           				    	var  channel_ids = new Array();
         			           				    	var  game_ids = new Array();
         			           				    	for(var i = 0 ; i< sels.length ; i++){
         			           				    	    if(sels[i].data.useable == 1){
         			           				    	    	utils.show_msg("选择删除的记录必须都是<font color ='red'>未被使用的状态</font>,再删除哦!");
         			           				    	    	return;
         			           				    	    }
         			           				    	    deleteIds[i] = sels[i].data.id;
         			           				    	    game_login_ids = sels[i].data.game_login_id;
         			           				    	    channel_ids = sels[i].data.channel_id;
         			           				    	    game_ids = sels[i].data.game_id;
         			           				    	}
         			           				    utils.show_msg("继续删除");
         			           				      Ext.MessageBox.confirm('删除框', '确定要刪除选择记录？', function(btn) {  
         			                   				    if(btn == 'yes'){
         				                   				     Ext.Ajax.request({
         				  	                     	             url: URLS.DELETE_GET,
         				  	                     	             params: {"deleteIds":deleteIds,"game_login_ids":game_login_ids,"channel_ids":channel_ids,"game_ids":game_ids},
         				  	                     	             method : "POST",
         				  	                     	             success: function(resp, opts){
         				  	                     	                var obj = Ext.decode(resp.responseText);
         				  	                     	            	var success = obj.success;
         				                                   			   if(success){
         				                                   				   utils.show_msg(obj.msg);
         				                                 				   me.store.load({params: {start:0, limit: me.pageSize}});
         				                                   			   }else{
         				                                   				   utils.show_msg(obj.msg);
         				                                   			   }
         					  	                       		     } ,
         					  	                       		     failure: function(resp, otps){
         					                      	            	utils.show_msg("删除失败!");
         					                      	             }
         					  	                       		});
         			                   				    }
         			                   				}); 
         			                		   }else{
         			                			   	 utils.show_msg("请选择要刪除的记录~");
         			                		 }
         			                        }
         								} ,
         								{},
         								{ xtype: 'button', text: '下载模板文件', icon: 'static/libs/icons/download.png', 
         			                        handler : function(){
         			                    		    Ext.Ajax.request({
         			                    		    	url : URLS.DOWNLOAD_GET,
         			                    		    	success : function(resp,opts){
         			                    		    		var obj = Ext.decode(resp.responseText);
         			                    		    		if(obj.success){
         			                    		    			 window.location.href = obj.uploadTemplateFileUrl;//这样就可以弹出下载对话框了  
         			                    		    		}else{
         			                    		    			utils.show_msg(obj.msg);
         			                    		    		}
         			                    		    	},
         			                    		    	failure : function(resp,opts){
         			                    		    		utils.show_msg("upload template file is error");
         			                    		    	}
         			                    		    });
         			                    		 
         			                      	}
         			                    },
         			                   {},
         				               { xtype: 'button', text: '导入号库', icon:'static/libs/icons/import.png', 
         				             	      handler : function(){
         				             	    	  	
         				             	    	    var uploadFileValue = Ext.getCmp('form-file').getValue();
         				             	    	    if(uploadFileValue == ""){
         				             	    		   utils.show_msg("请选择xls文件上传,再批量导入商品哦！");
         				             	    		   return false;
         				             	    	    }
         				             	    	    var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "正在处理中,请耐心等待..." });
       				             	    	  		myMask.show();
         				                        	var uploadFile = Ext.getCmp('form-file').getEl().dom.files[0];
         				                            //XXX 使用html5的功能
         				                            var form = new FormData();
         				                            form.append("uploadFile", uploadFile);
         				                            var xmlhttp = new XMLHttpRequest();
         				                            xmlhttp.open("POST", URLS.IMPORT_GET, true);
         				                            xmlhttp.onload = function(e){
         				                            	 myMask.hide();
         				                            	 var resp = Ext.util.JSON.decode(e.currentTarget.response);
         				                            	 if(resp.success){
         				    	              					 utils.show_msg(resp.msg);
         				    	              					 me.store.reload();
         				    	              			   }
         				                                  else{
         				    	              				 utils.show_msg(resp.msg);
         				                  			     }
         				                            };
         				                            xmlhttp.send(form);
         				                           }
         				                    },
         				                   {},{},
            				                {id: 'form-file', hideLabel: false,  xtype: 'textfield',inputType: "file",name : "file-path", listeners: {
//             				                    change: function(field, newValue, oldValue){
//             				                       
//             				                    }
             				                }},
         				             
                	              ]
                	         }
                	      ]
                	}),
                listeners:  {
                	
                	afterrender : function(p){
                       	//按照顺序加载相应的store;  groupStore->store, 保证商品类型列表渲染的时候相应的store已经加载完毕
                           me.load_store();
                       }
                }
            });
        },
        
        
        load_store : function(){
        	var me = this;
        	//字典项store
        	this.createGroupItemStore.on("load", function(s){
    			//加载商品列表
    			me.load_data();
        	});
        	this.createGroupItemStore.load();
        },
        
        load_data : function(){
        	this.store.load({params: {start:0, limit: this.pageSize}});
        },
        
    });
    
    var createGroupItemStore =  function() {
    	return new Ext.data.JsonStore({
	    	url: URLS.GET_DICTIONARY,
	    	baseParams: {'group_code':'HAOKULEIXING'},//获取号库类型
	    	root: 'data',
	    	idProperty: 'code',
	    	totalProperty: 'total_count',
	    	fields:[ 
	          {name: 'code'},
	          {name: 'name'}
	        ]
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

define(function(require, exports, module) {
    var URLS = {
        GET: "adminDcWhiteList/getList",//获取列表url
        EXPORT: "adminDcWhiteList/export" //导出白名单
    };
    var DELETE_URLS = {
    	GET: "adminDcWhiteList/delete"//删除对象url
    };
   
    var SAVE_URLS = {
         GET: "adminDcWhiteList/add"//保存对象url
    };
    
   var GAME_URLS ={
		 GET : "adminGame/getList" //游戏url
   };  
   
   var CHANNEL_URLS ={
		 GET : "adminChannel/getList" //游戏url
   };  
   var UPDATE_URLS = {             
   		GET: "adminDcWhiteList/update" //修改对象url
   }
   var BATCH_UPDATE_URLS = {
   		GET:"adminDcWhiteList/batchUpdate" //批量修改卖家uid
   }
   
    var utils = require('./utils.js');
    var fcb = require("../com/FilterComboBox.js");
    require("../com/FileUploadField.js");
    var fw = require("../com/FormWindow.ui.js");
    //游戏store
    var createGameStore = function(){
    	return new Ext.data.JsonStore({
    		autoDestory : true,
    		url : GAME_URLS.GET,
    		root : 'data',
    		idProperty : 'game_id',
    		totalProperty : 'total_count',
    		fields: [
    		         {name : 'game_id'},
    		         {name : 'game_name'}
    		]
    	});
    };
    
    //渠道store
    var createChannelStore = function(){
    	return new Ext.data.JsonStore({
    		autoDestory : true,
    		url : CHANNEL_URLS.GET,
    		root : 'data',
    		idProperty : 'channel_id',
    		totalProperty : 'total_count',
    		fields: [
    		         {name : 'channel_id'},
    		         {name : 'channel_name'}
    		]
    	});
    };
    
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
                {name: 'channel_id'},
                {name: 'account'},
                {name: 'sub_id'},
                {name: 'buyer_uid'},
                {name: 'seller_uid'},
                {name: 'create_time'},
                {name: 'remark'}
            ],
            listeners :{
    			beforeload : function(s){
				    // 用户账号
			        var account = Ext.getCmp('account').getValue();
			        // 游戏名称
			        var game_name = Ext.getCmp('game_name').getValue();
			        // 买家uid
			        var buyer_uid = Ext.getCmp('buyer_uid').getValue();
			        // 卖家uid
			        var seller_uid = Ext.getCmp('seller_uid').getValue();
			        //加载条件参数查询....
			        s.baseParams.account = account;
         			s.baseParams.game_name = game_name;
         			s.baseParams.buyer_uid = buyer_uid;
           			s.baseParams.seller_uid = seller_uid;
           			s.baseParams.channel_name = Ext.getCmp('channel_name').getValue();
           			s.baseParams.start_time = utils.extDayFormat(Ext.getCmp('start_time').getValue(), 'Y-m-d');
           			s.baseParams.end_time = utils.extDayFormat(Ext.getCmp('end_time').getValue(), 'Y-m-d');
   			 }
           }
        });
    };
    
    //Ext.QuickTips.init();
    Ext.form.Field.prototype.msgTarget='side';
    
    var myPanel = Ext.extend(Ext.grid.EditorGridPanel, {
    	__make_id : function(name){
    		return "admin_dc_white_list"+name;
    	},
    	__get_comp : function(name){
    		return Ext.getCmp(this.__make_id(name));
    	},
        constructor: function() {
            var me = this;
            me.pageSize = 50; 
            me.store = createDataStore();
            me.createChannelStore = createChannelStore();
            if(me.createChannelStore.getCount()==0) {
            	me.createChannelStore.load({params: {1:1}});
            }
            me.createGameStore = createGameStore(); 
            if(me.createGameStore.getCount()==0) {
            	me.createGameStore.load({params: {1:1}});
            }
            me.sm = new Ext.grid.CheckboxSelectionModel();
            me.column = me.createColumn(me);
            myPanel.superclass.constructor.call(this, {
                id: "tab:admin:dc_white_list_list",
                title: "代充白名单列表",
                columns: me.column,
                layout: 'fit',
                loadMask: true,
                bbar: new Ext.PagingToolbar({store: this.store, pageSize: this.pageSize, displayInfo: true}),
                tbar: new Ext.Toolbar([
                    '用户账号:',
                   	' ', ' ', ' ',
                   	{xtype: 'textfield', width: 80, id: 'account',name: 'account'},
                    '游戏名称:',
                   	' ', ' ', ' ',
                   	{xtype: 'textfield',width: 80,id: 'game_name',name: 'game_name'},
   					' ', ' ', ' ',
   					'买家uid:',
                	' ', ' ', ' ',
                	{xtype: 'textfield', width: 80, id: 'buyer_uid',name: 'buyer_uid'},
					' ', ' ', ' ',
					'卖家uid:',
                   	' ', ' ', ' ',
                   	{xtype: 'textfield', width: 80, id: 'seller_uid',name: 'seller_uid'},
                   	'渠道名称:',
                   	' ', ' ', ' ',
                   	{xtype: 'textfield', width: 80, id: 'channel_name',name: 'channel_name'},
                   	'创建时间:',
                   	' ', ' ', ' ',
                   	{xtype: 'datefield',width: 80,id: 'start_time',name: 'start_time', format: 'Y-m-d'},
                   	'-',
                   	{xtype: 'datefield',width: 80,id: 'end_time',name: 'end_time', format: 'Y-m-d'},
                   	'子游戏ID:',
                   	' ', ' ', ' ',
   					{xtype: 'numberfield',width: 60,id: 'sub_id',name: 'sub_id'},
   					{xtype: 'button', text: '查 询',  width: 45, icon: 'static/libs/icons/zoom.png', 
   					    handler: function() {
   					        me.store.baseParams = {};
   					        // 用户账号
   					        var account = Ext.getCmp('account').getValue();
   					        // 游戏名称
   					        var game_name = Ext.getCmp('game_name').getValue();
   					        // 买家uid
   					        var buyer_uid = Ext.getCmp('buyer_uid').getValue();
   					        // 卖家uid
   					        var seller_uid = Ext.getCmp('seller_uid').getValue();
   					        //渠道名称
   					        var channel_name = Ext.getCmp('channel_name').getValue();
   					        //创建时间
   					        var start_time = utils.extDayFormat(Ext.getCmp('start_time').getValue(), 'Y-m-d');
   					        var end_time = utils.extDayFormat(Ext.getCmp('end_time').getValue(), 'Y-m-d');
   					        //子游戏ID
   					        var sub_id = Ext.getCmp('sub_id').getValue();
   					        //记载条件参数查询....
   					        me.store.reload({params: {'account': account,'game_name': game_name,'buyer_uid': buyer_uid,'seller_uid': seller_uid, 'sub_id':sub_id,
   					        	'channel_name':channel_name, 'start_time':start_time, 'end_time':end_time, start:0, limit:  me.pageSize}});
   					    }
   					},
	   				 ' ', '-', ' ',   
	                {xtype: 'button', text: '清空条件',  width: 60, icon: 'static/libs/icons/reset.png', 
	                	 handler: function (){
	                		     Ext.getCmp('account').setValue('');
	                		     Ext.getCmp('game_name').setValue('');
	                		     Ext.getCmp('buyer_uid').setValue('');
	                		     Ext.getCmp('seller_uid').setValue('');
	                		     Ext.getCmp('channel_name').setValue('');
	                		     Ext.getCmp('start_time').setValue('');
	                		     Ext.getCmp('end_time').setValue('');
	                		     Ext.getCmp('sub_id').setValue('');
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
              		                 height:300,
              		                 plain: true,
              		                 items: new Ext.FormPanel({//加载form表单
              		                 labelWidth: 110, // label settings
                      		               frame:true,
                      		               title: '新增代充白名单信息',
                      		               bodyStyle:'padding:5px 5px 0',
                      		               width: 350,
                      		               defaults: {width: 230},
                      		               defaultType: 'textfield',
                      		               items: [
	                      		                   {fieldLabel: '账号', id : "a_account", name: 'a_account',value : "", allowBlank:false},
	                      		                   me.createGameFilterField("a_game_id"),
	                      		                   me.createChannelFilterField("a_channel_id"),
	                      		                   {fieldLabel: '买家uid', id : "a_buyer_uid", name: 'a_buyer_uid',xtype : 'numberfield',value : "",allowBlank:false,blankText:"请填入非空的数字"},
	                        		               {fieldLabel: '卖家uid', id : "a_seller_uid", name: 'a_seller_uid', xtype : 'numberfield', value : "", allowBlank:false, blankText:"请填入非空的数字"},
	                      		                   {fieldLabel: '备注', name: 'a_remark', id : "a_remark", value : ""},
	                      		                   {fieldLabel: '子游戏ID', id : "a_sub_id", name: 'a_sub_id', xtype : 'numberfield', value : "", allowBlank:false, blankText:"请填入非空的数字"}
                      		               ]
              		                 }),
              		         buttons: [
              		                   {text:'保存',
		                                 handler : function(){
		                                 if(Ext.getCmp("a_account").isValid() && Ext.getCmp("a_game_id").isValid() 
		                                	&& Ext.getCmp("a_channel_id").isValid()
		                                	&& Ext.getCmp("a_buyer_uid").isValid()
		                                	&& Ext.getCmp("a_seller_uid").isValid()
		                                	&& Ext.getCmp("a_sub_id").isValid()){
		                                	 //账号
		                                	 account = Ext.getCmp("a_account").getValue();
		                                	 //游戏
		                                	 var gameId = Ext.getCmp("a_game_id").getValue();
		                                	 if(gameId == ""){
		                                		 utils.show_msg("请选择游戏");
		                                		 return false;
		                                	 }
		                                	 //渠道
		                                	 var channelId = Ext.getCmp("a_channel_id").getValue();
		                                	 if(channelId == ""){
		                                		 utils.show_msg("请选择渠道");
		                                		 return false;
		                                	 }
		                                	 //买家uid
		                                	 var buyerUid = Ext.getCmp("a_buyer_uid").getValue();
		                                	 //卖家uid
		                                	 var sellerUid = Ext.getCmp("a_seller_uid").getValue();
		                                	 //备注
		                                	 var remark = Ext.getCmp("a_remark").getValue();
		                                	 var subId = Ext.getCmp('a_sub_id').getValue();
		                                	 Ext.Ajax.request({
		                                		   url: SAVE_URLS.GET,
		                                		   params: {"account":account,"gameId":gameId,
		                                			   		"channelId":channelId,"buyer_uid":buyerUid,"seller_uid":sellerUid,"remark":remark,"sub_id":subId},
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
                    			 idStr.push(sels[i].id);
                    		 }
                    		 var ids = idStr.join(",");
                			 Ext.MessageBox.confirm('删除选择框', '确定要批量删除？', function(btn) {  
                				    if(btn == 'yes'){
               				    		var data = {'ids':ids};
            				    		var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "删除中，这可能需要一点时间..." });
            	        				myMask.show();
            	            			utils.http_request(DELETE_URLS.GET, data, function(json){
            	            				//完成请求后重新去除蒙板
            								myMask.hide();
            								me.store.load({params: {start:0, limit: me.pageSize}});
            	            			});
                				    }
                				}); 
                    	 }
                    },
                     ' ', '-', ' ',   
                     {xtype: 'button', text: '修改',  width: 45, icon : "static/libs/icons/application_edit.png", id: 'dcWhiteListUpdateBtn',
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
                        	 var selected_sub_id = sels[0].data.sub_id;
                        	 var selected_buyer_uid = sels[0].data.buyer_uid;
                        	 var selected_seller_uid = sels[0].data.seller_uid;
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
                      		               title: '修改代充白名单信息',
                      		               bodyStyle:'padding:5px 5px 0',
                      		               width: 350,
                      		               defaults: {width: 230},
                      		               defaultType: 'textfield',
                      		               items: [
	                        		               {fieldLabel: '卖家uid', id : "e_seller_uid", name: 'e_seller_uid', xtype : 'numberfield', value : selected_seller_uid, allowBlank:false, blankText:"请填入非空的数字"},
	                      		                   {fieldLabel: '买家uid', id : "e_buyer_uid", name: 'e_buyer_uid',xtype : 'numberfield',value : selected_buyer_uid,allowBlank:false,blankText:"请填入非空的数字"},
	                      		                   {fieldLabel: '备注', name: 'e_remark', id : "e_remark", value : selected_remark},
	                      		                   {fieldLabel: '子游戏ID', id : "e_sub_id", name: 'e_sub_id', xtype : 'numberfield', value : selected_sub_id, allowBlank:false, blankText:"请填入非空的数字"}
                      		               ]
              		                 }),
              		         buttons: [
              		                   {text:'保存',
		                                 handler : function(){
		                                 if( selected_id != ""  
		                                	&& Ext.getCmp("e_seller_uid").isValid()		       
		                                	&& Ext.getCmp("e_buyer_uid").isValid()
		                                	&& Ext.getCmp("e_remark").isValid()
		                                	&& Ext.getCmp("e_sub_id").isValid()){
		                                	 //卖家uid
		                                	 var sellerUid = Ext.getCmp("e_seller_uid").getValue();
		                                	 //买家uid
		                                	 var buyerUid = Ext.getCmp("e_buyer_uid").getValue();
		                                	 //备注
		                                	 var remark = Ext.getCmp("e_remark").getValue();
		                                	 //子游戏id
		                                	 var subId = Ext.getCmp('e_sub_id').getValue();
		                                	 Ext.Ajax.request({
		                                		   url: UPDATE_URLS.GET,
		                                		   params: {"id":selected_id,"seller_uid":sellerUid,"buyer_uid":buyerUid,"remark":remark,"sub_id":subId},
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
                    },
                    ' ', '-', ' ',  
                     {xtype: 'button', text: '批量修改卖家uid',  width: 45,  icon : "static/libs/icons/application_edit.png", 
                         handler:  function(){
                        	 var addWin = null;
                        	 //获取EditorGridPanel选中的行
                        	 var sels = me.getSelectionModel().getSelections();
                        	 if(undefined == sels || sels.length < 1) {
                    			 utils.show_msg("请选择一条记录修改"); 
                    			 return;
                    		 }
                    		 var idStr = [];
                    		 for(var i=0; i<sels.length; i++) {
                    			 idStr.push(sels[i].id);
                    		 }
                    		 var ids = idStr.join(",");
              		         if(!addWin){
              		        	addWin = new Ext.Window({//加载窗体
              		                 layout:'fit',
              		                 width:500,
              		                 height:150,
              		                 plain: true,
              		                 items: new Ext.FormPanel({//加载form表单
              		                 labelWidth: 110, // label settings
                      		               frame:true,
                      		               title: '修改代充白名单信息',
                      		               bodyStyle:'padding:5px 5px 0',
                      		               width: 350,
                      		               defaults: {width: 230},
                      		               defaultType: 'textfield',
                      		               items: [
	                        		               {fieldLabel: '卖家uid', id : "b_seller_uid", name: 'b_seller_uid', xtype : 'numberfield', allowBlank:false, blankText:"请填入非空的数字"}
                      		               ]
              		                 }),
              		         buttons: [
              		                   {text:'保存',
		                                 handler : function(){
		                                 if( Ext.getCmp("b_seller_uid").isValid()){
		                                	 //卖家uid
		                                	 var sellerUid = Ext.getCmp("b_seller_uid").getValue();
		                                	 Ext.Ajax.request({
		                                		   url: BATCH_UPDATE_URLS.GET,
		                                		   params: {"ids":ids,"seller_uid":sellerUid},
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
		                                			   utils.show_msg("修改出现异常!");
		                                		   }
		                                		});
		                                 }else{
		                                	 utils.show_msg("卖家uid不能为空!请重新填写!");
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
                    afterrender: function() {
                        me.store_load();
                    },
            		render : function(p){
            			var tbar2 = me.createTbar2();
            			tbar2.render(p.tbar);
            		},
            		rowdblclick : function(grid, rowIndex, columnIndex, e){
                    	Ext.getCmp('dcWhiteListUpdateBtn').handler();
                    }
                }
            });
        },
        store_load : function(){
        	this.store.load({params: {start:0, limit: this.pageSize}});
        },
        createTbar2 : function(){
        	var me = this;
        	return new Ext.Toolbar({
        		items : [
    		         {xtype : "button", text : "批量导入", icon: "static/libs/icons/arrow_in.png", handler : function(b){
    		        	 var win = me.create_input_csv_window();
    		        	 win.show();
    		         }},
    		         {xtype : "button", text : "导出", icon: "static/libs/icons/arrow_out.png", handler : function(b){
    		        	 var account = Ext.getCmp('account').getValue();
				         var game_name = Ext.getCmp('game_name').getValue();
				         var buyer_uid = Ext.getCmp('buyer_uid').getValue();
				         var seller_uid = Ext.getCmp('seller_uid').getValue();
				         var channel_name = Ext.getCmp('channel_name').getValue();
				         var start_time = utils.extDayFormat(Ext.getCmp('start_time').getValue(), 'Y-m-d');
				         var end_time = utils.extDayFormat(Ext.getCmp('end_time').getValue(), 'Y-m-d');
				         
				         var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "正在导出数据中..." });
		            	 myMask.show();
    		        	 Ext.Ajax.request({
                		    url: URLS.EXPORT,
                		    params: {'account':account,'game_name': game_name,'buyer_uid': buyer_uid,'seller_uid': seller_uid , 'channel_name': channel_name,'start_time': start_time,'end_time': end_time},
						    success: function(resp,otps){
                			   var obj = Ext.decode(resp.responseText);
                			   var isExportSuccess = obj.isExportSuccess;
                			   if(isExportSuccess){
                				  Ext.Msg.hide(); 
                				  utils.show_msg("导出成功!");
                				  myMask.hide();
                				  window.location.href = obj.fileUrl;
                			   }else{
                				 utils.show_msg(obj.msg);
                				 myMask.hide();
                			   }
                		   },
                		   failure : function(resp ,otps){
                			   utils.show_msg("导出失败!");
                			   myMask.hide();
                		   }
                		});  
    		         }}
		        ]
        	});
        },
        create_input_csv_window : function(){
        	var me = this;
        	var win = new  fw.FormWindowUi({
                title : "上传csv文件",
                id : me.__make_id("from_window"),
                fileUpload: true,
                width : 600,
                height : 300
            });
            win.addItem({
                xtype : "button",
                fieldLabel : "文件模版",
                name : "input_temp_file",
                width : 200,
                text : "下载模版",
                handler : function(){
                    var url = utils.build_url("adminDcWhiteList/loadTempInputCsv");
                    window.open(url, "_blank");
                }
            });
            win.addItem({
                xtype: 'textfield',
                inputType: "file",
                fieldLabel : "文件路径",
                id : me.__make_id("uploadFile"),
                name: "uploadFile", width: 200,
                buttonText : "选择文件..."
            });
            win.addItem({
            	xtype : "textarea",
            	fieldLabel: "导入日志",
            	id: me.__make_id("run_log"),
            	width : 450,
            	height: 150
            });
            //常规计价基本信息
            var data = "";
            win.onClickSubmit = function(){
                var uploadFileValue = me.__get_comp("uploadFile").getValue();
  	    	    if(uploadFileValue == ""){
  	    		   utils.show_msg("请选择上传文件");
  	    		   return false;
  	    	    }
             	var uploadFile = me.__get_comp("uploadFile").getEl().dom.files[0];
             	
                 //XXX 使用html5的功能
                 var form = new FormData();
                 form.append("uploadFile", uploadFile);
                 var xmlhttp = new XMLHttpRequest();
               	 var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "客官请您稍等~小二正在努力更新数据哦...." });
     			 myMask.show();
     			 xmlhttp.onreadystatechange=callback; 
                 xmlhttp.open("POST", utils.build_url("adminDcWhiteList/addDcWhiteByInputCsv"), true);
                 xmlhttp.onload = function(e){
                	 myMask.hide();
                	 var resp = Ext.util.JSON.decode(e.currentTarget.response);
                 	 if(resp.success){
       					 me.store.reload();
   			   		 }
                 	utils.show_msg(resp.msg);
                 	me.__get_comp("run_log").setValue(resp.run_log);
                 };
                 xmlhttp.send(form);
                 function callback() {  
                
              	    //接收响应数据  
              	    //判断对象状态是否交互完成，如果为4则交互完成  
              	     if(xmlhttp.readyState == 4) { 
              	    	 myMask.show();
              	         //判断对象状态是否交互成功,如果成功则为200 ,如果 500则不成功
              	        if(xmlhttp.status == 500) {  
              	            //接收数据,得到服务器输出的纯文本数据  
              	            utils.show_msg("修改失败,后台异常!");
              	            return;
              	        }  
              	    }   
              	 }  
            };
            win.onSubmitSuccess = function(json){
                if(json.success){
                	me.store_load();
                    win.close();
                }
                utils.show_msg(json.msg);
            }
            return win;
        },
        createGameFilterField : function(id){
			var me = this;
            var filter_combo = new fcb.FilterComboBoxUi({
            	fieldLabel : '游戏',
                id: id,
                //width: 230,
                combo_width : 130,
                displayField: "game_name",
                valueField: "game_id",
                txtfield_width : 100,
                allowBlank:false,
                value : "",
                store: me.createGameStore,
                filterBy: function(record, id){
                    var game_name = record.get("game_name");
                    var filter_text = filter_combo.getFilterText();
                    if(game_name.indexOf(filter_text) != -1){
                        return true;
                    }
                    return false;
                }
            });
            return filter_combo;
	    },
	    createChannelFilterField : function(id){
			var me = this;
            var filter_combo = new fcb.FilterComboBoxUi({
            	fieldLabel : '渠道',
                id: id,
                width: 230,
                combo_width : 130,
                displayField: "channel_name",
                valueField: "channel_id",
                txtfield_width : 100,
                allowBlank:false,
                store: me.createChannelStore,
                filterBy: function(record, id){
                    var game_name = record.get("channel_name");
                    var filter_text = filter_combo.getFilterText();
                    if(game_name.indexOf(filter_text) != -1){
                        return true;
                    }
                    return false;
                }
            });
            return filter_combo;
	    },
        createColumn: function(me) {
            return [
                // new Ext.grid.RowNumberer,
                me.sm,
                {header: 'ID', dataIndex: 'id', align: 'left', sortable: true, width: 50,hidden : false},
                {header: '游戏编号', dataIndex: 'game_id', align: 'left', sortable: false, width: 50},
                {header: '游戏名称', dataIndex: 'game_name', align: 'left', sortable: false, width: 80},
                {header: '渠道编号', dataIndex: 'channel_id', align: 'left', sortable: false, width: 50},
                {header: '渠道名称', dataIndex: 'channel_id', align: 'left', sortable: false, width: 60,
                	renderer: function(value){
                		 if(me.createChannelStore.data.length != 0 && me.createChannelStore.getById(value) == undefined){
                			 return "";//数据库中的错乱数据处理
                		 }else{
                			  if(me.createChannelStore.getCount()==0) {
                	            	me.createChannelStore.load({params: {1:1}});
                	            }
                			 return  me.createChannelStore.getById(value).get('channel_name');
                		 }
                	}
                },
                {header: '游戏账号', dataIndex: 'account', align: 'left', sortable: false, width: 70},
                {header: '子游戏ID', dataIndex: 'sub_id', align: 'left', sortable: false, width: 60},
                {header: '买家uid', dataIndex: 'buyer_uid', align: 'left', sortable: false, width: 50},
                {header: '卖家uid', dataIndex: 'seller_uid', align: 'left', sortable: false, width: 50},
                {header: '创建时间', dataIndex: 'create_time', align: 'left', sortable: false, width: 80},
                {header: '备注', dataIndex: 'remark', align: 'left', sortable: false, width: 120}
            ];
        },
        viewConfig : {
        	forceFit: true
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

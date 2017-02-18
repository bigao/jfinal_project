define(function(require, exports, module) {
    var URLS = {
        GET: "adminProductType/getList",
        GET_GROUP: "adminProductTypeGroup/getList",
        GET_CHANNEL: "adminChannel/getList",
        GET_DELETE : "adminProductType/delete",
        GET_ADD : "adminProductType/add",
        GET_QUERY : "adminProductType/query",
        GET_UPDATE :  "adminProductType/updateProductType",
        GET_SYNCHRONIZE : "adminProductType/synchronizedProduct",
        GET_TRADE_MODE : "commonHelper/readTradModeList"
    };

    var utils = require('./utils.js');
    
    var createChannelStore =  function() {
    	return new Ext.data.JsonStore({
	    	autoDestroy: true,
	    	url: URLS.GET_CHANNEL,
	    	baseParams: {usable:1},
	    	root: 'data',
	    	idProperty: 'channel_id',
	    	totalProperty: 'total_count',
	    	fields:[ 
	          {name: 'channel_id'},
	          {name: 'channel_name'}
	        ]
	    });
    };
    
    var createGroupStore =  function() {
    	return new Ext.data.JsonStore({
	    	autoDestroy: true,
	    	url: URLS.GET_GROUP,
	    	baseParams: {usable:1},
	    	root: 'data',
	    	idProperty: 'product_type_group_id',
	    	totalProperty: 'total_count',
	    	fields:[ 
	          {name: 'product_type_group_id'},
	          {name: 'name'}
	        ]
	    });
    };
    
    var createDataStore = function() {
        return new Ext.data.JsonStore({
            autoDestroy: true,
            url: URLS.GET,
            baseParams: {start:0, limit: 50},
            root: 'data',
            idProperty: 'product_type_id',
            totalProperty: 'total_count',
            fields:[ 
                {name: 'product_type_id'},
                {name: 'name'},
                {name: 'channel_name'},
                {name: 'usable'},
                {name: 'weight'},
                {name: 'product_type_group_id'},
                {name: 'default_discount'},
                {name: 'default_sub_channel'},
                {name: 'default_trade_mode'},
                {name: 'wap_icon_url'},
                {name: 'web_icon_url'},
                {name: 'angle_icon_url'}
            ],
            listeners :{
    			beforeload : function(s){
    				 //分类名称
			        var name = Ext.getCmp('name').getValue();
			        //一级分类ID
			        var groupId = Ext.getCmp('product_type_group_id').getValue();
			        //加载条件参数查询....
			        s.baseParams.group_id = groupId;
         			s.baseParams.name = name;
   			 }
           }
        });
    };
    
    //交易模式
    var createTradModeStore = function(){
    	return new Ext.data.JsonStore({
    		autoload:true,
    		idProperty : "value",
            url : URLS.GET_TRADE_MODE,
            fields : [{name : "name"},{name : "value"}],
            root : "data",
        });
    };

    Ext.QuickTips.init();
    Ext.form.Field.prototype.msgTarget='side';

    var myPanel = Ext.extend(Ext.grid.EditorGridPanel, {
        constructor: function() {
            var me = this;
            me.pageSize = 50; 
            me.store = createDataStore();
            me.groupStore = createGroupStore();
            me.channelStrore = createChannelStore();
            //交易模式
            me.tradModeStore = createTradModeStore();
            me.sm = new Ext.grid.CheckboxSelectionModel();
            me.column = me.createColumn(me);
            myPanel.superclass.constructor.call(this, {
                id: "tab:admin:product_type_list",
                title: "商品分类管理",
                columns: me.column,
                layout: 'fit',
                loadMask: true,
                bbar: new Ext.PagingToolbar({store: this.store, pageSize: this.pageSize, displayInfo: true}),
                tbar: new Ext.Toolbar([
                    '分类名称:',
                	' ', ' ', ' ',
                	{xtype: 'textfield', width: 150, id: 'name', name: 'name',},
                	' ', ' ', ' ',
					'一级分类:', 
					' ', ' ', ' ',
					new Ext.form.ComboBox({
						id: 'product_type_group_id',name: 'product_type_group_id',
					    store: me.groupStore, displayField:'name',
					    valueField:'product_type_group_id', typeAhead: true,
					    mode: 'local' ,forceSelection: true,
					    triggerAction: 'all', allowBlank:true,
					    emptyText:'选择一级分类', width: 150, selectOnFocus:true
					  }),
					' ', ' ', ' ',
					{xtype: 'button', text: '查 询',  width: 60, icon: 'static/libs/icons/zoom.png', 
					    handler: function() {
					        me.store.baseParams = {};
					        //分类名称
					        var name = Ext.getCmp('name').getValue();
					        //一级分类ID
					        var groupId = Ext.getCmp('product_type_group_id').getValue();
					        //记载条件参数查询....
					        me.store.reload({params: {'group_id': groupId,'name': name,start:0, limit:  me.pageSize}});
					    }
					},
					' ', '-', ' ',
                    {xtype: 'button', text: '增加',  width: 60, icon: 'static/libs/icons/add.png', 
                     handler: function() {
                 			 var addWin = null;
                 		         if(!addWin){
                 		        	var addWinGroupStore = createGroupStore();
                 		        	 addWin = new Ext.Window({//加载窗体
                 		                 layout:'fit',
                 		                 width:400,
                 		                 height:600,
                 		                 autoScroll:true,
                 		                 plain: true,
                 		                 items: new Ext.FormPanel({//加载form表单
                 		                	   labelWidth: 95, // label settings
                          		               frame:true,
                          		               title: '新增商品分类信息',
                          		               bodyStyle:'padding:5px 5px 0',
                          		               width: 350,
                          		               defaultType: 'textfield',
                          		               items: [
													   {fieldLabel: '名称', id : "a_product_type_name", name: 'a_product_type_name', value : "", allowBlank:false},
	                          		                    new Ext.form.ComboBox({
		                          		                	fieldLabel: '渠道名称',id: 'a_channel_id',name: 'a_channel_name', displayField:'channel_name',
		                          						    valueField:'channel_id', typeAhead: true, mode: 'local', forceSelection: true, triggerAction: 'all', 
		                          						    emptyText:'选择渠道', width: 150,selectOnFocus:true,
		                          						    store :  new Ext.data.JsonStore({
		                          								autoDestroy: true,url: URLS.GET_CHANNEL,baseParams: {usable:1},root: 'data',
		                          						    	idProperty: 'channel_id',totalProperty: 'total_count',
		                          						    	fields:[ 
		                          						          {name: 'channel_id'},
		                          						          {name: 'channel_name'}
		                          						        ]
	                          							     }),
	                          							     listeners: {
	                		 		                            render: function(combo){
	                		 		                                combo.store.load();
	                		 		                            }
	            		               					    },
		                          						  }),
	                          		                    {width:50, xtype:'combo',  mode:'local', triggerAction: 'all', value : '1', forceSelection: true,
		                                                 editable:false, fieldLabel:'是否可用',  name: 'a_usable', id :"a_usable", hiddenName: 'title',
		                                                 displayField:'name',valueField:'value',
		                                                 store: new Ext.data.JsonStore({
		                                                       fields : ['name', 'value'],
		                                                       data   : [
		                                                           {name : '是',   value: '1'},
		                                                           {name : '否',  value: '0'},
		                                                       ]
		                                                   })
		                          		                 },
	                          		                    {fieldLabel: '权重', xtype : 'numberfield',name: 'a_weight',value : "", id : "a_weight", allowBlank:false, blankText:"请填入非空的数字"},
		                          		                 new Ext.form.ComboBox({
		                          		                	fieldLabel:'一级分类',id: 'a_product_type_group_id',name: 'a_product_type_group_id',
		                          		                	displayField:'name', valueField:'product_type_group_id', typeAhead: true,
		                          						    mode: 'local', forceSelection: true, triggerAction: 'all',
		                          						    allowBlank:false, emptyText:'选择一级分类', width: 150, selectOnFocus:true,
		                          							store :  new Ext.data.JsonStore({
		                      							    	autoDestroy: true,url: URLS.GET_GROUP,baseParams: {usable:1},
		                      							    	root: 'data',idProperty: 'product_type_group_id',totalProperty: 'total_count',
		                      							    	fields:[ 
		                      							          {name: 'product_type_group_id'},
		                      							          {name: 'name'}
		                      							        ]
		                      							    }),
		                      							    listeners: {
		            		 		                            render: function(combo){
		            		 		                                combo.store.load();
		            		 		                            }
		        		               					    },
		                          						 }),
		                          						 {fieldLabel: '默认折扣', xtype : 'numberfield', id : "a_default_discount",name: 'a_default_discount', value : "10", allowBlank:false, blankText:"请填入非空的数字"},
			                          		             {fieldLabel: '默认子渠道',id : "a_default_sub_channel",name: 'a_default_sub_channel',value : "无", allowBlank:false },
			                          		             {width:150,xtype:'combo', mode:'local', triggerAction: 'all',forceSelection: true,editable:true,allowBlank:false,fieldLabel:'默认交易模式',
	    	    		        	                      emptyText:'请选择交易模式', name:'a_default_trade_mode',id : "a_default_trade_mode", hiddenName:'title',
	    	    		        	                      displayField:'name',valueField:'value',
	    	    		        	                      store : new Ext.data.JsonStore({
	      		                          		          		autoDestory : true,url : URLS.GET_TRADE_MODE,
	      		                          		          		root : 'data',idProperty : 'value',
	      		                          		          		fields: [
	      		                          		          		         {name : 'name'},
	      		                          		          		         {name : 'value'}
	      		                          		          		],
	      		                          		          	}),
	            		               					    listeners: {
	                		 		                            render: function(combo){
	                		 		                                combo.store.load();
	                		 		                            }
	            		               					    } 
	    		                          		        },
	    		                          		        {fieldLabel: 'wap图标预览',id : "wap" , xtype: 'box', autoEl: {src:  "", tag: 'img', complete: 'off',width:72, height: 72}},
	    		                          		        {xtype: 'textfield', id : "wapFile", width : '65', inputType: "file",
		      		                                    	listeners:{
		      		                                    		change : function (file,oldValue,newValue){
		           		                                          var el = Ext.getCmp("wapFile").getEl();
		           		                                          Ext.get("wap").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
		      		                                    		}  
		      		                                    	 } 
	    		                          		       },
	    		                          		       {fieldLabel: 'web图标预览',id : "web" ,xtype: 'box', autoEl: {src:  "", tag: 'img', complete: 'off',width:72, height: 72}},
	    		                                       {xtype: 'textfield',id : "webFile", width : '65', inputType: "file",
	    		                                    	listeners:{
	    		                                    		change : function (file,oldValue,newValue){
	           		                                          var el = Ext.getCmp("webFile").getEl();
	           		                                          Ext.get("web").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
	    		                                    		}  
	    		                                    	 } 
	    		                                       },
	    		                                       {fieldLabel: '角标预览',id : "angle" ,xtype: 'box', autoEl: {src:  "", tag: 'img', complete: 'off',id : "angle" ,width:72, height: 72}},
	    		                                       {xtype: 'textfield', id : "angleFile",width : '65', inputType: "file",
	     		                                    	listeners:{
	     		                                    		change : function (file,oldValue,newValue){
	           		                                          var el = Ext.getCmp("angleFile").getEl();
	           		                                          Ext.get("angle").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
	     		                                    		}  
	     		                                    	 } 
     		                                       },
                          		               ]
                 		                 }),
		                 		         buttons: [
		                 		                   {text:'保存',
				                                    handler : function(){
				                                     if(Ext.getCmp("a_product_type_group_id").isValid()){
				                                    	var product_type_group = Ext.getCmp("a_product_type_group_id").getValue();
				                                    	//游戏币、装备、代练
				                                    	if(product_type_group != 1 && product_type_group !=2 && product_type_group !=7){
				                                    		var channel_id = Ext.getCmp("a_channel_id").getValue();
				                                     		if(channel_id == "" || channel_id == 0 || channel_id == undefined){
				                                     			 utils.show_msg("除了<font color='red'>游戏币、装备、代练</font>  其他的一级分类都需要选择相应的渠道名称");
				                                     			 return;
				                                     		}
				                                    	}
				                                     }	
				                                   	 if(Ext.getCmp("a_product_type_name").isValid() && Ext.getCmp("a_product_type_group_id").isValid()
				                                   			 &&  Ext.getCmp("a_usable").isValid() && Ext.getCmp("a_default_discount").isValid() 
				                                   			 && Ext.getCmp("a_default_sub_channel").isValid() 
				                                   			 && Ext.getCmp("a_weight").isValid()
				                                   			 && Ext.getCmp("a_default_trade_mode").isValid()){
				                                   		
				                                   		     //商品二级名称值
				                                        	 var name = Ext.getCmp("a_product_type_name").getValue();
				                                        	 var channelId = Ext.getCmp("a_channel_id").getValue();
				                                        	 //是否可用
				                                        	 var usable = Ext.getCmp("a_usable").getValue();
				                                        	 //权重
				                                        	 var weight = Ext.getCmp("a_weight").getValue();
				                                        	 //一级分类id
				                                        	 var group_id = Ext.getCmp("a_product_type_group_id").getValue();
				                                        	 //默认折扣
				                                        	 var discount = Ext.getCmp("a_default_discount").getValue();
				                                        	 //默认子渠道
				                                        	 var channel = Ext.getCmp("a_default_sub_channel").getValue();
				                                        	 //默认交易模式
				                                        	 var default_trade_mode = Ext.getCmp("a_default_trade_mode").getValue();
				                                        	 
				                                        	 var form = new FormData();
				                                        	 //wap图片
				                                        	 var wapFile = Ext.getCmp("wapFile").getEl().dom.files[0];
				                                        	 if(wapFile != undefined && wapFile != ""){
				                                        		 form.append("wapFile", wapFile);
				                                        	 }
				                                        	 //web图片
				                                        	 var webFile = Ext.getCmp("webFile").getEl().dom.files[0];
				                                        	 if(webFile != undefined && webFile != ""){
				                                        		 form.append("webFile", webFile);
				                                        	 }
				                                        	 //角标图片
				                                        	 var angleFile = Ext.getCmp("angleFile").getEl().dom.files[0];
				                                        	 if(angleFile != undefined && angleFile != ""){
				                                        		 form.append("angleFile", angleFile);
				                                        	 }
					                                         //存放上传本地文件控件或者服务器图片URL
				           					            	 form.append("name", name);
				           					            	 form.append("channel_id",channelId);
				           					            	 form.append("usable", usable);
				           					            	 form.append("weight", weight);
				           					            	 form.append("product_type_group_id", group_id);
				           					            	 form.append("default_discount", discount);
				           					            	 form.append("default_sub_channel", channel);
				           					            	 form.append("default_trade_mode", default_trade_mode);
				           					            	 
					                                         var xmlhttp = new XMLHttpRequest();
					                                         xmlhttp.open("POST", URLS.GET_ADD, true);
					                                         xmlhttp.onload = function(e){
					                                         var resp = Ext.util.JSON.decode(e.currentTarget.response);
					                                         	 if(resp.success){
					                                         	   utils.show_msg(resp.msg);
				                                 				   me.store.load({params: {start:0, limit: me.pageSize}});
				                                 				   addWin.close();
					                                             }else{
					                 	              				 utils.show_msg(resp.msg);
					                               			     }
					                                         };
					                                         xmlhttp.send(form);
					                                         function callback() {  
	      	      		                                    	    //接收响应数据  
	      	      		                                    	    //判断对象状态是否交互完成，如果为4则交互完成  
	      	      		                                    	     if(xmlhttp.readyState == 4) {  
	      	      		                                    	         //判断对象状态是否交互成功,如果成功则为200 ,如果 500则不成功
	      	      		                                    	        if(xmlhttp.status == 500) {  
	      	      		                                    	            //接收数据,得到服务器输出的纯文本数据  
	      	      		                                    	            utils.show_msg("修改失败,后台异常!");
	      	      		                                    	            return;
	      	      		                                    	        }  
	      	      		                                    	    }   
	      	      		                                    	 } 
				                                   	  }else{
				                                   		  utils.show_msg("信息校验不通过!请重新填写!");
				                                   	  }
				                                    }
		                 		            },
		                 		            {text: '取消', handler: function(){addWin.close();}
		                                 }]
                 		         });
                 		         }
                 		        addWin.show(this);
                       }
                    },
                    ' ', ' ', ' ',
                    {xtype: 'button', text: '删除',  width: 60, icon: 'static/libs/icons/delete.png', 
                        handler: function() {
                   		 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
                   		 if(sels && sels.length == 1){
                   			 Ext.MessageBox.confirm('删除选择框', '确定要删除？', function(btn) {  
                   				    if(btn == 'yes'){
            				    		var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "删除中，请耐心等下哦..." });
            	        				myMask.show();
            	        				Ext.Ajax.request({
                                 		   url: URLS.GET_DELETE,
                                 		   params: {product_type_id:sels[0].data.product_type_id},
                                 		   success: function(resp,otps){
                                 			   myMask.hide();
                                 			   var obj = Ext.decode(resp.responseText);
                                 			   utils.show_msg(obj.msg);
                                 			   if(obj.success){
                                 				   me.store.load({params: {start:0, limit: me.pageSize}});
                                 			   }
                                 		   },
                                 		   failure : function(resp ,otps){
                                 			   myMask.hide();
                                 			   utils.show_msg("delete of failure");
                                 		   }
                                 		});
                   				    }
                   				}); 
                   		 }else{
                   			utils.show_msg("请选择一条记录删除");
                   		 }
                        }
                    },
                    {xtype: 'button', text: '修改',  width: 60, icon: 'static/libs/icons/application_edit.png', 
                        handler: function() {
                      		 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
                       		 var queryId = null;
                       		 if(sels && sels.length == 1){
                       			queryId = sels[0].id;
                       			Ext.Ajax.request({
                       	            url: URLS.GET_QUERY+"?queryId="+queryId,
                       	            params: {"queryId":queryId},
                       	            method : "POST",
                       	            success: function(resp, opts){
                       	             var obj = Ext.decode(resp.responseText);
                       	             var queryFlag = obj.queryFlag;
                       	             if(!queryFlag){
                       	            	 utils.show_msg(obj.msg);
                       	            	 return;
                       	             }
                       	             var updateObject = obj.updateObject;
                              			var editWin = null;
                              		         if(!editWin){
                              		        	editWin = new Ext.Window({//加载窗体
                              		                 layout:'fit',
                              		                 width:400,
                              		                 height:605,
                              		                 autoScroll:true,
                              		                 plain: true,
                              		                 items: new Ext.FormPanel({//加载form表单
                              		                 labelWidth: 95, // label settings
    		                          		               frame:true,
    		                          		               title: '编辑商品分类信息',
    		                          		               bodyStyle:'padding:5px 5px 0',
    		                          		               width: 350,
//    		                          		               defaults: {width: 230},
    		                          		               defaultType: 'textfield',
    		                          		               padding: "0px 10px 0px 0px",
    		                          		               items: [
    		                          		                       {fieldLabel: '商品分类ID', disabled : true, id : "u_product_type_id",name: 'u_product_type_id', value : updateObject.product_type_id},
    		                          		                       {fieldLabel: '名称', id : "u_product_type_name", name: 'u_product_type_name',value : updateObject.name, allowBlank:false},
    		                          		                       new Ext.form.ComboBox({
    		                          		                    	   fieldLabel:'渠道名称',id: 'u_channel_id',name: 'u_channel_name',
    		                          		                    	   displayField:'channel_name', valueField:'channel_id',  typeAhead: true,
   	     		                          						       mode: 'local', forceSelection: true, triggerAction: 'all',
   	     		                          						       allowBlank:true, emptyText:'选择渠道', width: 150,  selectOnFocus:true,
    		                          		                    	   store :  new Ext.data.JsonStore({
	     		                          							    	autoDestroy: true,url: URLS.GET_CHANNEL,
	     		                          							    	baseParams: {usable:1},root: 'data',
	     		                          							    	idProperty: 'channel_id',totalProperty: 'total_count',
	     		                          							    	fields:[ 
	     		                          							          {name: 'channel_id'},
	     		                          							          {name: 'channel_name'}
	     		                          							        ],
	     		                          							      listeners : {
	     		                          							        	load : function(){
	     		                          							        		Ext.getCmp("u_channel_id").setValue(updateObject.channel_id);
	     		                          							        	}
	     		                          							        }
	     		                          							     
	     		                          							    }),
	     		                          							    listeners: {
	                             		 		                            render: function(combo){
	                             		 		                                combo.store.load();
	                             		 		                            }
	                         		               					    },
	     		                          						   }),
	    		                          		                   {width:50,xtype: 'combo', mode: 'local', value:updateObject.usable,triggerAction: 'all',
	    			                                                forceSelection: true, editable:false, fieldLabel: '是否可用', name: 'title', id : "u_usable",
	    			                                                hiddenName:'u_usable', displayField:'name',valueField:'value',
    			                                                    store: new Ext.data.JsonStore({
    			                                                       fields : ['name', 'value'],
    			                                                       data   : [
    			                                                           {name : '是',   value: '1'},
    			                                                           {name : '否',  value: '0'},
    			                                                       ]
    			                                                     })
	    			                          		               },
	    			                          		               {fieldLabel: '权重', xtype : 'numberfield',name: 'u_weight',id : "u_weight",value : updateObject.weight,allowBlank:false, blankText:"请填入非空的数字"} ,
	    			                          		                new Ext.form.ComboBox({
	    			                          		                	fieldLabel:'一级分类',id: 'u_product_type_group_id',name: 'u_product_type_group_id',
	    			                          		                	displayField:'name', valueField:'product_type_group_id',typeAhead: true,
		    		                          						    mode: 'local', forceSelection: true, triggerAction: 'all',
		    		                          						    allowBlank:true, emptyText:'选择一级分类', width: 150, selectOnFocus:true,
	    			                          		                	store : new Ext.data.JsonStore({
	    		                          							    	autoDestroy: true,url: URLS.GET_GROUP,
	    		                          							    	baseParams: {usable:1},root: 'data',
	    		                          							    	idProperty: 'product_type_group_id',totalProperty: 'total_count',
	    		                          							    	fields:[ 
	    		                          							          {name: 'product_type_group_id'},
	    		                          							          {name: 'name'}
	    		                          							        ],
	    		                          							      listeners : {
	    		                          							        	load : function(){
	    		                          							        		Ext.getCmp("u_product_type_group_id").setValue(updateObject.product_type_group_id);
	    		                          							        	}
	    		                          							        }
	    		                          							     
	    		                          							    }),
	    		                          							   listeners: {
	                            		 		                            render: function(combo){
	                            		 		                                combo.store.load();
	                            		 		                            }
	                        		               					    },
	    		                          						   }),
	    		                          						  {fieldLabel: '默认折扣', xtype : 'numberfield', id : "u_default_discount", name: 'u_default_discount', value : updateObject.default_discount,allowBlank:false,blankText:"请填入非空的数字"},
	    	    		                          		          {fieldLabel: '默认子渠道', id : "u_default_sub_channel", name: 'u_default_sub_channel', value : updateObject.default_sub_channel,allowBlank:false },
		     	    		                          		      {width: 150, xtype: 'combo', mode:'local', triggerAction: 'all', forceSelection: true, editable:   true,
			    	    		        	                       allowBlank:false,fieldLabel:'默认交易模式', emptyText:'请选择交易模式',
			    	    		        	                       name:'u_default_trade_mode',id : "u_default_trade_mode",
			    	    		        	                       hiddenName:'title', displayField:'name',valueField: 'value',
			    	    		        	                       store : new Ext.data.JsonStore({
		          		                          		          		autoDestory : true,
		          		                          		          		url : URLS.GET_TRADE_MODE,
		          		                          		          		root : 'data',
		          		                          		          		idProperty : 'value',
		          		                          		          		fields: [
		          		                          		          		         {name : 'name'},
		          		                          		          		         {name : 'value'}
		          		                          		          		],
		          		                          		          	listeners :{
	                		               					    		load : function(s){
	                		               					    			Ext.getCmp("u_default_trade_mode").setValue(updateObject.default_trade_mode);
	                		               					    		}
	          		                          		          		}
		          		                          		          	}),
		                		               					    listeners: {
		                    		 		                            render: function(combo){
		                    		 		                                combo.store.load();
		                    		 		                            }
		                		               					    } 
			    		                          		        },      	    		                          		           
      	    		                          		           {fieldLabel: 'wap图标预览',id : "u_wap" , xtype: 'box', autoEl: {src:  updateObject.wap_icon_url,tag: 'img', complete: 'off',width:72,height:72}},
      	          		                                       {xtype: 'textfield', id : "u_wapFile", width : '65', inputType: "file",
      	           		                                    	listeners:{
      	           		                                    		change : function (file,oldValue,newValue){
      	 	           		                                          var el = Ext.getCmp("u_wapFile").getEl();
      	 	           		                                          Ext.get("u_wap").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
      	           		                                    		}  
      	           		                                    	 } 
      	           		                                       },
      	           		                                       {fieldLabel: 'web图标预览',id : "u_web" ,xtype: 'box', autoEl: {src:  updateObject.web_icon_url, tag: 'img', complete: 'off',width:72, height: 72}},
      	         		                                       {xtype: 'textfield',id : "u_webFile", width : '65',inputType: "file",
      	         		                                    	listeners:{
      	         		                                    		change : function (file,oldValue,newValue){
      	 	           		                                          var el = Ext.getCmp("u_webFile").getEl();
      	 	           		                                          Ext.get("u_web").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
      	         		                                    		}  
      	         		                                    	 } 
      	         		                                        },
      	         		                                       {fieldLabel: '角标预览',id : "u_angle" ,xtype: 'box', autoEl: {src:  updateObject.angle_icon_url, tag: 'img', complete: 'off' ,width:72, height: 72}},
      	          		                                       {xtype: 'textfield', id : "u_angleFile",width : '65',inputType: "file",
      	          		                                    	listeners:{
      	          		                                    		change : function (file,oldValue,newValue){
      	  	           		                                          var el = Ext.getCmp("u_angleFile").getEl();
      	  	           		                                          Ext.get("u_angle").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
      	          		                                    		}  
      	          		                                    	 } 
      	          		                                       },
    		                          		               ]
                              		                 }),
		                              		         buttons: [
		                              		                   {text:'保存',
				                                                handler : function(){
				                                                	 if(Ext.getCmp("u_product_type_group_id").isValid()){
				                                                     	var product_type_group = Ext.getCmp("u_product_type_group_id").getValue();
				                                                     	//游戏币、装备、代练
				                                                     	if(product_type_group != 1 && product_type_group !=2 && product_type_group !=7){
				                                                     		var channel_id = Ext.getCmp("u_channel_id").getValue();
				                                                     		if(channel_id == "" || channel_id == 0 || channel_id == undefined){
				                                                     			 utils.show_msg("除了<font color='red'>游戏币、装备、代练</font>  其他的一级分类都需要选择相应的渠道名称");
				                                                     			 return;
				                                                     		}
				                                                     	}
				                                                      }	
				                                                	  if(Ext.getCmp("u_product_type_name").isValid() && Ext.getCmp("u_product_type_group_id").isValid() 
				                                                			  && Ext.getCmp("u_usable").isValid() && Ext.getCmp("u_default_discount").isValid() 
				                                                			  && Ext.getCmp("u_default_sub_channel").isValid() 
				                                                			  && Ext.getCmp("u_weight").isValid()
				                                                			  //&& Ext.getCmp("u_default_trade_mode").isValid()
				                                                			  ){
				                                                		  
				                                                		 //商品二级分类id
				                                                     	 var id = Ext.getCmp("u_product_type_id").getValue();
				                                                     	 //商品二级名称值
				                                                     	 var name = Ext.getCmp("u_product_type_name").getValue();
				                                                     	 //渠道
				                                                     	 var channelId = Ext.getCmp("u_channel_id").getValue();
				                                                     	 //是否可用
				                                                    	 var usable = Ext.getCmp("u_usable").getValue();
				                                                     	 //权重
				                                                     	 var weight = Ext.getCmp("u_weight").getValue();
				                                                     	 //一级分类id
				                                                     	 var group_id = Ext.getCmp("u_product_type_group_id").getValue();
				                                                     	 //默认折扣
				                                                     	 var discount = Ext.getCmp("u_default_discount").getValue();
				                                                     	 //默认子渠道
				                                                     	 var channel = Ext.getCmp("u_default_sub_channel").getValue();
				                                                     	 //默认交易模式
				                                                     	 var default_trade_mode = Ext.getCmp("u_default_trade_mode").getValue();
				                                                     	 
				                                                     	 var form = new FormData();
					                                                   	 //wap图片
					                                                   	 var wapFile = Ext.getCmp("u_wapFile").getEl().dom.files[0];
					                                                   	 var wapSrc = Ext.get("u_wap").dom.src;
					                                                   	 if(wapFile != undefined && wapFile != ""){
					                                                   		 form.append("wapFile", wapFile);
					                                                   	 }
					                                                   	 if(wapSrc != undefined && wapSrc != "" ){
					                                                   		form.append("wapSrc", wapSrc);
					                                                   	 }
					                                                   	 
					                                                   	 //web图片
					                                                   	 var webFile = Ext.getCmp("u_webFile").getEl().dom.files[0];
					                                                   	 var webSrc = Ext.get("u_web").dom.src;
					                                                   	 if(webFile != undefined && webFile != ""){
					                                                   		 form.append("webFile", webFile);
					                                                   	 }
					                                                   	 if(webSrc != undefined && webSrc != ""){
					                                                   		 form.append("webSrc", webSrc);
					                                                   	 }
					                                                   	 
					                                                   	 //角标图片
					                                                   	 var angleFile = Ext.getCmp("u_angleFile").getEl().dom.files[0];
					                                                 	 var angleSrc = Ext.get("u_angle").dom.src;
					                                                   	 if(angleFile != undefined && angleFile != ""){
					                                                   		 form.append("angleFile", angleFile);
					                                                   	 }
					                                                   	 if(angleSrc != undefined && angleSrc != ""){
					                                                   		 form.append("angleSrc", angleSrc);
					                                                   	 }
					                                                   	 
					       		                                         //存放上传本地文件控件或者服务器图片URL
					       	           					            	 form.append("updateId", id);
					       	           					            	 form.append("name", name);
					       	           					            	 form.append("channel_id",channelId);
					       	           					            	 form.append("usable", usable);
					       	           					            	 form.append("weight", weight);
					       	           					            	 form.append("product_type_group_id", group_id);
					       	           					            	 form.append("default_discount", discount);
					       	           					            	 form.append("default_sub_channel", channel);
					       	           					                 form.append("default_trade_mode", default_trade_mode);
				       	           					            	 
				         		                                         var xmlhttp = new XMLHttpRequest();
				         		                                         xmlhttp.open("POST", URLS.GET_UPDATE, true);
				         		                                         xmlhttp.onload = function(e){
				         		                                         var resp = Ext.util.JSON.decode(e.currentTarget.response);
				         		                                         	 if(resp.success){
				         		                                         	   utils.show_msg(resp.msg);
				                                            				   me.store.load({params: {start:0, limit: me.pageSize}});
				                                            				   editWin.close();
				         		                                             }else{
				         		                 	              				 utils.show_msg(resp.msg);
				         		                               			     }
				         		                                         };
				         		                                         xmlhttp.send(form);
				                                              	  }else{
				                                              		  utils.show_msg("信息校验不通过!请重新填写!");
				                                              	  }
				                                                 }
		                              		             },
		                              		             {text: '取消', handler: function(){ editWin.close();} 
		                                              }]
                              		         });
                              		        }
                              		      editWin.show(this);
                       	            },
                       	            failure: function(resp, otps){
                       	            	utils.show_msg("修改失败!");
                       	            }
                       	        });
                       		 }
                       		 else{
                       			 utils.show_msg("请选择一条记录修改!");
                       		 }
                       	 }
                    }
                ]),
                listeners:  {
                    	afterrender : function(p){
                        	//按照顺序加载相应的store groupStore->tradModeStore->store, 保证商品类型列表渲染的时候相应的store已经加载完毕
                            me.load_store();
                        }
                }
            });
        },
        
        load_store : function(){
        	var me = this;
        	//商品一级分类store
        	this.groupStore.on("load", function(s){
        		//渠道store
        		me.channelStrore.on("load",function(){
        			//商品交易模式store
            		me.tradModeStore.on("load", function(){
            			//加载商品列表
            			me.load_data();
            		});
            		me.tradModeStore.load();
        		});
        		me.channelStrore.load();
        	});
        	this.groupStore.load();
        },
	    load_data : function(){
	    	this.store.load({params: {start:0, limit: this.pageSize}});
	    },
        
        viewConfig:{ 
        		forceFit:true 
        	} ,
        createColumn: function(me) {
            return [
                //new Ext.grid.RowNumberer,
                me.sm,
                {header: '商品分类ID', dataIndex: 'product_type_id', align: 'left', sortable: false, width: 60},
                {header: '名称', dataIndex: 'name', align: 'left', sortable: false, width: 100},
                {header: '渠道名称', dataIndex: 'channel_name', align: 'left', sortable: false, width: 100},
                {header: '是否可用', dataIndex: 'usable', align: 'left', sortable: false, width: 80, 
                	renderer: function(value){
                		if(value==1){
                			return '是';
                		}else{
                			return '否';
                		}
                	}
                },
                {header: '权重', dataIndex: 'weight', align: 'left', sortable: false, width: 80},
                {header: '一级分类', dataIndex: 'product_type_group_id', align: 'left', sortable: true, width: 100, 
                	renderer: function(value){
                        	return  me.groupStore.getById(value).get('name');
                	}
                },
                {header: '默认折扣', dataIndex: 'default_discount', align: 'left', sortable: false, width: 80},
                {header: '默认子渠道', dataIndex: 'default_sub_channel', align: 'left', sortable: false, width: 100},
                {header: '默认交易模式', dataIndex: 'default_trade_mode', align: 'left', sortable: false, width: 100,
                	renderer : function(value){
                	if(me.tradModeStore.getById(value) == undefined){
                		return value;
                	}
                	return me.tradModeStore.getById(value).get("name");
                }},  
                {header: '商品类型图标-wap', dataIndex: 'wap_icon_url', align: 'left', sortable: false, width: 100},
                {header: '商品类型图标-web', dataIndex: 'web_icon_url', align: 'left', sortable: false, width: 100},
                {header: '角标', dataIndex: 'angle_icon_url', align: 'left', sortable: false, width: 100},
            ];
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

define(function(require, exports, module) {
    var QUERY_URLS = {
        LIST: "adminZeroReceiveSubject/list", //获取列表url
        GET: "adminZeroReceiveSubject/get"//查询详情
    };
    var DELETE_URLS = {
    	GET: "adminZeroReceiveSubject/delete"//删除对象url
    };
    var SAVE_URLS = {
         UPDATE: "adminZeroReceiveSubject/update",//更新
         ADD: "adminZeroReceiveSubject/add",//新增
    };
    
    var isEnableStore = new Ext.data.SimpleStore({
        fields:['value','text'],
        data: [  
           [0,'否'],  
           [1,'是'] 
        ]  
    });
    
    var subjectTypeStore = new Ext.data.SimpleStore({
        fields:['value','text'],
        data: [  
           [1,'游戏ID'],  
           [2,'URL'] 
        ]  
    });
    
	var utils = require('../utils.js');
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
                {name: 'theme_id'},
                {name: 'subject_type'},
                {name: 'subject_value'},
                {name: 'subject_relate'},
                {name: 'subject_desc'},
                {name: 'subject_pic'},
                {name: 'is_enable'},
                {name: 'weight'},
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
    				 var subject_desc = Ext.getCmp('select_subject_desc').getValue();
			        //加载条件参数查询....
			        s.baseParams.is_enable = is_enable;
			        s.baseParams.subject_desc = subject_desc;
			        s.baseParams.theme_id = req_theme_id;
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
                {header: '类型', dataIndex: 'subject_type', align: 'left', sortable: false, width: 50, 
                	renderer: function(value){
	             	   var store = subjectTypeStore;
	             	   for(var i=0; i<store.data.items.length; i++) {
	             		   if(store.data.items[i].data.value==value) {
	             			   return store.data.items[i].data.text;
	             		   }
	             	   }
	             	   return '';
  		   			}
	            },
                {header: '游戏ID/URL', dataIndex: 'subject_value', align: 'left', sortable: false, width: 50},
                {header: '游戏名称', dataIndex: 'subject_relate', align: 'left', sortable: false, width: 80},
                {header: '一句话简介', dataIndex: 'subject_desc', align: 'left', sortable: false, width: 150},
                {header: '预览', dataIndex: 'subject_pic', align: 'left', sortable: false, width: 80, renderer : function(value, metaData, record, rowIndex, colIndex, store){
	            		if(null != value && undefined != value) {
	            			return '<a target="blank" href="'+ value +'">'+'<img style="width:auto;height:80px;" src="' + value + '" /></a>';
	            		}
	            		return "";
            		}
                },
                {header: '是否启用', dataIndex: 'is_enable', align: 'left', sortable: false, width: 30, 
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
                {header: '权重', dataIndex: 'weight', align: 'left', sortable: false,width: 50},
                {header: '创建时间', dataIndex: 'create_time', align: 'left', sortable: false,width: 70},
                {header: '更新时间', dataIndex: 'update_time', align: 'left', sortable: false,width: 70},
           ];
        },
      
        viewConfig : {
        	forceFit: true,
        },
        
        constructor: function() {
            var me = this;
            me.pageSize = 50; 
            me.isEnableStore = isEnableStore;
            me.subjectTypeStore = subjectTypeStore;
            me.store = createDataStore();
            me.sm = new Ext.grid.CheckboxSelectionModel();
            me.column = me.createColumn(me);
            Ext.QuickTips.init();
            Ext.form.Field.prototype.msgTarget='side';
            myPanel.superclass.constructor.call(this, {
                id: "tab:admin:subject_list",
                title: "游戏聚合记录列表",
                columns: me.column,
                layout: 'fit',
                loadMask: true,
                bbar: new Ext.PagingToolbar({store: this.store, pageSize: this.pageSize, displayInfo: true}),
                tbar: new Ext.Toolbar([
                  	'简介:',
                  	{xtype: 'textfield', width: 150,id: 'select_subject_desc',name: 'select_subject_desc',enableKeyEvents : true,
                  		listeners : {
                  			keydown : function(t, e){
                  				if(e.getKey() == e.ENTER){
                  					me.load_data();
                  				}
                  			}
                  		}
                  	},
                  	' ', ' ', ' ',
                  	'是否启用:',
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
                    	Ext.getCmp('zeroReceiveSubjectEditBtn').handler();
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
						 var subjectTypeStore = me.subjectTypeStore;
          		         if(undefined == win || null == win){
          		        	win = new Ext.Window({//加载窗体
          		                 layout:'fit',
          		                 width:500,
          		                 height:530,
          		                 plain: true,
          		                 id: 'zeroReceiveThemeAddWin',
          		                 items: new Ext.FormPanel({//加载form表单
          		                 labelWidth: 150, // label settings
                  		               frame:true,
                  		               title: '新增聚合记录信息',
                  		               bodyStyle:'padding:5px 5px 0',
                  		               defaultType: 'textfield',
                  		               items: [
											{xtype: 'combo',  name: 'add_subject_type', id : "add_subject_type", triggerAction:'all',forceSelection: true,
												editable: false, fieldLabel:"类型<font color='red'>*</font>", anchor : "98%",
												mode: 'local', displayField:'text', valueField:'value', store: subjectTypeStore, value:"1"},
											{xtype:"textfield", id:"add_subject_value",name:"add_subject_value",fieldLabel : "游戏ID/URL<font color='red'>*</font>", allowBlank:false,anchor : "98%"},
											{xtype:"textfield", id:"add_subject_desc",name:"add_subject_desc",fieldLabel : "一句话简介<font color='red'>*</font>", allowBlank:false,anchor : "98%"},
											{xtype: 'combo',  name: 'add_is_enable', id : "add_is_enable", triggerAction:'all',forceSelection: true,
										    	 editable: false, fieldLabel:"是否启用<font color='red'>*</font>", anchor : "98%",
										    	 mode: 'local', displayField:'text', valueField:'value', store: isEnableStore, value:"0"},
											{xtype: "numberfield", id:"add_weight",name:"add_weight",fieldLabel : "权重(值越小权重越高)", allowBlank:false, anchor : "98%"},
											{xtype: 'fieldset', height: 280, title : '图片',  labelWidth: 80,
												  items: [
														{xtype: 'compositefield', height: 30, 
															  items: [
															        {xtype:"radio", name:"pic_radio", id:"pic_radio_url", fieldLabel:"URL", anchor : "98%"},
															        {xtype:"textfield", name: 'add_subject_pic_input',id : "add_subject_pic_input", anchor : "98%", width:300}
															   ]
														},
														{xtype: 'compositefield', height: 180, 
															items: [
															        {xtype:"radio", name:"pic_radio", id:"pic_radio_upload", fieldLabel:"本地上传", anchor : "100%"},
															        {name: 'add_subject_pic',id : "add_subject_pic" ,xtype: 'box', autoEl: {src: "", tag: 'img', complete: 'off', height: 150}},
															        {xtype: 'textfield', id:"add_subject_pic_file", width : '65',inputType: "file",
															        	listeners:{
																        	change : function (file,oldValue,newValue){
																	        	var el = Ext.getCmp("add_subject_pic_file").getEl();
																	        	Ext.get("add_subject_pic").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
															        		}  
															        }},
													        ]
														}
												   ]
												},
                  		               ]
          		                 }),
		          		         buttons: [
	          		                   {text:'保存',
		                                 handler : function(){
	          		                	     var theme_id = req_theme_id;
	          		                	     var pic_url_checked = Ext.getCmp("pic_radio_url").checked;
	          		                	     var pic_upload_checked = Ext.getCmp("pic_radio_upload").checked;
	          		                	     if(!pic_url_checked && !pic_upload_checked) {
	          		                	    	utils.show_msg("信息校验不通过!请重新填写!");
	          		                	    	return;
	          		                	     }
	          		                	     
	          		                	     var win = Ext.getCmp('zeroReceiveThemeAddWin');
			                                 if(Ext.getCmp("add_subject_type").isValid() && Ext.getCmp("add_subject_value").isValid() && Ext.getCmp("add_subject_desc").isValid() && 
			                                		 Ext.getCmp("add_is_enable").isValid() && Ext.getCmp("add_weight").isValid()){
			                                	 
			                                	 var subject_type = Ext.getCmp("add_subject_type").getValue();
			                                	 var subject_value = Ext.getCmp("add_subject_value").getValue();
			                                	 var subject_desc = Ext.getCmp("add_subject_desc").getValue();
			                                	 var is_enable = Ext.getCmp("add_is_enable").getValue();
			                                	 var weight = Ext.getCmp("add_weight").getValue();
			                                	 
			                                	 var form = new FormData();
			                                	 form.append("theme_id", theme_id);
			                                	 form.append("subject_type", subject_type);
			                                	 form.append("subject_value", subject_value);
			                                	 form.append("subject_desc", subject_desc);
			                                	 form.append("is_enable", is_enable);
			                                	 form.append("weight", weight);
			                                	 
			                                	 //图片
			                                	 var picPath = "";
			                                	 if(pic_url_checked) {
			                                		 picPath = Ext.getCmp('add_subject_pic_input').getValue();
			                                		 form.append("pic_radio", 1);  //手动输入为1
			                                		 form.append("subject_pic_input", picPath);
			                                	 } else if(pic_upload_checked) {
			                                		 form.append("pic_radio", 2);  //本地上传为2
			                                		 picPath = Ext.getCmp('add_subject_pic_file').getEl().dom.value;
			                                		 if(1 != utils.validate_image_type(picPath, ["jpg","jpeg","png"])) {
			                                			 utils.show_msg("图片检验不通过，请检查图片名称、格式等");
			                                			 return;
			                                		 }
			                                		 var subject_pic_file = Ext.getCmp("add_subject_pic_file").getEl().dom.files[0];
			                                		 form.append("subject_pic_file", subject_pic_file);
			                                	 }
			                                	 if(picPath == "") {
			                                		 utils.show_msg("图片信息必填");
		          		                	    	 return;
			                                	 }
                                               	 
                                               	 var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "正在保存中，请耐心等待..." });
  	           					            	 myMask.show();
		                                         var xmlhttp = new XMLHttpRequest();
		                                         xmlhttp.open("POST", SAVE_URLS.ADD, true);
		                                         xmlhttp.onload = function(e){
		                                         var resp = Ext.util.JSON.decode(e.currentTarget.response);
		                                         	 myMask.hide();
		                                         	 if(resp.success){
		                                         		 win.close();
		                                         		 me.store.reload();
		                                             }else{
		                 	              				 utils.show_msg(resp.msg);
		                               			     }
		                                         };
		                                         xmlhttp.send(form);
		                                         function callback() {  
    		                                       	//接收响应数据  
    		                                   	    //判断对象状态是否交互完成，如果为4则交互完成 
    		                                   	     if(xmlhttp.readyState == 4) {  
    		                                   	    	myMask.hide();
    		                                   	         //判断对象状态是否交互成功,如果成功则为200 ,如果 500则不成功
    		                                   	        if(xmlhttp.status == 500) {  
    		                                   	            //接收数据,得到服务器输出的纯文本数据  
    		                                   	            utils.show_msg("后台出错");
    		                                   	            return;
    		                                   	        }  
    		                                   	    }   
    		                                   	 }
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
    		        {xtype : "button", text : "修改", id: 'zeroReceiveSubjectEditBtn', icon : "static/libs/icons/application_edit.png", 
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
                      	             var win = Ext.getCmp('zeroReceiveSubjectEditWin');
                    		         if(undefined == win || null == win){
                    		        	var isEnableStore = me.isEnableStore;
                    		        	var subjectTypeStore = me.subjectTypeStore;
                    		        	win = new Ext.Window({//加载窗体
                    		                 layout:'fit',
                    		                 width:500,
                      		                 height:560,
                    		                 plain: true,
                    		                 id: 'zeroReceiveSubjectEditWin',
                    		                 items: new Ext.FormPanel({//加载form表单
                    		                 labelWidth: 150, // label settings
                            		               frame:true,
                            		               title: '编辑聚合记录信息',
                            		               bodyStyle:'padding:5px 5px 0',
                            		               defaultType: 'textfield',
                            		               items: [
          		                                        {xtype:"textfield", id:"edit_id",name:"edit_id",fieldLabel : "ID",value:updateObject.id,disabled:true,anchor : "98%"},
          		                                        {xtype: 'combo',  name: 'edit_subject_type', id : "edit_subject_type", triggerAction:'all',forceSelection: true,
          													editable: false, fieldLabel:"类型<font color='red'>*</font>", anchor : "98%",
          													mode: 'local', displayField:'text', valueField:'value', store: subjectTypeStore, value:updateObject.subject_type},
      													{xtype:"textfield", id:"edit_subject_value",name:"edit_subject_value",fieldLabel : "游戏ID/URL<font color='red'>*</font>", allowBlank:false,anchor : "98%", value:updateObject.subject_value},
          		                                        {xtype:"textfield", id:"edit_subject_desc",name:"edit_subject_desc",fieldLabel : "一句话简介<font color='red'>*</font>", allowBlank:false,anchor : "98%", value:updateObject.subject_desc},
          								  	            {xtype: 'combo',  name: 'edit_is_enable', id : "edit_is_enable", triggerAction:'all',forceSelection: true,
          			                                           editable: false, fieldLabel:"是否启用<font color='red'>*</font>", anchor : "98%",
          			                                           mode: 'local', displayField:'text', valueField:'value', store: isEnableStore, value:updateObject.is_enable},
          												{xtype:"numberfield", id:"edit_weight",name:"edit_weight",fieldLabel : "权重(值越小权重越高)", allowBlank:true, anchor : "98%", value:updateObject.weight},
			  		                          		    {xtype: 'fieldset', height: 280, title : '图片',  labelWidth: 80,
			 												  items: [
			 														{xtype: 'compositefield', height: 30, 
			 															  items: [
			 															        {xtype:"radio", name:"edit_pic_radio", id:"edit_pic_radio_url", fieldLabel:"URL", anchor : "98%"},
			 															        {xtype:"textfield", name: 'edit_subject_pic_input',id : "edit_subject_pic_input", anchor : "98%", width:300}
			 															   ]
			 														},
			 														{xtype: 'compositefield', height: 180, 
			 															items: [
			 															        {xtype:"radio", name:"edit_pic_radio", id:"edit_pic_radio_upload", fieldLabel:"本地上传", anchor : "100%", checked: true},
			 															        {name: 'edit_subject_pic',id : "edit_subject_pic" ,xtype: 'box', autoEl: {src: updateObject.subject_pic, tag: 'img', complete: 'off', height: 150}},
			 															        {xtype: 'textfield', id:"edit_subject_pic_file", width : '65',inputType: "file",
			 															        	listeners:{
			 																        	change : function (file,oldValue,newValue){
			 																	        	var el = Ext.getCmp("edit_subject_pic_file").getEl();
			 																	        	Ext.get("edit_subject_pic").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
			 															        		}  
			 															        }},
			 													        ]
			 														}
			 												   ]
			 												},
                            		               ]
                    		                 }),
          		          		         buttons: [
          	          		                   {text:'保存',
          		                                 handler : function(){
		   	          		                	     var pic_url_checked = Ext.getCmp("edit_pic_radio_url").checked;
		   	          		                	     var pic_upload_checked = Ext.getCmp("edit_pic_radio_upload").checked;
		   	          		                	     if(!pic_url_checked && !pic_upload_checked) {
		   	          		                	    	utils.show_msg("信息校验不通过!请重新填写!");
		   	          		                	    	return;
		   	          		                	     }
		   	          		                	     var win = Ext.getCmp('zeroReceiveSubjectEditWin');
		   	          		                	     var id = Ext.getCmp("edit_id").getValue();
		   			                                 if(id != "" && id != undefined && id != null && Ext.getCmp("edit_subject_type").isValid() && Ext.getCmp("edit_subject_value").isValid() && 
		   			                                		 Ext.getCmp("edit_subject_desc").isValid() && Ext.getCmp("edit_is_enable").isValid() && Ext.getCmp("edit_weight").isValid()){
		   			                                	 
		   			                                	 var subject_type = Ext.getCmp("edit_subject_type").getValue();
		   			                                	 var subject_value = Ext.getCmp("edit_subject_value").getValue();
		   			                                	 var subject_desc = Ext.getCmp("edit_subject_desc").getValue();
		   			                                	 var is_enable = Ext.getCmp("edit_is_enable").getValue();
		   			                                	 var weight = Ext.getCmp("edit_weight").getValue();
		   			                                	 
		   			                                	 var form = new FormData();
		   			                                	 form.append("id", id);
		   			                                	 form.append("subject_type", subject_type);
		   			                                	 form.append("subject_value", subject_value);
		   			                                	 form.append("subject_desc", subject_desc);
		   			                                	 form.append("is_enable", is_enable);
		   			                                	 form.append("weight", weight);
		   			                                	 
		   			                                	 //图片
		   			                                	 var picPath = "";
		   			                                	 if(pic_url_checked) {
		   			                                		 picPath = Ext.getCmp('edit_subject_pic_input').getValue();
		   			                                		 form.append("pic_radio", 1);  //手动输入为1
		   			                                		 form.append("subject_pic_input", picPath);
		   			                                	 } else if(pic_upload_checked) {
		   			                                		 form.append("pic_radio", 2);  //本地上传为2
		   			                                		 var subject_pic_file = Ext.getCmp("edit_subject_pic_file").getEl().dom.files[0];
		   			                                		 if(subject_pic_file != undefined && subject_pic_file != "") {
		   			                                			 //替换过
		   			                                			 picPath = Ext.getCmp('edit_subject_pic_file').getEl().dom.value;
		   			                                			 if(1 != utils.validate_image_type(picPath, ["jpg","jpeg","png"])) {
		   			                                				 utils.show_msg("图片检验不通过，请检查图片名称、格式等");
		   			                                				 return;
		   			                                			 }
		   			                                			 form.append("subject_pic_file", subject_pic_file);
		   			                                		 } else {
		   			                                			 //用原图
		   			                                			 picPath = Ext.getCmp('edit_subject_pic').autoEl.src;
		   			                                			 form.append("subject_pic_src", picPath);
		   			                                		 }
		   			                                	 }
		   			                                	 if(picPath == "") {
		   			                                		 utils.show_msg("图片信息必填");
		   		          		                	    	 return;
		   			                                	 }
		                                                  	 
	                                                  	 var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "正在保存中，请耐心等待..." });
	     	           					            	 myMask.show();
		   		                                         var xmlhttp = new XMLHttpRequest();
		   		                                         xmlhttp.open("POST", SAVE_URLS.UPDATE, true);
		   		                                         xmlhttp.onload = function(e){
		   		                                         var resp = Ext.util.JSON.decode(e.currentTarget.response);
		   		                                         	 myMask.hide();
		   		                                         	 if(resp.success){
		   		                                         		 win.close();
		   		                                         		 me.store.reload();
		   		                                             }else{
		   		                 	              				 utils.show_msg(resp.msg);
		   		                               			     }
		   		                                         };
		   		                                         xmlhttp.send(form);
		   		                                         function callback() {  
		       		                                       	//接收响应数据  
		       		                                   	    //判断对象状态是否交互完成，如果为4则交互完成 
		       		                                   	     if(xmlhttp.readyState == 4) {  
		       		                                   	    	myMask.hide();
		       		                                   	         //判断对象状态是否交互成功,如果成功则为200 ,如果 500则不成功
		       		                                   	        if(xmlhttp.status == 500) {  
		       		                                   	            //接收数据,得到服务器输出的纯文本数据  
		       		                                   	            utils.show_msg("后台出错");
		       		                                   	            return;
		       		                                   	        }  
		       		                                   	    }   
		       		                                   	 }
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
                   	            	utils.show_msg("修改之前获取记录信息失败");
                   	            }
	                  		});
					}},
					' ', ' ', ' ',
    		        {xtype : "button", text : "删除", icon : "static/libs/icons/delete.png", 
    		        	handler : function(){
    		        		var sels = me.getSelectionModel().getSelections();// 获取选择的记录
		               		 if(sels && sels.length == 1){
		               			 Ext.MessageBox.confirm('删除记录', '确定要删除吗？', function(btn) {  
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

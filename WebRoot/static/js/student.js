define(function(require, exports, module) {
   var URLS = {
        LIST: "adminStudent/list", //获取列表url
        ADD:'adminStudent/add',    //添加数据 
        DELETE:'adminStudent/delete',//删除数据
        UPDATE:'adminStudent/update'//更新数据
    };
    var COLLEGE_URL = {
    	LIST:"adminCollege/list"  //获取学院url
    }
    
    var stateStore = new Ext.data.SimpleStore({
        fields:['value','text'],
        data: [  
           [0,'女'],  
           [1,'男'] 
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
            totalProperty: 'total',
            fields:[ 
                {name: 'id'},
                {name: 's_no'},
                {name: 's_name'},
                {name: 'sex'},
                {name: 'birth'},
                {name: 'admission_time'},
                {name: 'college_name'},
                {name: 'birth_place'},
                {name: 'phone_num'}
            ],
            listeners :{
    			beforeload : function(s){
    				//请求参数
			        s.baseParams.sno = Ext.getCmp('sno').getValue();
			        s.baseParams.sname = Ext.getCmp('sname').getValue();
			        s.baseParams.college_no = Ext.getCmp('college').getValue();
   			}
   		}
        });
    };
    
    var myPanel = Ext.extend(Ext.grid.EditorGridPanel,{
        createColumn: function(me) {
            return [
                me.sm,
                {header: 'ID', dataIndex: 'id', align: 'left', sortable: true, width: 90},
                {header: '学号', dataIndex: 's_no', align: 'left', sortable: true, width: 90},
                {header: '学生姓名', dataIndex: 's_name', align: 'left', sortable: false, width: 90},
                {header: '性别', dataIndex: 'sex', align: 'left', sortable: false, width: 90,
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
                {header: '出生年月', dataIndex: 'birth', align: 'left', sortable: false,width: 120},
                {header: '入学时间', dataIndex: 'admission_time', align: 'left', sortable: false,width: 120},
                {header: '学院', dataIndex: 'college_name', align: 'left', sortable: false, width: 120},
                {header: '籍贯', dataIndex: 'birth_place', align: 'left', sortable: false, width: 150},
                {header: '联系方式', dataIndex: 'phone_num', align: 'left', sortable: false, width: 120}
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
            me.collegeStore = createCollegeStore;
            me.store = createDataStore();
            me.sm = new Ext.grid.CheckboxSelectionModel();
            me.column = me.createColumn(me);
            Ext.QuickTips.init();
            Ext.form.Field.prototype.msgTarget='side';
            myPanel.superclass.constructor.call(this, {
                id: "student_panel",
                title: "学生信息管理",
                columns: me.column,
                layout: 'fit',
                loadMask: true,
                //底部翻页栏
                bbar: new Ext.PagingToolbar({store: this.store, pageSize: this.pageSize, displayInfo: true}),
                //头部参数栏
                tbar: new Ext.Toolbar([
                   '学号:',
                  	' ', ' ', ' ',
                  	{xtype: 'textfield', width: 120,id: 'sno',name: 'sno',enableKeyEvents : true,
                  		listeners : {
                  			keydown : function(t, e){
                  				if(e.getKey() == e.ENTER){
                  					me.load_data();
                  				}
                  			}
                  		}
                  	},
                  	'姓名:',
                  	' ', ' ', ' ',
                  	{xtype: 'textfield', width: 120,id: 'sname',name: 'sname',enableKeyEvents : true,
                  		listeners : {
                  			keydown : function(t, e){
                  				if(e.getKey() == e.ENTER){
                  					me.load_data();
                  				}
                  			}
                  		}
                  	},
                  	'学院:',
                  	' ', ' ', ' ',
                  	{xtype: 'combo', width: 120,id: 'college',name: 'college_name',editable: true,
                  		displayField: 'college_name',valueField: 'college_no',forceSelection: true,
                  		triggerAction: 'all',allowBlank:true, emptyText: '请选择...',store:me.collegeStore,
                  		mode:'local', enableKeyEvents : true, 
                  		listeners:{ //模糊匹配
	                    	 render: function(combo){
                                combo.store.load();
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
	                		     Ext.getCmp('sno').setValue(null);
	                		     Ext.getCmp('sname').setValue(null);
	                		     Ext.getCmp('college').setValue(null);
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
              		                 height:350,
              		                 plain: true,
              		                 items: new Ext.FormPanel({//加载form表单
              		                 labelWidth: 110, // label settings
                      		               frame:true,
                      		               title: '新增学生信息',
                      		               bodyStyle:'padding:5px 5px 0',
                      		               width: 350,
                      		               defaults: {width: 230},
                      		               defaultType: 'textfield',
                      		               items: [
                      		               		   {fieldLabel: '学号', id : "a_sno",name: 'sno',allowBlank:false},
                      		               		   {fieldLabel: '姓名', id : "a_sname",name: 'sname',allowBlank:false},
                      		               		   {xtype: 'combo', fieldLabel:'性别', width: 150,id: 'a_sex',name: 'sex',store:me.stateStore,
								                  		displayField: 'text',valueField: 'value',triggerAction: 'all', allowBlank:false,
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
								                   {fieldLabel: '出生年月',xtype:'datefield', id : "a_birth",name: 'birth',allowBlank:false,format: 'Y-m-d'},
								                   {fieldLabel: '入学时间',xtype:'datefield', id : "a_admission_time",name: 'admission_time',allowBlank:false,format: 'Y-m-d'},
	                      		                   {xtype: 'combo', fieldLabel: '学院',width: 120,id: 'a_college',name: 'college_name',
								              			displayField: 'college_name',valueField: 'college_no',
									              		editable: true,forceSelection: true,triggerAction: 'all',allowBlank:false, 
									              		emptyText: '请选择...',store:me.collegeStore,
									              		mode:'local', enableKeyEvents : true, 
									              		listeners:{  //模糊匹配
									                    	 render: function(combo){
									                            combo.store.load();
									                        }
										                  }
								                  	},
	                      		                   {fieldLabel: '籍贯',id : "a_birth_place", name: 'birth_place',allowBlank:false},
	                      		                   {fieldLabel: '联系方式',id : "a_phone_num", name: 'phone_num',allowBlank:false}
                      		                  ]
              		                 }),
              		         		buttons: [
              		                   {text:'保存',
		                                 handler : function(){
		                                  if(!Ext.getCmp("a_sno").isValid()
		                                	&& !Ext.getCmp("a_sname").isValid()
		                                	&& !Ext.getCmp("a_sex").isValid()
		                                	&& !Ext.getCmp("a_birth").isValid()
		                                	&& !Ext.getCmp("a_admission_time").isValid()
		                                	&& !Ext.getCmp("a_college").isValid()
		                                	&& !Ext.getCmp("a_birth_place").isValid()
		                                	&& !Ext.getCmp("a_phone_num").isValid()){
		                                		utils.show_msg("信息校验不通过!请重新填写!");
		                                		return false;
		                                	}
		                                	 var sno = Ext.getCmp("a_sno").getValue();
		                                	 var sname = Ext.getCmp("a_sname").getValue();
		                                	 var sex = Ext.getCmp("a_sex").getValue();
		                                	 var birth = Ext.getCmp("a_birth").getValue();
		                                	 var admission_time = Ext.getCmp("a_admission_time").getValue();
		                                	 var college_no = Ext.getCmp("a_college").getValue();
		                                	 var college_name = Ext.getCmp("a_college").getRawValue();
		                                	 var birth_place = Ext.getCmp("a_birth_place").getValue();
		                                	 var phone_num = Ext.getCmp("a_phone_num").getValue();
		                                	 
		                                	 Ext.Ajax.request({
		                                		   url: URLS.ADD,
                            			   		   params: {"s_no":sno,"s_name":sname,"sex":sex,"birth":birth,
                            			   		   			"admission_time":admission_time,"college_no":college_no,
		                                			   		"college_name":college_name,"birth_place":birth_place,"phone_num":phone_num},
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
                    {xtype: 'button', text: '修改',  width: 60, icon: 'static/libs/icons/application_edit.png', 
                         handler:  function(){
                        	 var addWin = null;
                        	 var sels = me.getSelectionModel().getSelections();
                        	 if(sels == undefined || sels.length < 1) {
                    			 utils.show_msg("请选择一条记录修改！"); 
                    			 return;
                    		 }
                    		 if(sels.length > 1){
                    		  	 utils.show_msg("每次只能修改一条记录！"); 
                    			 return;
                    		 }
                    		 var s_id = sels[0].data.id;
                    		 var s_sno = sels[0].data.s_no;
                    		 var s_sname = sels[0].data.s_name;
                    		 var s_sex = sels[0].data.sex;
                    		 var s_birth = sels[0].data.birth;
                    		 var s_admission_time = sels[0].data.admission_time;
                    		 var s_college_name = sels[0].data.college_name;
                    		 var s_birth_place = sels[0].data.birth_place;
                    		 var s_phone_num = sels[0].data.phone_num;
                    		
              		         if(!addWin){
              		        	addWin = new Ext.Window({//加载窗体
              		                 layout:'fit',
              		                 width:500,
              		                 height:350,
              		                 plain: true,
              		                 items: new Ext.FormPanel({//加载form表单
              		                 labelWidth: 110, // label settings
                      		               frame:true,
                      		               title: '修改学生信息',
                      		               bodyStyle:'padding:5px 5px 0',
                      		               width: 350,
                      		               defaults: {width: 230},
                      		               defaultType: 'textfield',
                      		               items: [
                      		               		   {fieldLabel: '学号', id : "u_sno",name: 'sno',allowBlank:false,value:s_sno},
                      		               		   {fieldLabel: '姓名', id : "u_sname",name: 'sname',allowBlank:false,value:s_sname},
                      		               		   {xtype: 'combo', fieldLabel:'性别', width: 150,id: 'u_sex',name: 'sex',
                      		               		   		store:me.stateStore,value:s_sex,displayField: 'text',
								                  		valueField: 'value',triggerAction: 'all', allowBlank:false,
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
								                   {fieldLabel: '出生年月',xtype:'datefield', id : "u_birth",name: 'birth',allowBlank:false,format: 'Y-m-d',value:s_birth},
								                   {fieldLabel: '入学时间',xtype:'datefield', id : "u_admission_time",name: 'admission_time',allowBlank:false,format: 'Y-m-d',value:s_admission_time},
	                      		                   {xtype: 'combo', fieldLabel: '学院',width: 120,id: 'u_college',name: 'college_name',
								              			displayField: 'college_name',valueField: 'college_no',value:s_college_name,
									              		editable: true,forceSelection: true,triggerAction: 'all',allowBlank:false, 
									              		emptyText: '请选择...',store:me.collegeStore,
									              		mode:'local', enableKeyEvents : true, 
									              		listeners:{  //模糊匹配
									                    	 render: function(combo){
									                            combo.store.load();
									                        }
										                  }
								                  	},
	                      		                   {fieldLabel: '籍贯',id : "u_birth_place", name: 'birth_place',allowBlank:false,value:s_birth_place},
	                      		                   {fieldLabel: '联系方式',id : "u_phone_num", name: 'phone_num',allowBlank:false,value:s_phone_num}
                      		                  ]
              		                 }),
              		         		buttons: [
              		                   {text:'保存',
		                                 handler : function(){
		                                  if(!Ext.getCmp("u_sno").isValid()
		                                	&& !Ext.getCmp("u_sname").isValid()
		                                	&& !Ext.getCmp("u_sex").isValid()
		                                	&& !Ext.getCmp("u_birth").isValid()
		                                	&& !Ext.getCmp("u_admission_time").isValid()
		                                	&& !Ext.getCmp("u_college").isValid()
		                                	&& !Ext.getCmp("u_birth_place").isValid()
		                                	&& !Ext.getCmp("u_phone_num").isValid()){
		                                		utils.show_msg("信息校验不通过!请重新填写!");
		                                		return false;
		                                	}
		                                	 var sno = Ext.getCmp("u_sno").getValue();
		                                	 var sname = Ext.getCmp("u_sname").getValue();
		                                	 var sex = Ext.getCmp("u_sex").getValue();
		                                	 var birth = Ext.getCmp("u_birth").getValue();
		                                	 var admission_time = Ext.getCmp("u_admission_time").getValue();
		                                	 var college_no = Ext.getCmp("u_college").getValue();
		                                	 var college_name = Ext.getCmp("u_college").getRawValue();
		                                	 var birth_place = Ext.getCmp("u_birth_place").getValue();
		                                	 var phone_num = Ext.getCmp("u_phone_num").getValue();
		                                	 
		                                	 Ext.Ajax.request({
		                                		   url: URLS.UPDATE,
                            			   		   params: {id:s_id,"s_no":sno,"s_name":sname,"sex":sex,"birth":birth,
                            			   		   			"admission_time":admission_time,"college_no":college_no,
		                                			   		"college_name":college_name,"birth_place":birth_place,"phone_num":phone_num},
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
                    {xtype: 'button', text: '删除',  width: 60, icon: 'static/libs/icons/delete.png', 
                    	 handler: function (){
                    		 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
                    		 if(sels == undefined || sels.length < 1) {
                    			 utils.show_msg("请选择一条记录删除"); 
                    			 return;
                    		 }
                    		 var idStr = [];
                    		 for(var i=0; i<sels.length; i++) {
                    			 idStr.push(sels[i].data.id);
                    		 }
                    		 var ids = idStr.join(",");
                			 Ext.MessageBox.confirm('删除选择框', '确定要删除？', function(btn) {  
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
    
     //学院下拉框数据源
    var createCollegeStore = new Ext.data.JsonStore({
        url:COLLEGE_URL.LIST,
        fields: ['college_no','college_name'],
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

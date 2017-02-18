define(function(require, exports){

    var utils = require("./utils.js");
    var fw = require("./../com/FormWindow.ui.js");
    
    var URLS = {
            GAME_GET : "adminGame/getTemplateGame", //游戏url
            GROUP_GET : "adminProductTypeGroup/getList", //一级分类url
            DELETE_GAME : "platformDetailsEdit/deleteGame",//删除游戏
            DELETE_TYPE_GROUP : "platformDetailsEdit/deleteTypeGroup",//删除一级分类
            SAVE_TYPE_GROUP : "platformDetailsEdit/saveTypeGroup",//保存游戏
            SAVE_GAME_TYPE_GROUP : "platformDetailsEdit/saveGameTypeGroup"//保存游戏一级你分类
            
        };
    
    var QuickSearch = function(config){
        var that = this;
        if(!config){
            config = {}; 
        }   
        var defaultConfig = Ext.apply({
            id: config.id || Ext.id(),
            fieldLabel: config.fieldLabel,
            name: config.name,
            minChars: 0,
            hiddenName: config.name,
            resizable : false,
            allowAddNewData: true,
            store: new Ext.data.Store({
                baseParams: config.baseParams,
                proxy: new Ext.data.HttpProxy({
                    method: 'POST',
                    url: config.url,
                }), 
                autoLoad: true,
                reader: new Ext.data.JsonReader({
                    root : 'data',
                    totalProperty: 'totalCount',
                    fields: Ext.data.Record.create([{name: config.id}, {name: config.name}]),
                }),
                listeners : {
                	load : function(s){
                		//设置初始值
                		if(config.initValues){
                			for(var i=0; i<config.initValues.length; ++i){
                    			var index = s.find(config.id, config.initValues[i]);
                    			var record = s.getAt(index);
                    			that.addRecord(record);
                			}
                			config.initValues = null;
                		}
                	},
                },
            }), 
            listeners :{
                  beforequery: function(qe){
                        delete qe.combo.lastQuery;
                        if("name" == config.name){
                        	if(Ext.getCmp('addTypeGroupAndGameWinId') == undefined){
                        		var items = Ext.getCmp('productTypeGroupPanel').store.data.items;
                        		var type_group = new Array();
                        		for(var i = 0 ; i < items.length ;i++){
                        			type_group[i] = items[i].data.product_type_group_id;
                        		}
                        		qe.combo.store.baseParams.type_group = type_group;
                        	}
                        }
                        if("game_name" == config.name){
                        		var items = Ext.getCmp('game_panel').store.data.items;
                        		var gameIds = new Array();
                        		for(var i = 0 ; i < items.length ;i++){
                        			gameIds[i] = items[i].data.game_id;
                        		}
                        		qe.combo.store.baseParams.gameIds = gameIds;
                        }
                    },
            },
            valueDelimiter: ',',
            mode: 'remote',
            displayField: config.name,
            valueField: config.id,
            displayFieldTpl: "{"+config.name+"}",
            forceSelection : true,
            allowQueryAll : true,
        }, config);
    
        QuickSearch.superclass.constructor.call(this, defaultConfig);
    }
	
    Ext.extend(QuickSearch, Ext.ux.form.SuperBoxSelectEx, {});

    var PlatformDeatilsEditPanel = Ext.extend(Ext.Panel, {
        __make_id: function(name){
            return this.id + ":" + name;
        },  
        __get_cmp: function(name){
            return Ext.getCmp(this.__make_id(name));
        },

        constructor: function(id){
            this.id = id;
            this.createGroupStore= this.createGroupStore();
            this.createNewGameStore = this.createNewGameStore();
            this.createGameGroupPanel = this.createGameGroupPanel();
            this.createUserGroupPanel = this.createUserGroupPanel();
            this.itemPanel = this.createItemPanel();
            PlatformDeatilsEditPanel.superclass.constructor.call(this, {
                id: id,
                layout: "border",
                title: "商品平台配置明细编辑",
                items: [
                        this.createUserGroupPanel,
                        this.createGameGroupPanel,
	                    new Ext.Panel({
	                      region: "east",
	                      layout: "fit",
	                      width: 550,
	                      border:false, 
	                      items: [this.itemPanel]
	                  }),
                   
                ]
            });
        },
        
        createUserGroupPanel: function(){
            var me = this;
            var store = new Ext.data.JsonStore({
                url: utils.build_url("adminProductPlatformDetails/getList"),
                fields: [
                    {name: "id"},
                    {name: 'seller_uid'},
                    {name: 'is_show'},
                ],
                root: "data",
                totalProperty: "total",
                listeners: {
                    beforeload: function(s){
                    	 var seller_uid = Ext.getCmp('sel_user_id').getValue();
     			        //加载条件参数查询....
     			        s.baseParams.seller_uid = seller_uid;
                    }
                }
            });
            var sm = new Ext.grid.CheckboxSelectionModel({
                listeners: {
                    rowselect: function(sm, rowIndex, r){
                        //更新itemPanel的数据
                        me.createGameGroupPanel.store.load();
                        me.itemPanel.store.removeAll(false);
                    }
                }
            });
            var pageSize = 100;
            var grid = new Ext.grid.EditorGridPanel({
                autoScroll : true,
                autoDestroy : true,
                trackMouseOver : true,
                region: "west",
                id : "user_panel",
                loadMask : true,
                width: 400,
                border: true,
                clicksToEdit: 1,
                stripeRows : true,
                view : new Ext.grid.GridView({
                    forceFit: true,
                    enableRowBody: true
                }),
                sm: sm,
                store: store,
                columns: [
                    sm,
                    {header: 'ID', dataIndex: 'id', align: 'left', sortable: true, width: 200,hidden:true},
                    {header: '卖家uid', dataIndex: 'seller_uid', align: 'left', sortable: true, width: 100},
                    {header: '显示的应用平台', dataIndex: 'is_show', align: 'left', sortable: false, width: 50, 
                    	renderer: function(value){
                    		switch(value){
    	                 		case 0: return "所有";
    	                 		case 1: return "pc端";
    	                 		case 2: return "app端";
    	                 		default:return "未知";
                    		}
                    		return value;
                    	}
                    },

                ],
                bbar: new Ext.PagingToolbar({
                    store : store,
                    pageSize : pageSize, 
                    displayInfo : true
                }),
                tbar: [
                    '-',
                    "用户UID：", {id: "sel_user_id", xtype: "textfield", width: 100},
                    {xtype: "button", text: "筛选", icon: "static/libs/icons/zoom.png", width: 80, handler: function(){
                        grid.store.load({params: {start: 0, limit: pageSize}});
                    }}
                ],
                listeners: {
                    render: function(p){
                        grid.store.load({params: {start: 0, limit: pageSize}});
                    },
                }
            });

            return grid;
        },
        
        createGameGroupPanel: function(){
            var me = this;
            var store = new Ext.data.JsonStore({
                url: utils.build_url("platformDetailsEdit/getList"),
                baseParams: {'is_show':is_show,'seller_uid':seller_uid},
                fields: [
                    {name: "id"},
                    {name: "game_id"},
                ],
                root: "data",
                totalProperty: "total",
                listeners: {
                    beforeload: function(s){
                    	
                    	var items = Ext.getCmp('user_panel').getSelectionModel().selections.items[0];
                    	if(items != undefined){
                    		var seller_uid = Ext.getCmp('user_panel').getSelectionModel().selections.items[0].data.seller_uid;
                    		var is_show = Ext.getCmp('user_panel').getSelectionModel().selections.items[0].data.is_show;
                    		s.baseParams.seller_uid = seller_uid;
                    		s.baseParams.is_show = is_show;
                    	}
                    }
                }
            });
            var sm = new Ext.grid.CheckboxSelectionModel({
                listeners: {
                    rowselect: function(sm, rowIndex, r){
                        //更新itemPanel的数据
                        me.itemPanel.store.load();
                    }
                }
            });
            var pageSize = 100;
            var grid = new Ext.grid.EditorGridPanel({
                autoScroll : true,
                autoDestroy : true,
                trackMouseOver : true,
                region: "center",
                id : "game_panel",
                loadMask : true,
                width: 400,
                border: true,
                clicksToEdit: 1,
                stripeRows : true,
                view : new Ext.grid.GridView({
                    forceFit: true,
                    enableRowBody: true
                }),
                sm: sm,
                store: store,
                columns: [
                    sm,
                    {header:"ID", dataIndex:"id", align:"center", width:10,hidden: true},
                    {header:"游戏", dataIndex:"game_id", align:"center", width:400,
                    	renderer: function(value){
                    		var result = "";
                    			if(me.createNewGameStore.getById(value) == undefined){
                    				result = '未知游戏ID【'+value+'】名称';
                        		}else{
                        			result = me.createNewGameStore.getById(value).get('game_name');
                        		}
                    		return result;
                	 }
                    },
                ],
                bbar: new Ext.PagingToolbar({
                    store : store,
                    pageSize : pageSize, 
                    displayInfo : true
                }),
                tbar: [
                    {xtype: "button", text: "新增游戏", icon: "static/libs/icons/add.png", width: 80, handler: function(){
                   	 
                    	 var selectUser = Ext.getCmp('user_panel').getSelectionModel().selections.items[0];
                    	 if(selectUser == undefined){
                    		utils.show_msg('请选用户再新增游戏哦!')
                    		return false;
                    	 }
                     	 var addTypeGroupAndGameWin = null;
           		         if(!addTypeGroupAndGameWin){
           		        	addTypeGroupAndGameWin = new Ext.Window({//加载窗体
           		                  layout:'fit',
           		                  width:900,
           		                  height:450,
           		                  plain: true,
           		                  id:'addTypeGroupAndGameWinId',
           		                  items: new Ext.FormPanel({//加载form表单
               		              frame:true,
               		              title: '添加游戏',
               		              bodyStyle:'padding:0px 0px 0',
               		              width: 900,
               		              height:450,
               		              defaultType: 'textfield',
               		              items: [
											{xtype : "compositefield", id : "type_group_name_title", fieldLabel : "", 
												items : [
												    {xtype : "displayfield", value : "游戏名称<font color = red >*</font>:"},
												    new QuickSearch({fieldLabel: "", name: "game_name",id : "game_id", url : utils.build_url("adminGame/getTemplateGame"), width: 250, height : 300, }),
												    {xtype : "displayfield", value : "一级分类<font color = red >*</font>:"},
												    new QuickSearch({fieldLabel: "", name: "name",id : "product_type_group_id", url : utils.build_url("adminProductTypeGroup/getList"), width: 250,height : 300, }),
											    ]
											},
               		               ]
           		                 }) ,
           		         buttons: [
           		                   {
           		                	  text:'保存',
		                              handler : function(){
		                            	 if(Ext.getCmp("game_id").getValue() == ""){
		                            		 	utils.show_msg("请选择游戏!");
		                            		 	return;
	  	                            	 }
	  	                            	 if(Ext.getCmp("product_type_group_id").getValue() == ""){
	                            		 		utils.show_msg("请选择一级分类!");
	                            		 		return;
	  	                            	 }
		                             	 //获取名称值
		                            	  var game_ids = Ext.getCmp("game_id").getValue();
		                            	  var product_type_group = Ext.getCmp("product_type_group_id").getValue();
		                            	  var seller_uid = Ext.getCmp('user_panel').getSelectionModel().selections.items[0].data.seller_uid;
		                          		  var is_show = Ext.getCmp('user_panel').getSelectionModel().selections.items[0].data.is_show;
		                             	  Ext.Ajax.request({
		                             		   url: URLS.SAVE_GAME_TYPE_GROUP,
		                             		   params: {"product_type_group":product_type_group,"game_ids":game_ids,"seller_uid":seller_uid,"is_show":is_show},
		                             		   success: function(resp,otps){
		                             			   var obj = Ext.decode(resp.responseText);
		                         				   utils.show_msg(obj.msg);
		                         				   me.createGameGroupPanel.store.load();
		                         				   addTypeGroupAndGameWin.close();
		                             		   },
		                             		   failure : function(resp ,otps){
		                             			   utils.show_msg("新增游戏和一级分类失败!");
		                             		   }
		                             		});
		                              }
           		         		},
           		         		{text: '取消', handler: function(){ addTypeGroupAndGameWin.close();}
                           }]
           		          });
           		         }
           		      addTypeGroupAndGameWin.show(this);
                    }},
                    '-',
                    {xtype: "button", text: "删除游戏", icon: "static/libs/icons/delete.png", width: 80, handler: function(){
                    	var items = Ext.getCmp('user_panel').getSelectionModel().selections.items[0];
                    	if(items == undefined){
                    		utils.show_msg("请选择用户UID再删除游戏!");
                    		return false;
                    		
                    	}
                		var seller_uid = Ext.getCmp('user_panel').getSelectionModel().selections.items[0].data.seller_uid;
                		var is_show = Ext.getCmp('user_panel').getSelectionModel().selections.items[0].data.is_show;
                    	
                    	var sels = me.createGameGroupPanel.getSelectionModel().getSelections();// 获取选择的记录
                  		 if(sels != undefined && sels.length > 0){
                  			 Ext.MessageBox.confirm('删除选择框', '删除游戏级会把当前游戏下的所有一级分类删除!确定删除？', function(btn) {  
                  				    if(btn == 'yes'){
                  				    	var gameIds = new Array();
                  				    	for(var i = 0 ; i < sels.length ; i++){
                  				    		gameIds[i] = sels[i].data.game_id;
                  				    	}
              				    		var data = {'gameIds':gameIds, 'seller_uid':seller_uid,'is_show':is_show};
	           				    		var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "删除中，请耐心等待..." });
	           	        				myMask.show();
	           	            			utils.http_request(URLS.DELETE_GAME, data, function(json){
	           	            				//完成请求后重新去除蒙板
	           								myMask.hide();
	           								utils.show_msg(json.msg);
	           								grid.store.load({params: {start: 0, limit: pageSize}});
	           	            			});
                  				    }
                  				}); 
                  		 }else{
                  			utils.show_msg("请选择一条记录删除");
                  		 }
                    }}
                ],
            });
            grid.load_data = function(){
            	grid.store.load({params: {start: 0, limit: pageSize}});
            }
            return grid;
        },

        createItemPanel: function(){
            var me = this;
            var store = new Ext.data.JsonStore({
                url: utils.build_url("platformDetailsEdit/getProductTypeGroupByGame"),
                fields: [
                    {name: "id"},
                    {name: "product_type_group_id"},
                   
                ],
                root: "data",
                listeners: {
                    beforeload: function(s){
                    	var game_id = Ext.getCmp('game_panel').getSelectionModel().selections.items[0].data.game_id;
                    	var seller_uid = Ext.getCmp('user_panel').getSelectionModel().selections.items[0].data.seller_uid;
                		var is_show = Ext.getCmp('user_panel').getSelectionModel().selections.items[0].data.is_show;
                    	s.baseParams.game_id = game_id;
                        s.baseParams.seller_uid = seller_uid;
                        s.baseParams.is_show = is_show;
                    }
                }
            });
            var sm = new Ext.grid.CheckboxSelectionModel();
            var grid = new Ext.grid.EditorGridPanel({
                border:false,
                layout: "fit",
                sm: sm,
                region: "east",
                id : "productTypeGroupPanel",
                loadMask: true,
                trackMouseOver : true,
                clicksToEdit: 1,
                stripeRows : true,
                store: store,
                view : new Ext.grid.GridView({
                    forceFit: true,
                    enableRowBody: true
                }),
                columns: [
                    sm,
                    {header:"一级分类", dataIndex:"product_type_group_id", align:"center", width:100, 
                    	renderer: function(value){
                    		var result = "";
                    			if(me.createGroupStore.getById(value) == undefined){
                    				result = '未知一级分类ID【'+value+'】名称';
                        		}else{
                        			result = me.createGroupStore.getById(value).get('name');
                        		}
                    		return result;
                	 }},
                    {header: '操作', align: 'left', sortable: false, width: 100, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	var items = Ext.getCmp('game_panel').getSelectionModel().selections.items[0];
                    	if(items == undefined){
                    		utils.show_msg("请选择游戏再删除一级分类!");
                    		return false;
                    		
                    	}
                    	var game_id = items.data.game_id;
                    	var seller_uid = Ext.getCmp('user_panel').getSelectionModel().selections.items[0].data.seller_uid;
                		var is_show = Ext.getCmp('user_panel').getSelectionModel().selections.items[0].data.is_show;
                    	var OpLogId = utils.createGridBtn({
                            text : "删除",
                            icon : "static/libs/icons/delete.png",
                            width : 80,
                            handler : function(){
                            	 Ext.MessageBox.confirm('删除选择框', '确定删除？', function(btn) {  
                   				    if(btn == 'yes'){
               				    		var data = {'is_show':is_show, 'seller_uid':seller_uid,'product_type_group_id':record.data.product_type_group_id,'game_id':game_id};
 	           	            			utils.http_request(URLS.DELETE_TYPE_GROUP, data, function(json){
 	           	            				//完成请求后重新去除蒙板
 	           								utils.show_msg(json.msg);
 	           								grid.store.load();
 	           	            			});
                   				    }
                   				}); 
                            }
                        });
                    	return '<div style="width:100px;float:left;"><span id="' + OpLogId + '" /></div>';
                    }},
                ],
                tbar: [
                       '-',
                       {xtype: "button", text: "添加一级分类", icon: "static/libs/icons/add.png", width: 80, handler: function(){
                    	 var selectUser = Ext.getCmp('user_panel').getSelectionModel().selections.items[0];
                      	 if(selectUser == undefined){
                      		utils.show_msg('请选用户再新增一级分类哦!')
                      		return false;
                      	 }
                    	 var selectGame = Ext.getCmp('game_panel').getSelectionModel().selections.items[0];
                      	 if(selectGame == undefined){
                      		utils.show_msg('请选游戏再新增一级分类哦!')
                      		return false;
                      	 }
                      	 var addWin = null;
            		         if(!addWin){
            		        	addWin = new Ext.Window({//加载窗体
            		                  layout:'fit',
            		                  width:500,
            		                  height:300,
            		                  plain: true,
            		                  items: new Ext.FormPanel({//加载form表单
            		                  labelWidth: 100, // label settings
                		               frame:true,
                		               title: '添加一级分类',
                		               bodyStyle:'padding:5px 5px 0',
                		               width: 500,
                		               height:300,
                		               defaultType: 'textfield',
                		               items: [
											{xtype : "compositefield", id : "type_group_name_title", fieldLabel : "一级分类", 
												items : [
													new QuickSearch({fieldLabel: "", name: "name",id : "product_type_group_id", url : utils.build_url("adminProductTypeGroup/getList"), width: 250,height : 300, }),
											    ]
											},
                		               ]
            		                 }) ,
		            		         buttons: [{
		                               text:'保存',
		                               handler : function(){
		                              	 //获取名称值
		                              	 var product_type_group = Ext.getCmp("product_type_group_id").getValue();
		                              	 var game_id = Ext.getCmp('game_panel').getSelectionModel().selections.items[0].data.game_id;
		                            	 var seller_uid = Ext.getCmp('user_panel').getSelectionModel().selections.items[0].data.seller_uid;
		                        		 var is_show = Ext.getCmp('user_panel').getSelectionModel().selections.items[0].data.is_show;
		                              	 Ext.Ajax.request({
		                              		   url: URLS.SAVE_TYPE_GROUP,
		                              		   params: {"product_type_group":product_type_group,"game_id":game_id,"seller_uid":seller_uid,"is_show":is_show},
		                              		   success: function(resp,otps){
		                              			   var obj = Ext.decode(resp.responseText);
		                          				   utils.show_msg(obj.msg);
		                          				   grid.store.load();
		                          				   addWin.close();
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
                       }}
                   ],
                listeners: {
                	
                }
            });
            return grid;
        },
        //游戏store
        createNewGameStore : function(){
        	var me = this;
        	return new Ext.data.JsonStore({
        		autoLoad : true,
        		url : URLS.GAME_GET,
        		root : 'data',
        		idProperty : 'game_id',
        		totalProperty : 'total_count',
        		fields: [
        		         {name : 'game_id'},
        		         {name : 'game_name'}
        		],
        		listeners : {
        			load : function(s){
        				me.createGameGroupPanel.load_data();

        			}
        		}
        	});
        },
        //商品一级分类store
        createGroupStore : function(){
        	return new Ext.data.JsonStore({
        		autoDestory : true,
        		autoLoad : true,
        		url : URLS.GROUP_GET,
        		root : 'data',
        		idProperty : 'product_type_group_id',
        		totalProperty : 'total_count',
        		fields: [
        		         {name : 'product_type_group_id'},
        		         {name : 'name'}
        		]
        	});
        },
    });

    var viewPort = new Ext.Viewport({
        layout: 'fit',
        items: [{
            xtype: 'panel',
            items: [new PlatformDeatilsEditPanel()],
            layout: 'fit',
            region: 'center'
        }]
    });
    
    exports.PlatformDeatilsEditPanel = PlatformDeatilsEditPanel;
});


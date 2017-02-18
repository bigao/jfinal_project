define(function(require, exports, module) {
   
	var URLS = {
        GET: "adminProduct/getList",//获取列表url
        GROUP_GET : "adminProductTypeGroup/getList", //一级分类url
        PRODUCT_TYPE_GET : "adminProductType/getList", //二级分类url
        GAME_GET : "adminGame/getList", //游戏url
        CHANNEL_GET : "adminChannel/getList",//渠道url
        GAME_CHANNEL_GROUP_GET: "adminProduct/getGameChannelGroupList",//获取渠道组列表url
        GAME_PARTITION_GET: "adminProduct/getGamePartitionList",//获取游戏区服url
        QUERY_GET :"adminProduct/query",//查询url
        QUERY_ACCOUNT_GET : "adminProduct/queryAccount", //查询账号信息
        UPDATE_GET :"adminProduct/updateProduct",//更新url
        ON_GET :"adminProduct/onLine",//上架url
        OFF_GET :"adminProduct/offLine",//上架url
        ENABLE_ORDER_GET :"adminProduct/enableOrder",//可下单url
        UNABLE_ORDER_GET :"adminProduct/unableOrder",//不可下单url
        SHOW_GET :"adminProduct/setShowProduct",//显示商品url
        HIDE_GET :"adminProduct/setHideProduct",//不显示商品url
        EXPORT_GET :"adminProduct/exportProduct",// 导出数据url
        QUERY_IMAGET : "adminProduct/getProductImage",//查询商品数据url
        OFF_REARON : "adminDictionary/getItems",//获取字典配置的下架原因
        DELETE_GET :"adminProduct/deleteProduct",//不显示商品url
        EXECUTE_RECOMMEND_GET :"adminProduct/executeRecommendProduct",//批量推荐商品
        CANCEL_RECOMMEND_GET :"adminProduct/cancelRecommendProduct"//批量取消推荐商品
    };
  
    var utils = require('./utils.js');
    var fw = require('../com/FormWindow.ui.js');
    
    Ext.QuickTips.init();
    Ext.form.Field.prototype.msgTarget='side';

    //游戏store
    var createGameStore = function(){
    	return new Ext.data.JsonStore({
    		autoDestory : true,
    		//autoLoad : true,
    		url : URLS.GAME_GET,
    		root : 'data',
    		idProperty : 'game_id',
    		totalProperty : 'total_count',
    		fields: [{name : 'game_id'},  {name : 'game_name'}]
    	});
    	
    };
    //商品一级分类store
    var createGroupStore = function(){
    	return new Ext.data.JsonStore({
    		autoDestory : true,
    		//autoLoad : true,
    		url : URLS.GROUP_GET,
    		root : 'data',
    		idProperty : 'product_type_group_id',
    		totalProperty : 'total_count',
    		fields: [ {name : 'product_type_group_id'},{name : 'name'}]
    	});
    	
    };
    //商品二级分类store
    var createProductTypeStore = function(){
    	return new Ext.data.JsonStore({
    		autoDestory : true,
    		url : URLS.PRODUCT_TYPE_GET,
    		root : 'data',
    		idProperty : 'product_type_id',
    		totalProperty : 'total_count',
    		fields: [{name : 'product_type_id'}, {name : 'name'}]
    	});
    };
    //交易模式
    var createTradModeStore = function(){
    	return new Ext.data.JsonStore({
    		idProperty : "value",
            url : utils.build_url("commonHelper/readTradModeList"),
            fields : [{name : "name"},{name : "value"}],
            root : "data"
        });
    };
    
   //渠道
    var createChannelStore = function(){
    	return new Ext.data.JsonStore({
    		autoDestory : true,
    		//autoLoad : true,
    		url : URLS.CHANNEL_GET,
    		root : 'data',
    		idProperty : 'id',
    		totalProperty : 'total_count',
    		fields: [ {name : 'channel_id'},{name : 'channel_name'}]
    	});
    	
    };
    
    //商品store
    var createDataStore =  function(me) {
        return new Ext.data.JsonStore({
            autoDestroy: true,
            url: URLS.GET,
            baseParams: {start:0, limit: 50},
            root: 'data',
            idProperty: 'id',
            totalProperty: 'total_count',
            fields:[ 
                {name: 'id'},
                {name: 'product_id'},
                {name: 'product_group_id'},
                {name: 'trade_mode'},
                {name: 'product_type_group_id'},
                {name: 'product_group_name'},
                {name: 'single_number'},
                {name: 'stock'},
                {name: 'is_order'},
                {name : 'is_show'},
                {name: 'single_price'},
                {name: 'sell_price'},
                {name: 'sell_discount'},
//              {name: 'original_price'},
                {name: 'game_id'},
                {name: 'game_name'},
                {name: 'game_partition_name'},
                {name: 'status'},
                {name: 'seller_uid'},
                {name: 'onsale_time'},
                {name: 'offsale_time'},
                {name: 'create_time'},
                {name: 'sub_channel'},
                {name : 'channel_id'},
                {name : 'channel_name'},
                {name : 'publish_source'},
                {name : 'is_recommended'},
                {name : 'recommended_time'},
                {name : 'suid'},
                {name : 'sub_id'},
                {name : 'game_login_id'}
            ],
        	listeners :{
    			beforeload : function(s){
    				// 商品编号
			        var product_id = Ext.getCmp('product_id').getValue();
    				// 商品组编号
			        var product_group_id = Ext.getCmp('product_group_id').getValue();
			        // 卖家UID
			        var seller_uid = Ext.getCmp('seller_uid').getValue();
			        // 起创建时间
			        var date_from = Ext.getCmp('date_from').getValue();
			        // 始创建时间
			        var date_to = Ext.getCmp('date_to').getValue();
			        // 子渠道编号
			        var sub_channel = Ext.getCmp('sub_channel').getValue();
			        // 商品状态
			        var status = Ext.getCmp('status').getValue();
			        // 游戏
			        var game_id = Ext.getCmp('game_id').getValue();
			        // 游戏区服
			        var partition_id = Ext.getCmp('partition_id').getValue();
			        // 交易模式
			        var trade_mode = Ext.getCmp('trade_mode').getValue();
			        //商品一级分类
			        var product_type_group_id = Ext.getCmp('product_type_group_id').getValue();
			        //是否可下单
			        var is_order = Ext.getCmp('is_order').getValue();
			        //单价
			        var single_price_from = me.__get_cmp("single_price_from").getValue();
			        var single_price_to = me.__get_cmp("single_price_to").getValue();
			        //渠道
			        var channel_id = Ext.getCmp('channel_id').getValue();
			        var is_recommended = Ext.getCmp('is_recommended').getValue();
			        //账号
			        var game_login_id = Ext.getCmp('game_login_id').getValue();
			        //加载条件参数查询....
			        s.baseParams.product_id = product_id;
			        s.baseParams.product_group_id = product_group_id;
          			s.baseParams.seller_uid = seller_uid;
          			s.baseParams.date_from  = date_from;
          			s.baseParams.date_to = date_to;
          			s.baseParams.sub_channel = sub_channel;
          			s.baseParams.status = status;
          			s.baseParams.game_id = game_id;
          			s.baseParams.partition_id = partition_id;
          			s.baseParams.trade_mode = trade_mode;
          			s.baseParams.product_type_group_id = product_type_group_id;
          			s.baseParams.is_order = is_order;
          			s.baseParams.single_price_from = single_price_from;
          			s.baseParams.single_price_to = single_price_to;
          			s.baseParams.channel_id = channel_id;
          			s.baseParams.is_recommended = is_recommended;
          			s.baseParams.game_login_id = game_login_id;
          			
    			}
        	}
        });
    };
   //渠道组store
    var createGameChannelGroupStore = function (){
    	return new Ext.data.JsonStore({
    		autoDestory : true,
    		autoLoad : true,
    		url : URLS.GAME_CHANNEL_GROUP_GET,
    		root : 'data',
    		idProperty : 'id',
    		totalProperty : 'total_count',
    		fields: [
		         {name : 'id'},
		         {name : 'name'}
    		]
    	});
    };
    // 游戏区服
    var createGamePartitionStore = function(){
    	return new Ext.data.JsonStore({
    		autoDestory : true,
    		//autoLoad : true,
    		url : URLS.GAME_PARTITION_GET,
    		root : 'data',
    		idProperty : 'partition_id',
    		totalProperty : 'total_count',
    		fields: [
		         {name : 'partition_id'},
		         {name : 'partition_name'}
    		]
    	});
    };
    var myPanel = Ext.extend(Ext.grid.EditorGridPanel, {
    	__make_id : function(name){
			return "admin_product_panel:" + name;
		},
		__get_cmp : function(name){
			var id = this.__make_id(name);
			return Ext.getCmp(id);
		},
        createColumn: function(me) {//创建列
            return [
                me.sm,
                {header: 'ID', dataIndex: 'id', align: 'left', sortable: true, width: 50,hidden:true},
                {header: '商品编号', dataIndex: 'product_id', align: 'left', sortable: true, width: 210},
                {header: '商品组编号', dataIndex: 'product_group_id', align: 'left', sortable: true, width: 210},
                {header: '交易模式', dataIndex: 'trade_mode', align: 'left', sortable: false, width: 100, renderer : function(value){
                	if(me.tradModeStore.getById(value) == undefined){
                		return value;
                	}
                	return me.tradModeStore.getById(value).get("name");
                 }},
                {header: '一级分类ID', dataIndex: 'product_type_group_id', align: 'left', sortable: true, width: 100,
                	renderer: function(value){
	            		if(me.groupStore.getById(value) == undefined){
	            			return value;
	            		}
	            		else{
	                    	return  me.groupStore.getById(value).get('name');
	                    }
            		}	
                },
                {header: '商品名称', dataIndex: 'product_group_name', align: 'left', sortable: true, width: 180},
                {header: '单价数量', dataIndex: 'single_number', align: 'left', sortable: false, width: 60},
                {header: '库存', dataIndex: 'stock', align: 'left', sortable: true, width: 50},
                {header: '是否可下单', dataIndex: 'is_order', align: 'left', sortable: true, width: 80,
                  renderer: function(value){
                	  if(value == 1){
                		  return "是";
                	  }else{
                		  return "否";
                	  }
                  }	
                },
                {header: '是否推荐', dataIndex: 'is_recommended', align: 'left', sortable: true, width: 80,
                	renderer: function(value){
	                	if(value == 1){
	                		return '<font color="red">是</font>';
	                	}else{
	                		return "否";
	                	}
                	}
                },
                {header: '推荐时间', dataIndex: 'recommended_time', align: 'left', sortable: true,width: 140},
                {header: '是否可展示', dataIndex: 'is_show', align: 'left', sortable: true, width: 80,
                    renderer: function(value){
                  	  if(value == 1){
                  		  return "是";
                  	  }else{
                  		  return "否";
                  	  }
                    }	
                  },
                {header: '单价', dataIndex: 'single_price', align: 'left', sortable: true, width: 60},
                {header: '优惠售价', dataIndex: 'sell_price', align: 'left', sortable: true, width: 60},
                {header: '优惠折扣', dataIndex: 'sell_discount', align: 'left', sortable: true, width: 60},
                {header: '游戏ID', dataIndex: 'game_id', align: 'left', sortable: false, width: 80},
                {header: '游戏', dataIndex: 'game_name', align: 'left', sortable: false, width: 80},
                {header: '渠道', dataIndex: 'channel_name', align: 'left', sortable: false, width: 80},
                {header: '区/服', dataIndex: 'game_partition_name', align: 'left', sortable: false, width: 150},
                {header: '商品状态', dataIndex: 'status', align: 'left', sortable: false, width: 80, renderer: function(value){
                	return utils.get_product_status_name(value);
                }},
                {header: '发布来源', dataIndex: 'publish_source', align: 'left', sortable: true, width: 100},
                {header: '卖家UID', dataIndex: 'seller_uid', align: 'left', sortable: true, width: 80},
                {header: '上架时间', dataIndex: 'onsale_time', align: 'left', sortable: true,width: 140},
                {header: '下架时间', dataIndex: 'offsale_time', align: 'left', sortable: true, width: 140},
                {header: '创建时间', dataIndex: 'create_time', align: 'left', sortable: true, width: 140},
                {header: '子渠道', dataIndex: 'sub_channel', align: 'left', sortable: false, width: 100},
                {header: '水煮suid', dataIndex: 'suid', align: 'left', sortable: false, width: 100},
                {header: '子游戏ID', dataIndex: 'sub_id', align: 'left', sortable: false, width: 100},
                {header: '账号', dataIndex: 'game_login_id', align: 'left', sortable: false, width: 100},
                {header: '商品日志', align: 'left', dataIndex: 'product_id',sortable: false, width: 100, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                	var OpLogId = utils.createGridBtn({
                        text : "商品日志",
                        icon : "static/libs/icons/application_form_magnify.png",
                        width : 80,
                        handler : function(){
                        	var link = prefix_path+"adminProductlog?link_product_id="+value;
                    		var node = {
                    			"attributes":{ "url":link}, 
                    			"checked":false,
                    			"iconCls":"",
                    			"state":"closed",
                    			"text":"商品日志"+value 
                    		}
//                    		window.open(link, "_blank");
//                    		parent.addTab(node);
                    		parent.postMessage(node, '*');
                        }
                    });
                	return '<div style="width:100px;float:left;"><span id="' + OpLogId + '" /></div>';
                }}
            ];
        },
        listeners: {
        	rowdblclick: function(grid, rowIndex, e){
        		var record = grid.store.getAt(rowIndex);
                // 商品详细信息
                var productDetailWin = null;
  	             if(!productDetailWin){
  	            	productDetailWin = new Ext.Window({
  	            		 width:600,
 		                 height:600,
 		                 autoScroll:true,
 		                 plain: true,
 		                 title : '商品详细信息',
 		                 items : [
									new Ext.form.FormPanel({
										   labelWidth: 80, 
      		               	               title: '【游戏信息】',
              		               	       id : "detailGamePanelId",
              		               	       height:80,
              		               	       layout:"form",
              		               	       frame:true,
              		               	       labelAlign:"right",
              		               	       items:[{
              		               	    	   layout : "column",
              		               	    	   items : [
	      		               	    	            {columnWidth : .5, layout : "form",items : [{xtype:"textfield",disabled : true, fieldLabel : "游戏",anchor : "96%", value : record.data.game_name, id:"d_game_id" }] },
	      		               	    	            {columnWidth : .5, layout : "form", items : [{xtype:"textfield", disabled : true,fieldLabel : "分区",anchor : "96%", value : record.data.game_partition_name, id:"d_partition_id"}] }
              		               	    	   ]
              		               	       }]
									}),
									new Ext.form.FormPanel({
	   		               	               frame:true,
	   		               	               labelWidth: 80, 
	   		               	               title: '【商品信息】',
	   		               	               id : "detailProductPanelId",
	   		               	               height:290,
	   		               	               layout:"form",
	   		               	               frame:true,
	   		               	               labelAlign:"right",
	   		               	               items:[{
	   		               	            	   layout : "column",
	   		               	            	   items : [
	    		               	    	            {columnWidth : .5, layout : "form",items : [{xtype:"textfield", disabled : true,fieldLabel : "商品编号",anchor : "96%", value : record.data.product_id, id:"d_product_id" }] },
	    		               	    	            {columnWidth : .5, layout : "form", items : [{xtype:"textfield", disabled : true,fieldLabel : "商品状态",anchor : "96%", value : '', id:"d_product_status_id",
	    		               	    	            	listeners: {
				               	    	            		beforerender : function(){
						               	    	            	var status = ""; 
						               	    	            	status = record.data.status;
						               	                 		Ext.getCmp('d_product_status_id').setValue(utils.get_product_status_name(status));
				               	    	            	   }
					               	                 	}				               	    	            	
					               	    	        }]},
	    		               	    	            {columnWidth : .5, layout : "form",items : [{xtype:"textfield", disabled : true,fieldLabel : "商品名称",anchor : "96%", value : record.data.product_group_name, id:"d_product_name_id" }] },
	    		               	    	            {columnWidth : .5, layout : "form", items : [{xtype:"textfield", disabled : true,fieldLabel : "单价",anchor : "96%", value : (record.data.single_price == 0 ? "0元" : record.data.single_price+"元"), id:"d_single_price_id"}] },
	    		               	    	            {columnWidth : .5, layout : "form",items : [{xtype:"textfield",disabled : true, fieldLabel : "单件数量",anchor : "96%", value : (record.data.single_number == 0 ? "0件" : record.data.single_number +"件"), id:"d_single_number_id" }] },
	    		               	    	            {columnWidth : .5, layout : "form", items : [{xtype:"textfield",disabled : true, fieldLabel : "原价",anchor : "96%", value : (record.json.original_price == 0 ? "0元":record.json.original_price+"元"), id:"d_original_price_id"}] },
	    		               	    	            {columnWidth : .5, layout : "form",items : [{xtype:"textfield", disabled : true,fieldLabel : "库存",anchor : "96%", value : (record.data.stock == 0 ? "0件" :record.data.stock+"件"), id:"d_stock_id" }] },
	    		               	    	            {columnWidth : .5, layout : "form", items : [{xtype:"textfield", disabled : true,fieldLabel : "已卖件数 ",anchor : "96%", value : (record.json.soldout_number == "" ? "0件" : record.json.soldout_number+"件"), id:"d_soldout_number_id"}] },
	    		               	    	            {columnWidth : .5, layout : "form",items : [{xtype:"textfield", disabled : true,fieldLabel : "售卖模式",anchor : "96%", value : record.data.trade_mode, id:"d_trade_mode_id" ,
		    		               	    	         	listeners: {
				               	    	            		beforerender : function( ){
						               	    	            	var trade_mode = ""; 
						               	    	            	trade_mode = record.data.trade_mode;
						               	                 		Ext.getCmp('d_trade_mode_id').setValue(utils.get_trade_mode_name(trade_mode));
				               	    	            	   }
					               	                 	}				               	    	            	
					               	    	        }]},
	    		               	    	            {columnWidth : .5, layout : "form", items : [{xtype:"textfield",disabled : true, fieldLabel : "创建时间",anchor : "96%", value : record.data.create_time, id:"d_create_time_id"}] },
	    		               	    	            {columnWidth : .5, layout : "form",items : [{xtype:"textfield",disabled : true, fieldLabel : "修改时间",anchor : "96%", value : record.json.modify_time, id:"d_modify_time_id" }] },
	    		               	    	            {columnWidth : .5, layout : "form", items : [{xtype:"textfield", disabled : true,fieldLabel : "有效时间 ",anchor : "96%", value : record.json.validity, id:"d_validity_id"}] },
	    		               	    	            {columnWidth : .5, layout : "form",items : [{xtype:"textfield", disabled : true,fieldLabel : "最后成交时间",anchor : "96%", value : record.json.last_trans_time, id:"d_last_trans_time_id" }] },
	    		               	    	            {columnWidth : .5, layout : "form", items : [{xtype:"textfield",disabled : true, fieldLabel : "上架时间",anchor : "96%", value : record.data.onsale_time, id:"d_onsale_time_id"}] },
	    		               	    	            {columnWidth : .5, layout : "form", items : [{xtype:"textfield",disabled : true, fieldLabel : "下架时间",anchor : "96%", value : record.data.offsale_time, id:"d_offsale_time_id"}] },
	    		               	    	            {columnWidth : .5, layout : "form", items : [{xtype:"textfield", disabled : true,fieldLabel : "子渠道",anchor : "96%", value : record.data.sub_channel, id:"d_sub_channel_id"}] },
	    		               	    	            {columnWidth : .5, layout : "form", items : [{xtype:"textfield", disabled : true,fieldLabel : "发布来源",anchor : "96%", value : record.data.publish_source, id:"d_publish_source"}] }
	    		               	    	          ]
	   		               	                  } ]
									}),
									new Ext.form.FormPanel({
	   		               	               frame:true,
	   		               	               labelWidth: 80, 
	   		               	               title: '【卖家信息】',
	   		               	               id : "detailBuyerPanelId",
	   		               	               height:250,
	   		               	               layout:"form",
			               	               frame:true,
			               	               labelAlign:"right",
			               	               items:[{
				               	            	   layout : "column",
				               	            	   items : [
				               	    	            {columnWidth : .5, layout : "form",items : [{xtype:"textfield", disabled : true,fieldLabel : "卖家UID",anchor : "96%", value : record.data.seller_uid, id:"d_seller_uid_id" }] },
				               	    	            {columnWidth : .5, layout : "form",items : [{xtype:"textfield",  disabled : true,fieldLabel : "游戏角色ID",anchor : "96%", value : record.json.game_role_id, id:"d_game_role_id" }] },
				               	    	            {columnWidth : .5, layout : "form", items : [{xtype:"textfield", disabled : true, fieldLabel : "游戏角色名",anchor : "96%", value : record.json.game_role_name, id:"d_game_role_name_id"}] },
				               	    	            {columnWidth : .5, layout : "form", items : [{xtype:"textfield", disabled : true, fieldLabel : "卖家QQ",anchor : "96%", value : record.json.seller_qq, id:"d_seller_qq_id"}] },
				               	    	            {columnWidth : .5, layout : "form",items : [{xtype:"textfield",  disabled : true,fieldLabel : "游戏渠道",anchor : "96%", value : record.json.channel_name, id:"d_channel_name_id" }] },
				               	    	            {columnWidth : .5, layout : "form", items : [{xtype:"textfield", disabled : true, fieldLabel : "支持快速发货",anchor : "96%", value : '', id:"d_quick_deliver_flag_id",
				               	    	            	listeners: {
				               	    	            		beforerender : function( ){
						               	    	            	var quick_deliver = ""; 
						               	    	            	quick_deliver = record.json.quick_deliver_flag;
						               	                 		if(quick_deliver==1){
						               	                 			quick_deliver = '是';
						               	                 		}else if(quick_deliver==0){
						               	                 			quick_deliver =  '否';
						               	                 		}else{
						               	                 			quick_deliver = '未知';
						               	                 		}
						               	                 		Ext.getCmp('d_quick_deliver_flag_id').setValue(quick_deliver);
				               	    	                }
				               	                 	}				               	    	            	
				               	    	            
				               	    	            }] },
				               	    	            {columnWidth : .5, layout : "form",items : [{xtype:"textfield", disabled : true, fieldLabel : "卖家昵称",anchor : "96%", value : record.json.seller_nickname, id:"d_seller_nickname_id" }] },
				               	    	           
				               	    	            {columnWidth : .5, layout : "form", items : [
	                                                         {xtype : "button", text : "查看图片", fieldLabel : "商品图片",anchor : "96%", value : '', id:"showMe" , handler : function(){
	                                                        	
	                                                        	 if(record.data.product_type_group_id == 4 || record.data.product_type_group_id == 5 || record.data.product_type_group_id == 6){
	                                                        		 utils.show_msg('充值类商品此处无图片!');	
	                                                        		 return false;
	                                                        	 }
	                                                        	 
	                                                      	     var imageUrlArray = "";
	                                                        	 Ext.Ajax.request({
    	                      	                     	            url: URLS.QUERY_IMAGET,
    	                      	                     	            params: {"productGroupId":record.data.product_group_id},
    	                      	                     	            method : "POST",
    	                      	                     	            success: function(resp, opts){
    	                      	                     	            		var obj = Ext.decode(resp.responseText);
    	                      	                     	            		imageUrlArray = obj.imageArray;
       	    	                      	                     	          	if(imageUrlArray == "" && imageUrlArray.length == 0){
																				utils.show_msg('没有图片信息!可以新增图片再查看哦!');	
																				return false;
																			}
       	    	                      	                     	          	
           	    	                      	                     	       var imageWin = null;
           	    	                                           	             if(!imageWin){
           	    	                                           	              imageWin = new Ext.Window({
           	    	                                           	            		 width:300,
           	    	                                          		                 height:700,
           	    	                                          		                 plain: true,
           	    	                                          		                 title : '商品图片',
           	    	                                          		                 items : [
																							new Ext.form.FormPanel({
																								   labelWidth: 80, 
																							       id : "d_productImagelId",
																							       height:700,
																							       layout:"form",
																							       frame:true,
																							       labelAlign:"center",
																							       autoScroll: true,
																							       items : [{
																				                	  listeners: {
																				                		  "render" : function(){
																												var _panel = Ext.getCmp('d_productImagelId');
																												for(var i = 0 ; i < imageUrlArray.length;i++){
																													var button = new Ext.Button({
																														text: '预览大图',  width: 60, icon: 'static/libs/icons/zoom.png', id : 'mylogo'+i,
																														handler: function(e){
																															var mylogo = e.id;

																															var index = mylogo.charAt(mylogo.length - 1);
																															var myboxImage = Ext.getCmp("mybox"+index);
																															var imageSrc = myboxImage.autoEl.src;
																															  var bigImageWin = null;
												               	    	                                           	             if(!bigImageWin){
												               	    	                                           	           bigImageWin = new Ext.Window({
												               	    	                                           	            		 width: 750,
												               	    	                                          		                 height:750,
												               	    	                                          		                 plain: true,
												               	    	                                          		                 title : '大图片预览效果',
												               	    	                                          		                 items : [
												               	    	                                          		                          { xtype: 'box',anchor : "100%",autoEl: {src:  imageSrc,  tag: 'img', complete: 'off', width : 600,height : 600}}
												               	    	                                          		                          ] 
												               	    	                                           	              });
												               	    	                                           	            }
												               	    	                                           	             
												               	    	                                           	       bigImageWin.show(this);
																														}
																													
																													
																													});
																													var box =  new Ext.BoxComponent({
																														width : 150,
																														height : 150,
																														id : 'mybox'+i,
																														autoEl: {src:  imageUrlArray[i].pic_url,  tag: 'img', complete: 'off' }
//																																								
																													});
																													_panel.items.add(button);
							               	    	                                                        		_panel.items.add(box);
							               	    	                                                        
																												}
																											 }
																										}
																					               }]      
																						    	         
																							})
																					]
       	    	                                           	            	});
       	    	                                           	             }
           	    	                                           	             imageWin.show(this);
    	                      	                     	            },
    	                      	                     	            failure : function(){
    	                      	                     	            	utils.show_msg('查询商品图片报错啦!');	
    	                      	                     	            	return false;
    	                      	                     	            }
	                                                        	   });
	                                                         } 
	                                                       }
	                                                     ]
	                                                },
				               	    	            {columnWidth : .5, layout : "form",items : [
                                                         {xtype : "button", text : "显示自定义属性详情",fieldLabel : "自定义属性",anchor : "96%", value : '', id:"d_extern_properties_id", handler : function(){
                                                            // 扩展属性
                                                        	var extern_properties = record.json.extern_properties;
                                                        	//productProperty 商品定义信息，
                                                        	var productProperty = extern_properties.productProperty;
                                                        	//sellProperty：卖家自定义信息,
                                                        	var sellProperty = extern_properties.sellProperty;
                                                        	if( (productProperty == undefined || productProperty.length == 0) && (sellProperty == undefined || sellProperty.length == 0)){
                                                        		utils.show_msg('该商品未填写自定义属性信息哦!');	
                                                        		return false;
                                                        		
                                                        	}
	                                                         var propertyWin = null;
	                                           	             if(!propertyWin){
	                                           	               propertyWin = new Ext.Window({
	                                           	            		 width:500,
	                                          		                 height:400,
	                                          		                 plain: true,
	                                          		                 title : '商品自定义属性',
	                                          		                 items : [
																		new Ext.form.FormPanel({
																		   labelWidth: 80, 
																	       id : "d_productPropertyPanelId",
																	       height:200,
																	       autoScroll: true,
																	       title: '【商品属性】',
																	       layout:"form",
																	       frame:true,
																	       labelAlign:"right",
																	       items : [{
														                	  listeners: {
																				"render":function(){
																					var _panel = Ext.getCmp('d_productPropertyPanelId');
																					if(productProperty == undefined){
																						return false;
																					}
		       	    	                                                        	for(var i = 0 ; i < productProperty.length;i++){
		       	    	                                                        		var textfield = new Ext.form.TextField({
																							id:"productProperty"+productProperty[i].id,
																							fieldLabel: productProperty[i].key,
		       	    	                                                        		    value : productProperty[i].value,
		       	    	                                                        		    disabled : true
																						});
		       	    	                                                        		_panel.items.add(textfield);
		       	    	                                                        	}
																				 }
														                	  }
																           }]
																			     
																		}),
																		new Ext.form.FormPanel({
																		   labelWidth: 80, 
																	       id : "d_sellPropertyPanelId",
																	       height:200,
																	       layout:"form",
																	       title: '【卖家属性】',
																	       autoScroll: true,
																	       frame:true,
																	       labelAlign:"right",
																	       items:[{
																	    	   listeners: {
																	    		   "render":function(){
																						var _panel = Ext.getCmp('d_sellPropertyPanelId');
																						if(sellProperty == undefined ){
																							return false;
																						}
		           	    	                                                        	for(var i = 0 ; i < sellProperty.length;i++){
		           	    	                                                        		var textfield = new Ext.form.TextField({
																								id:"sellProperty"+sellProperty[i].id,
																								fieldLabel: sellProperty[i].key,
		           	    	                                                        		    value : sellProperty[i].value,
		           	    	                                                        		    disabled : true
																							});
		           	    	                                                        		_panel.items.add(textfield);
		           	    	                                                        	}
																				 	}
																	    	   }
																	       }]
																		})
																	]
	                                           	            	});
	                                           	             }
	                                           	             propertyWin.show(this);
	                                                      
	                                                          }
                                                        }] },
				               	    	            {columnWidth : .5, layout : "form", items : [{xtype:"textfield",  disabled : true,fieldLabel : "操作备注",anchor : "96%", value : record.json.remark, id:"d_remark_id"}] }
				               	    	            
			               	    	              ]
			               	                   }]
									    })
 		                       ]
  	            	 });
  	             }
  	           productDetailWin.show(this);
        	} 
        },

        viewConfig:{ 
        	forceFit:false 
    	} ,
        	
        constructor: function() {
            var me = this;
            me.pageSize = 50; 
            me.store = createDataStore(me);
            me.groupStore = createGroupStore(); 
            me.createProductTypeStore = createProductTypeStore();
            me.createGameStore = createGameStore();
            me.createGameChannelGroupStore = createGameChannelGroupStore();
            me.createGamePartitionStore = createGamePartitionStore();
            //交易模式
            me.tradModeStore = createTradModeStore();
            me.channelStore = createChannelStore();
            me.sm = new Ext.grid.CheckboxSelectionModel();
            me.column = me.createColumn(me);
            myPanel.superclass.constructor.call(this, {
                id: "tab:admin:product_list",
                title: "商品列表  <font color='red'>(双击选中列表记录 弹出商品详细信息哦)</font>",
                columns: me.column,
                layout: 'fit',
                trackMouseOver : true,
                closable: true,
		        collapsible: true,
		        animCollapse: false,
                autoScroll : true,
                autoDestroy : true,
                layout: "fit",
                loadMask : true,
                border: false,
                stripeRows : true,
                bbar: new Ext.PagingToolbar({store: this.store, pageSize: this.pageSize, displayInfo: true}),
                tbar :  new Ext.Toolbar({
                	autoScroll : true,
            		items : [
                            {xtype: 'buttongroup', columns: 18,
      	                     defaults: {
      	                        scale: 'small'
      	                      },
      	                     items: [
		      						{xtype: 'label', text: '商品编号： '},
		      						{xtype: 'textfield',width: 195, id: 'product_id',name: 'product_id'},
		      						{xtype: 'label', text: ' 商品状态： '},
		      	                    {width:100,xtype: 'combo', mode: 'local', triggerAction: 'all',
		      	                     forceSelection: true, editable: true, fieldLabel:'商品状态',
		      	                     emptyText:'商品状态选择', name:'status',id : "status", hiddenName:'title',
		      	                     displayField:'name', valueField:'value',
		      	                     store: new Ext.data.JsonStore({
		      	                        fields : ['name', 'value'],
		      	                        data   : [
		      	                                 {name : '暂存中',   value: '1'},
		      	                                 {name : '待审核',  value: '3'},
		      	                                 {name : '审核中',   value: '4'},
		      	                                 {name : '审核失败',  value: '5'},
		      	                                 {name : '出售中',   value: '7'},
		      	                                 {name : '用户下架',  value: '8'},
		      	                                 {name : '已售完',   value: '9'},
		      	                                 {name : '游戏下架',  value: '10'},
		      	                                 {name : '已过期',  value: '11'},
		      	                                 {name : '管理员下架',   value: '12'},
		      	                                 {name : '下架失败',  value: '13'},
		      	                                 {name : '支付中',  value: '15'}
		      	                                ]
		      	                        })
		      	   		             },
		      	                    {xtype: 'label',text: ' 卖家UID： '},
		      						{xtype: 'textfield',width: 100,id: 'seller_uid',name: 'seller_uid'},
		      	                	{xtype: 'label', text: ' 创建日期： '},
		      						{xtype: 'datefield',width: 100,id: 'date_from',name: 'date_from', format: 'Y-m-d',value: new Date().add(Date.DAY, -7)},
		      					    {xtype: 'label', text: ' 至  '},
		      						{xtype: 'datefield',width: 100,id:'date_to',name: 'date_to', format: 'Y-m-d',value: new Date()},
		      					    {xtype: 'label',width: 60, text: ' 子渠道： '},
		      						{xtype: 'textfield',  width: 120,  id: 'sub_channel',name: 'sub_channel'},
		      	                	{text: "修改属性", width: 100, icon: 'static/libs/icons/application_edit.png',
	      		                        handler : function(){
	      	                      		 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
	      	                       		 var queryId = null;
	      	                       		 	if(sels && sels.length == 1){
	      	                       		 	    var productTypeGroupId = sels[0].data.product_type_group_id;
	      	                       		 	    var productId = sels[0].data.product_id;
	      	                       		 	    //交易模式
	      	                       		 	    var tradeMode = sels[0].data.trade_mode;
	      	                       		 	    //商品状态
	      	                       		 	    var status = sels[0].data.status;
	//      	                       		 	    if(productTypeGroupId == 4  || productTypeGroupId == 5 || productTypeGroupId == 6){//充值类商品
	//      	                       		 	    	utils.show_msg("充值类商品请到充值类商品管理修改哦!");
	//      	                       		 	    	return false;
	//      	                       		 	    }
		      	                       		 	if(status != 1 && status != 5 && status != 8 ){//暂存中、审核失败、用户下架
		   		                       		 	    utils.show_msg("商品状态是暂存中、审核失败、用户下架的商品才能修改哦!");
		   	                       		 	    	return false;
		   	                       		 	    }
	      	                       		 	    //商品组业务ID
	                             			    queryId = sels[0].data.product_id;
	      	                       			    Ext.Ajax.request({
		      	                     	            url: URLS.QUERY_GET+"?queryId="+queryId,
		      	                     	            params: {"queryId":queryId},
		      	                     	            method : "POST",
		      	                     	            success: function(resp, opts){
		      	                     	            var obj = Ext.decode(resp.responseText);
		      	                       	            var updateProduct = obj.updateProduct;
		      	                       	            var imageList = obj.imageList;
		      	                          			var editWin = null;
	                                    		         if(!editWin){
	                                    		        	editWin = new Ext.Window({//加载窗体
	                                    		                 width:600,
	                                    		                 height:600,
	                                    		                 autoScroll:true,
	                                    		                 plain: true,
	                                    		                 items: [
	                                    		                         new Ext.form.FormPanel({
	                                    		                        	   labelWidth: 95, 
	                                    		               	               frame:true,
	                                    		               	               title: '编辑商品信息',
	                                    		               	               bodyStyle:'padding:2px 2px 0',
	                                    		               	               defaultType: 'textfield',
	                                    		               	               items: [
	                                    		               	                       {id : "u_product_group_id", value : updateProduct.product_group_id, hidden :true},
	                                    		               		                   {id : "u_id", value : updateProduct.id, hidden :true},
	                                    		               		                   {fieldLabel: '商品标题', id : "u_name", name : 'u_name',  value :updateProduct.name, allowBlank:false},
	                                    		               	                       {fieldLabel: '商品描述', id : "u_info", name: 'u_info', value : updateProduct.info},
		                                    		               	                   {fieldLabel: '商品库存', id : "u_stock", name: 'u_stock', value : updateProduct.stock, allowBlank:false,  xtype : 'numberfield',  blankText:"请填入非空的数字" },
		                                    		               	                   {fieldLabel: '商品有效时间',  xtype: 'datefield', id:'u_validity',name: 'u_validity', format: 'Y-m-d',value:  updateProduct.validity,  allowBlank:false},
		                                    		               	                   {fieldLabel: '单件数量', id : "u_single_number", name: 'u_single_number', value : updateProduct.single_number, allowBlank:false, xtype : 'numberfield', blankText:"请填入非空的数字"},
		                                    		               	                   {fieldLabel: '商品价格', id : "u_single_price", name: 'u_single_price',  value : updateProduct.single_price,  allowBlank:false, xtype : 'numberfield',  blankText:"请填入非空的数字"},
		                                    		               	                   {fieldLabel: '商品原价', id : "u_original_price",  name: 'u_original_price', value : updateProduct.original_price, allowBlank:false,  xtype : 'numberfield',  blankText:"请填入非空的数字"},
		                                    		               	                   {fieldLabel: '游戏ID',  disabled : true,  id : "u_game_id", name: 'u_game_id',  value : updateProduct.game_id,  allowBlank:false},
		                                    		               	                   {xtype : "combo",fieldLabel:'商品区服',id: 'u_partition_id',displayField:'partition_name', valueField:'partition_id', typeAhead: true, mode: 'local', forceSelection: true,
		                                    		               					    triggerAction: 'all', allowBlank:true, emptyText:'区服选择', width: 150,  selectOnFocus:true,
		                                    		               					    store : new Ext.data.JsonStore({
		                          		                          		          		autoDestory : true,url : URLS.GAME_PARTITION_GET,
		                          		                          		          		root : 'data',idProperty : 'partition_id',totalProperty : 'total_count',
		                          		                          		          		fields: [
		                          		                          		          		         {name : 'partition_id'},
		                          		                          		          		         {name : 'partition_name'}
		                          		                          		          		],
		                          		                          		          		listeners :{
		                          		                          		          			beforeload : function(s){
		                          		                          		          			  if(productTypeGroupId == 4 || productTypeGroupId == 5 || productTypeGroupId == 6){
		                                  		           					         	    		Ext.getCmp("u_name").setDisabled(true);
		                          		                          		          				    Ext.getCmp("u_info").setDisabled(true);
				                  		                          		          					Ext.getCmp("u_stock").setDisabled(true);
				                  		                          		          					Ext.getCmp("u_validity").setDisabled(true);
				                  		                          		          					Ext.getCmp("u_single_number").setDisabled(true);
				                  		                          		          					Ext.getCmp("u_single_price").setDisabled(true);
				                  		                          		          					Ext.getCmp("u_original_price").setDisabled(true);
				                  		                          		          					Ext.getCmp("u_partition_id").setDisabled(true);
				                  		                          		          					Ext.getCmp("u_game_id").setDisabled(true);
				                  		                          		          					Ext.getCmp("deleteButton").setDisabled(true);
				                  		                          		          					Ext.getCmp("addButton").setDisabled(true);
		                          		                          		          			    }else if(productTypeGroupId == 3){
		                          		                          		          					Ext.getCmp("u_stock").setDisabled(true);
		                          		                          		          				}
		                          		                          		          				//API的商品，商品描述、库存、单价数量、上传图片，应该要判断不能编辑 
		                          		                          		          				if(tradeMode == 1){
		                          		                          		          					
		                          		                          		          					Ext.getCmp("u_info").setDisabled(true);
		                          		                          		          					Ext.getCmp("u_stock").setDisabled(true);
		                          		                          		          					Ext.getCmp("u_single_number").setDisabled(true);
		                          		                          		          					Ext.getCmp("deleteButton").setDisabled(true);
		                          		                          		          					Ext.getCmp("addButton").setDisabled(true);
		                          		                          		          				}else if(tradeMode == 2){//C2C游戏币，商品描述、上传图片应该要判断不能编辑
		                          		                          		          				
		      		                    		                          		          			Ext.getCmp("u_info").setDisabled(true);
		      	                		                          		          					Ext.getCmp("deleteButton").setDisabled(true);
		      	                		                          		          					Ext.getCmp("addButton").setDisabled(true);
		      	                		                          		          				}
		      	                    		                          		          			var game_id = Ext.getCmp('u_game_id').getValue();
		      		                              		 		                            	s.baseParams.game_id  = game_id;
		                          		                          		          			    
		                          		                          		          			},
	                                    		               					    		load : function(s){
	                                    		               					    			Ext.getCmp("u_partition_id").setValue(updateProduct.game_partition_id);
	                                    		               					    		}
		                          		                          		          		}
		                          		                          		          	}),
	                                    		               					    listeners: {
	      	                              		 		                            render: function(combo){
	      	                              		 		                                combo.store.load();
	      	                              		 		                            }
	                                    		               					   }
		                                    		               	               },
		                                  		             			           {width:85, mode:'local', triggerAction: 'all', forceSelection: true, editable:true, fieldLabel:'是否展示', emptyText:	'是否展示', 
		                                    		               	            	value : updateProduct.is_show, name:'u_is_show', id :"u_is_show", xtype: 'combo', hiddenName: 'title', displayField:'name', valueField: 'value',
	                                 		             		                     store: new Ext.data.JsonStore({
	                                 		             		                     fields : ['name', 'value'],
	                                 		             		                     data   : [
	                                 		             		                               {name : '是',  value: '1'},
	                                 		             		                               {name : '否',   value: '0'}
	                                 		             		                         ]
	                                 		             		                     })
		                                 		             			            },
		                                 		             			           {width: 85, mode: 'local', triggerAction: 'all', forceSelection: true, editable:true, fieldLabel: '是否可下单', emptyText:	'是否可下单',
		                                 		             		                name:'u_is_order', id : "u_is_order", xtype:'combo', hiddenName:'title', displayField: 'name', valueField: 'value',
	                                 		             		                    store: new Ext.data.JsonStore({
		                                 		             		                       fields : ['name', 'value'],
		                                 		             		                       data   : [
		                                 		             		                               {name : '是',  value: '1'},
		                                 		             		                               {name : '否',   value: '0'}
		                                 		             		                         ]
	                                 		             		                     }),
	                                 		             		                    listeners: {
	                                 		             		                	  render : function(){
	          		                          							        		Ext.getCmp("u_is_order").setValue(updateProduct.is_order);
	          		                          							        		var value = updateProduct.is_order;
		          		                          							        	if(value == 1){
		 	          			                                                			Ext.getCmp('u_unorder_reason').setVisible(false);
		 	          			                                                		 }else{
		 	          			                                                			 Ext.getCmp('u_unorder_reason').setVisible(true);
		 	          			                                                		 }
	          		                          							        	 },
	                                 		             		                	 select : function(c){
	     	          			                                                		var selectValue = c.getValue();
	     	          			                                                		if(selectValue == 1){
	     	          			                                                			Ext.getCmp('u_unorder_reason').setVisible(false);
	     	          			                                                		 }else{
	     	          			                                                			Ext.getCmp('u_unorder_reason').setVisible(true);
	     	          			                                                		 }
	     	          			                                              	     }
	                                 		             		                   }
		                                 		             			         },
		                                 		             			         {fieldLabel: '不可下单原因', id : "u_unorder_reason", name: 'u_unorder_reason', value : updateProduct.unorder_reason,   allowBlank:true}
	                                    		               	           ]
	                                    		                   	}),
	                                    		                  new Ext.Panel({
	                              		               				//加载form表单
	                          		                    	  		labelWidth: 95, // label settings
	      	                    		           	                frame:true,
	      	                    		           	                title: '商品图片编辑',
	      	                    		           	                bodyStyle:'padding:5px 5px 0',
	      	                    		           	                id: 'imagePanelId',
	      	                    		           	                defaultType: 'textfield',
	      	                    		           	                autoDestroy : true, 
	      		                    		           	            autoScroll:true, 
	      		                    		           	            height:500,  
	      	                    		           	                items: [
	                        		           							 {xtype: 'button', text: '增加图片', id : "addButton",width: 60, icon: 'static/libs/icons/add.png',
	                        		           					             handler : function(){
	                        		           					            	 var imagePanelId = Ext.getCmp("imagePanelId");
	                        		           					            	 var itemslength = imagePanelId.items.length;
	                        		           					            	 if(itemslength > 8){
	                        		           					            		 utils.show_msg("最多只能新增5张图片哦!");
	                        		           					            		 return false;
	                        		           					            	 }
	                        		           					            	 var imageFormPanel =  new Ext.form.FormPanel({
	                   		           		                                      border: false,
	                       		           		                                  width: 400,
	                       		           		                                  items: [
	                       		           		                                          {xtype: 'compositefield', fieldLabel: '商品图片', msgTarget : 'side', anchor : '-20',
	      	                    		           		                                   defaults: {
	      	                    		           		                                        flex: 1
	      	                    		           		                                   },
	      	                    		           		                                   items: [
	      	                    		           		                                           {checked: false, xtype : 'checkbox' },
	      		                    		           		                                       {fieldLabel: 'Logo预览', xtype: 'box', autoEl: {src:  "", tag: 'img', complete: 'off',width:600, height: 100}},
	      		                    		           		                                       {xtype: 'textfield', width : '65', height : '60',inputType: "file",
	      		                    		           		                                    	listeners:{
	      		                    		           		                                    		change : function (file,oldValue,newValue){
	      		                    		           		                                    		  var imagePanelId = Ext.getCmp("imagePanelId");
	      		                    		           		                                              //动态新增、删除控件的原因....绝对定位获取浏览图box的id名称
	      		                    		           		                                              var browseId =  imageFormPanel.items.items[0].items.items[1].ownerCt.items.items[1].id;
	      		                    		           		                                              //获取文件选择框的id名称
	      		                    		           		                                              var fileId =  imageFormPanel.items.items[0].items.items[1].ownerCt.items.items[2].id;
	      			                    		           		                                          var el = Ext.getCmp(fileId).getEl();
	      			                    		           		                                          Ext.get(browseId).dom.src = window.URL.createObjectURL(el.dom.files.item(0));
	      			                    		           		                                          imagePanelId.doLayout();//新增后布局刷新
	      		                    		           		                                    		}  
	      		                    		           		                                    	} 
	      		                    		           		                                      }
	      	                    		           		                                    ]
	                   		           		                           		          }     
	                       		           		                                  ]
	                   		           		                                   });
	                        		           					              imagePanelId.add(imageFormPanel);
	                        		           					              imagePanelId.doLayout();//新增后布局刷新
	                        		           					             }
	                        		           							 },
	                        		           							 {xtype: 'button', text: '删除图片', id : "deleteButton" , width: 60, icon: 'static/libs/icons/delete.png',
	                        		           					             handler : function(){
	                        		           					            	 var imagePanelId = Ext.getCmp("imagePanelId");
	                        		           					            	 var itemses = imagePanelId.items;
	                        		           					            	 if(imagePanelId.items.length == 4){//删除限制的长度
	                        		           					            		 return false;
	                        		           					            	 }
	                        		           					            	 var deleteArray = new Array();
	                        		           					            	 var j = 0;
	                        		           					            	 for(var i = 4 ; i < itemses.length ; i ++){
	                        		           					            		//态新增、删除控件的原因，绝对定位获取组件是否选中而删除
	                        		           					            		var isChecked = itemses.items[i].items.items[0].items.items[0].checked;
	                        		           					            		if(isChecked){
	                        		           					            			var panelId =  itemses.items[i].id;
	                            		           					            			deleteArray[j++] = panelId;
	                        		           					            		   } 
	                       		           					            		  }
	                        		           					            	 for(var k = 0 ; k < deleteArray.length ; k++){
	                        		           					            		imagePanelId.remove(Ext.getCmp(deleteArray[k]));
	                        		           					            	 }
	                        		           					            	 imagePanelId.doLayout();//新增后布局刷新
	                        		           					             }
	                        		           							},
	                        		           						    {hidden : true,xtype: 'button', text: '重置',  width: 60, icon: 'static/libs/icons/add.png' },
	                        		           							{hidden : true,//自动创建上传组件依赖当前元素,隐藏即可
	                        		           								 listeners : {
		                        		           								 render : function(){
		      	                  		           								 var imagePanelId = Ext.getCmp("imagePanelId");
		      	           		           		                           	     for(var i = 0 ; i < imageList.length ; i++){
		      	           		           		                           		     var iamge = imageList[i];
		      	           		           		                           		     var imageFormPanel =  new Ext.form.FormPanel({
		      	           		           		                                      border: false,
		      	               		           		                                  width: 400,
		      	               		           		                                  items: [
		      	               		           		                                          {xtype: 'compositefield', fieldLabel: '商品图片', msgTarget:'side',anchor : '-20',
		      		                   		           		                                    defaults: {
		      		                   		           		                                        flex: 1
		      		                   		           		                                    },
		      	                   		           		                                        items: [
				      	                   		           		                                         {checked: false,xtype : 'checkbox'},
				      	                   		           		                                         {fieldLabel: 'Logo预览', xtype: 'box', autoEl: {src:  iamge.pic_url, tag: 'img', complete: 'off', width:100, height: 100} },
				      	                   		           		                                         {hidden: true, xtype: 'textfield', width : '180', height : '60',inputType: "file"}
				      	                   		           		                                       ]
		      	               		           		                                          }     
		      	               		           		                                          ]
		      	           		           		                                    });
		                    		           						            	imagePanelId.add(imageFormPanel);
		                    		           						            	imagePanelId.doLayout();//新增后布局刷新
		      	           		           		                           	    }
		                        		           							}
	                        		           							}
	                        		           						}
	                          		           	               ]
	                          		                 	     })
	                                    		           ] ,
	                                    		          buttons: [
	                                    		                    {text:'保存',
				                                                     handler : function(){
				                                                      	  if(Ext.getCmp("u_name").isValid() && Ext.getCmp("u_stock").isValid() && Ext.getCmp("u_validity").isValid() 
				                                                      			  && Ext.getCmp("u_single_number").isValid() && Ext.getCmp("u_single_price").isValid() 
				                                                      		     && Ext.getCmp("u_original_price").isValid()){
				                                                      		  
				                                                      		 //商品id
				                                                             var id = Ext.getCmp("u_id").getValue();
				                                                      		 //商品组业务id
				                                                           	 var product_group_id = Ext.getCmp("u_product_group_id").getValue();
				                                                           	 //商品名称
				                                                           	 var name = Ext.getCmp("u_name").getValue();
				                                                           	 //商品描述
				                                                          	 var info = Ext.getCmp("u_info").getValue();
				                                                           	 // 库存
				                                                           	 var stock = Ext.getCmp("u_stock").getValue();
				                                                           	 // 有效时间
				                                                           	 var validity = Ext.getCmp("u_validity").value;//getValue()..带有 GMT+0800 (中国标准时间)
				                                                           	 // 单件数量
				                                                           	 var single_number = Ext.getCmp("u_single_number").getValue();
				                                                           	 // 单件价格
				                                                           	 var single_price = Ext.getCmp("u_single_price").getValue();
				                                                           	 // 商品原价
				                                                           	 var original_price = Ext.getCmp("u_original_price").getValue();
				                                                           	 // 游戏区服
				                                                           	 var partition_id = Ext.getCmp('u_partition_id').getValue();
				                                                           	 // 游戏id
				                                                           	 var game_id = Ext.getCmp('u_game_id').getValue();
				                                                           	 // 是否显示
				                                                           	 var is_order = Ext.getCmp('u_is_order').getValue();
				                                                           	 // 是否可下单
				                                                           	 var is_show = Ext.getCmp('u_is_show').getValue();
				                                                           	 // 不可下单原因
				                                                           	 var unorder_reason = Ext.getCmp('u_unorder_reason').getValue();
				                                                           	 
				                                                           	 var imagePanelId = Ext.getCmp("imagePanelId");
				          		           					            	 var itemses = imagePanelId.items;
				          		           					            	 
				          		           					                 //XXX 使用html5的功能
				            		                                             var form = new FormData();
				            		                                              //存放上传本地文件控件或者服务器图片URL
				          		           					            	 for(var i = 4 ; i < itemses.length ; i ++){
				          		           					            		var fileId = itemses.items[i].items.items[0].items.items[1].ownerCt.items.items[2].id;
				          		           					            		var uploadFile = Ext.getCmp(fileId).getEl().dom.files[0];
				          		           					            		if(uploadFile == undefined || uploadFile == ""){
				          		           					            		    var serverUrl =itemses.items[i].items.items[0].items.items[1].ownerCt.items.items[1].autoEl.src;
				          		           					            		    form.append("serverUrl"+i, serverUrl);
				          		           					            		}else{
				          		           					            			form.append("uploadFile"+i, uploadFile);
				          		           					            		}
				         		           					            		  }
				          		           					            	form.append("updateId", product_group_id);
				          		           					            	form.append("product_group_id", product_group_id);
				          		           					            	form.append("name", name);
				          		           					            	form.append("info", info);
				          		           					            	form.append("stock", stock);
				          		           					            	form.append("validity", validity);
				          		           					            	form.append("single_number", single_number);
				          		           					            	form.append("single_price", single_price);
				          		           					            	form.append("original_price", original_price);
				          		           					            	form.append("game_partition_id", partition_id);
				          		           					         	    form.append("game_id", game_id);
				          		           					         	    form.append("product_id", productId);
				          		           					         	    form.append("is_show", is_show);
				          		           					         	    form.append("is_order", is_order);
				          		           					         	    form.append("unorder_reason", unorder_reason);
				          		           					         	    form.append("product_type_groupId", productTypeGroupId);
				          		           					            	 
				      	      		                                         var xmlhttp = new XMLHttpRequest();
				      	      		                                         xmlhttp.onreadystatechange=callback;  
				      	      		                                         xmlhttp.open("POST", URLS.UPDATE_GET, true);
				      	      		                                         xmlhttp.onload = function(e){
				      	      		                                         var resp = Ext.util.JSON.decode(e.currentTarget.response);
				      	      		                                         	 if(resp.success){
				      	      		                                         	   utils.show_msg("修改成功!");
				                                                   				   me.store.load({params: {start:0, limit: me.pageSize}});
				                                                   				   editWin.close();
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
	                                                   {text: '取消', handler: function(){ editWin.close(); }
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
		      	                },
	      	                    {text: "<font color='blue'>清空条件</font>",width: 100, icon: 'static/libs/icons/reset.png',
	      	                        handler : function(){
	      	                        	 Ext.getCmp('product_id').setValue('');
	      	  							 Ext.getCmp('product_group_id').setValue('');
	      	  							 Ext.getCmp('seller_uid').setValue('');
	      	  							 Ext.getCmp('date_from').setValue('');
	      	  							 Ext.getCmp('date_to').setValue('');
	      	  							 Ext.getCmp('sub_channel').setValue('');
	      	  							 Ext.getCmp('status').setValue('');
	      	  							 Ext.getCmp('game_id').setValue('');
	      	  							 Ext.getCmp('partition_id').setValue('');
	      	  							 Ext.getCmp('trade_mode').setValue('');
	      	  							 Ext.getCmp('game_channel_group_id').setValue('');
	      	  							 Ext.getCmp('product_type_group_id').setValue('');
	      	  							 Ext.getCmp('is_order').setValue('');
	      	  							 Ext.getCmp('channel_id').setValue('');
	      	  							 Ext.getCmp('date_from').setValue('');
		      	  						 Ext.getCmp('date_to').setValue('');
	      	  							 me.__get_cmp('single_price_from').setValue('');
	      	  							 me.__get_cmp('single_price_to').setValue('');
	      	  							
	      	  							
	      	                        }
	      	                    }, 
	      	                    {text: '批量下架',  icon: 'static/libs/icons/offline.png', width: 100,
	      	                        handler : function(){
	                     				    	 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
	                     				    	 if(sels && sels.length > 0){
	      	                 				    	var  offIds = new Array();
	      	                 				    	for(var i = 0 ; i< sels.length ; i++){
	      	                 				    		var status = sels[i].data.status;
	      	                 				    		if(status != 7){
	      	                 				    			utils.show_msg("请选择‘上架’状态的商品下架哦!");
	      	                 				    			return false;
	      	                 				    		}
	      	                 				    		offIds[i] = sels[i].data.product_id;
	      	                 				    	}
	      	                 				 	 var offProductWin = null;
	      	                    		         if(!offProductWin){
	      	                    		        	offProductWin = new Ext.Window({//加载窗体
	      	                    		                 layout:'fit',
	      	                    		                 width:500,
	      	                    		                 height:350,
	      	                    		                 plain: true,
	      	                    		                 items: new Ext.FormPanel({//加载form表单
	      	                    		                 labelWidth: 100, // label settings
	      	                            		               frame:true,
	      	                            		               title: '下架填写原因窗体',
	      	                            		               bodyStyle:'padding:5px 5px 0',
	      	                            		               width: 400,
	      	                            		               height:350,
	      	                            		               defaultType: 'textfield',
	      	                            		               items: [
		      	                            		                     {xtype : "compositefield",  fieldLabel : "选择下架原因", 
		      	                              		                    	 items : [
		      	                              		                    	  	new Ext.form.ComboBox({
		    																	  	fieldLabel:     '选择下架原因', displayField:'name', valueField:'id', typeAhead: true, mode: 'remote',
		    																	    forceSelection: true, triggerAction: 'all', allowBlank:true, emptyText:'选择下架原因类型', width: 150,
		    																	    selectOnFocus:true,id: 'zidian_select',name: 'zidian_select',
		    																		store : new Ext.data.JsonStore({
		    																		    	autoDestroy: true,
		    																		    	url: URLS.OFF_REARON,
		    																		    	baseParams: {'group_code':'OFF_PRODUCT_REASON'},
		    																		    	root: 'data',
		    																		    	idProperty: 'id',
		    																		    	totalProperty: 'total_count',
		    																		    	fields:[ 
		    																		          {name: 'id'},
		    																		          {name: 'name'}
		    																		        ],
		    																		      listeners : {
		    																		        	load : function(){
		//    																		        		Ext.getCmp("id").setValue(updateObject.product_type_group_id);
		    																		        	
		    																		        	}
		    																		        }
		    																		     
		    																		    }),
		    																		  listeners: {
		    																			  select :function( combo, record, index ){
		    																				var value = record.json.description;
		    																				Ext.getCmp('reason').setValue(value);
		    																			  },
		    																             render: function(combo){
		    																                 combo.store.load();
		    																             }
		    																		   }
		    																  }),
		      	  															  {xtype : "displayfield", value : "<font color='red'>选择字典配置下架原因类型</font>"}
		      	                              		                         ]
		      	                              		                      },
		      	                            		                      {fieldLabel: '填写下架原因', id : "reason", name: 'reason', xtype: 'textarea', width: 300, height:200, value : "", allowBlank:false}
	      	                            		               ]
	      	                    		                 }),
			      	                    		         buttons: [{
			      	                                       text:'保存',
			      	                                       handler : function(){
			      	                                       if(Ext.getCmp("reason").isValid()){
			      	                                      	   //获取名称值
			      	                                      	   var reason = Ext.getCmp("reason").getValue();
				      	                                       Ext.MessageBox.confirm('导出框', '确定要下架商品？', function(btn) {  
				       		                   				    if(btn == 'yes'){
				           		                   				     Ext.Ajax.request({
				             		  	                     	             url: URLS.OFF_GET,
				             		  	                     	             params: {"offIds":offIds,'reason':reason},
				             		  	                     	             method : "POST",
				             		  	                     	             success: function(resp, opts){
				             		  	                     	                var obj = Ext.decode(resp.responseText);
				             		  	                     	            	var success = obj.success;
				             		                                   			   if(success){
				             		                                   				   utils.show_msg("下架商品成功,共下架数量："+ sels.length);
				             		                                 				   me.store.load({params: {start:0, limit: me.pageSize}});
				             		                                   			   }else{
				             		                                   				   utils.show_msg(obj.msg);
				             		                                   			   }
				             		                                   			offProductWin.close();
				             			  	                       		     } ,
				             			  	                       		     failure: function(resp, otps){
				             			                      	            	utils.show_msg("下架失败!");
				             			                      	            	offProductWin.close();
				             			                      	             }
				             			  	                       		});
				       		                   				    }
				           		                   			}); 
			      	                                       }else{
			      	                                      	 utils.show_msg("请填写下架原因!");
			      	                                       }
			      	                                       }
			      	                                   },
	      	                                   {text: '取消', handler: function(){offProductWin.close();}}
	      	                                   ]
	      	                    		      });
	      	                    		     }
	      	                    		   offProductWin.show(this);
	      	                      		   }else{
	      	                      			   	 utils.show_msg("请选择下架的商品哦!");
	      	                      		 }
	      	                        }
	      	                    },
	      	                   {text: '批量上架', icon: 'static/libs/icons/online.png', width: 100,
	      	                    	handler : function(){
                     				    	 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
                     				    	 if(sels && sels.length > 0){
      	                 				    	var  onIds = new Array();
      	                 				    	for(var i = 0 ; i< sels.length ; i++){
      	                 				    		var status = sels[i].data.status;
      	                 				    		if(status != 8 && status != 11 && status != 12 ){
      	                 				    			utils.show_msg("请选择商品状态是:用户下架、管理员下架、已过期的上架哦!");
      	                 				    			return false;
      	                 				    		}
      	                 				    		onIds[i] = status+":"+sels[i].data.product_id;//状态 + id值
      	                 				    	}
      	                 				     Ext.MessageBox.confirm('导出框', '确定要上架商品？', function(btn) {  
       		                   				    if(btn == 'yes'){
          	  	                       			    Ext.Ajax.request({
          		  	                     	             url: URLS.ON_GET,
          		  	                     	             params: {"onIds":onIds},
          		  	                     	             method : "POST",
          		  	                     	             success: function(resp, opts){
          		  	                     	            	  var obj = Ext.decode(resp.responseText);
          		  	                     	            	  if(obj.success){
          		  	                     	            		  utils.show_msg("上架商品成功,共上架数量："+ sels.length);
          		  	                     	            		  me.store.load({params: {start:0, limit: me.pageSize}});    
          		  	                     	            	  }else{
          		  	                     	            		  utils.show_msg(obj.msg);
          		  	                     	            		  return false;
          		  	                     	            	  }
          			  	                       		     } ,
          			  	                       		     failure: function(resp, otps){
          			                      	            	utils.show_msg("上架失败!");
          			                      	             }
          			  	                       		});
       		                   				    }
       		                   				}); 
      	                      		   }else{
      	                      			   	 utils.show_msg("请选择上架的商品哦!");
      	                      		 }
      	                         }
	      	                   },
	      	                 {text: "<font color='red'>批量删除</font>", width: 70, icon: 'static/libs/icons/delete.png', 
			                         handler : function(){
			     				    	 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
			     				    	 if(sels && sels.length > 0){
			           				    	var  deleteProductIds = new Array();
			           				    	for(var i = 0 ; i< sels.length ; i++){
			           				    		deleteProductIds[i] = sels[i].data.product_id;
			           				    	}
			           				    	
			           				      Ext.MessageBox.confirm('删除框', '确定要刪除商品？', function(btn) {  
			                   				    if(btn == 'yes'){
				                   				     Ext.Ajax.request({
				  	                     	             url: URLS.DELETE_GET,
				  	                     	             params: {"deleteProductIds":deleteProductIds},
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
					                      	            	utils.show_msg("删除商品失败!");
					                      	             }
					  	                       		});
			                   				    }
			                   				}); 
			                		   }else{
			                			   	 utils.show_msg("请选择要刪除的商品~");
			                		 }
			                        }
	  			               },
      	                    {},
      	                    {xtype: 'label', text: '商品组编号： '},
      	                    {xtype: 'textfield', width: 195, id: 'product_group_id',name: 'product_group_id'},
      	   		            {xtype: 'label', text: ' 游戏 ： '},
      	   		            {width:  100, mode: 'local', triggerAction: 'all', forceSelection: true, editable:true, fieldLabel:'游戏选择',
      		                 emptyText:'游戏选择', name:'game_id', id :"game_id",xtype:'combo', hiddenName: 'title', displayField:'game_name',
      		                 valueField:     'game_id', store : me.createGameStore,
  		                     listeners: {
  		                            beforequery: function(s){
  		                            	Ext.getCmp('game_channel_group_id').setValue("");
  		                            	Ext.getCmp('partition_id').setValue("");
  		                            },
  		                            render: function(combo){
  		                                combo.store.load();
  		                            }
  		                       }
      	 		            },
      	 		            {xtype: 'label', text: ' 渠道组 ： '},
      	 		            {width:100, mode:'local',triggerAction: 'all', forceSelection: true, editable: true,
      		                 fieldLabel:'渠道组选择', emptyText:'渠道组选择', name:'game_channel_group_id',id : "game_channel_group_id",
      		                 xtype:'combo', hiddenName:'title',displayField:'name', valueField: 'id',
      		                 store  : me.createGameChannelGroupStore,
  		                     listeners: {
  		                            beforequery: function(s){
  		                            	Ext.getCmp('partition_id').setValue("");
  		                                var gameCheckText = Ext.getCmp('game_id').lastSelectionText;
  		                                var gameCheckIndex = Ext.getCmp('game_id').selectedIndex;
  		                            	if(gameCheckText == "" || gameCheckIndex == -1){//游戏未选择 或者 值为空
  		                            		return false;
  		                            	}
  		                            	 var game_id = Ext.getCmp('game_id').getValue();
  		                            	 me.createGameChannelGroupStore.load({params : {'game_id' : game_id}});
  		                            },
  		                            render: function(combo){
  		                                combo.store.load();
  		                            }
  		                       }
      			            },
      			            {xtype: 'label', text: ' 分区 ： '},
      	  		            {width: 100, mode: 'local', triggerAction: 'all', forceSelection: true, editable:true,
      		                fieldLabel:'分区选择', emptyText:'分区选择', name:'partition_id', id :"partition_id",
      		                xtype:'combo', hiddenName:'title',displayField:'partition_name', valueField:'partition_id',
      		                store : me.createGamePartitionStore,
		                    listeners: {
	                            beforequery: function(s){
	                                var channelGroupCheckText = Ext.getCmp('game_channel_group_id').lastSelectionText;
	                                var channelGroupCheckIndex = Ext.getCmp('game_channel_group_id').selectedIndex;
	                            	if(channelGroupCheckText == "" || channelGroupCheckIndex == -1){//渠道组未选择 或者 值为空
	                            		return false;
	                            	}
	                            	 var game_id = Ext.getCmp('game_id').getValue();
	                            	 var game_channel_group_id = Ext.getCmp('game_channel_group_id').getValue();
	                            	 me.createGamePartitionStore.load({params : {'game_id' : game_id,'game_channel_group_id' : game_channel_group_id}});
	                            }
		                     }
      			            },
      			            {xtype: 'label', text: ' 一级分类 ： '},
      	 		            {width: 100, mode: 'local', triggerAction: 'all', forceSelection: true,editable: true,fieldLabel: '一级分类选择',
      		                 emptyText:	'一级分类选择',name: 'product_type_group_id', id :"product_type_group_id",
      		                 xtype: 'combo', hiddenName:'title', displayField: 'name',valueField:'product_type_group_id',
      		                 store : me.groupStore
      			            },
      			            {xtype: 'label', text: ' 交易模式： '},
      			            {width: 120, mode: 'remote', triggerAction:  'all',  forceSelection: true, editable: true,
      		                     fieldLabel: '交易模式选择', emptyText: '交易模式选择', name: 'trade_mode',
      		                     id : "trade_mode",  xtype: 'combo', hiddenName: 'title', displayField: 'name', valueField: 'value',
	      		                 store : new Ext.data.JsonStore({
	      		                     url : utils.build_url("commonHelper/readTradModeList"),
	      		                     fields : [{name : "name"},{name : "value"}],
	      		                     root : "data"
	      		                 })
      			            },
      			            {text: '批量展示',icon: 'static/libs/icons/world_add.png',width: 100,
      	                        handler : function(){
                     				    	 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
                     				    	 if(sels && sels.length > 0){
      	                 				    	var  showIds = new Array();
      	                 				    	for(var i = 0 ; i< sels.length ; i++){
      	                 				    		showIds[i] = sels[i].data.product_id;//
      	                 				    	}
      	                 				     Ext.MessageBox.confirm('设置批量展示框', '确定要设置展示商品？', function(btn) {  
       		                   				    if(btn == 'yes'){
          	  	                       			    Ext.Ajax.request({
          		  	                     	             url: URLS.SHOW_GET,
          		  	                     	             params: {"showIds":showIds},
          		  	                     	             method : "POST",
          		  	                     	             success: function(resp, opts){
          		  	                     	            	  var obj = Ext.decode(resp.responseText);
          		  	                     	            	  if(obj.success){
          		  	                     	            		  utils.show_msg("成功设置展示商品数量："+ sels.length);
          		  	                     	            		  me.store.load({params: {start:0, limit: me.pageSize}});    
          		  	                     	            	  }else{
          		  	                     	            		  utils.show_msg(obj.msg);
          		  	                     	            		  return false;
          		  	                     	            	  }
          			  	                       		     } ,
          			  	                       		     failure: function(resp, otps){
          			                      	            	utils.show_msg("设置不展示商品失败!");
          			                      	             }
          			  	                       		});
       		                   				    }
       		                   				}); 
      	                      		   }else{
      	                      			   	 utils.show_msg("请选择要设置的展示商品~");
      	                      		 }
      	                       }
      	                    },
      	                    {text: '批量不展示', icon: 'static/libs/icons/world_delete.png', width: 100,
      	                        handler : function(){
                     				    	 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
                     				    	 if(sels && sels.length > 0){
      	                 				    	var  hideIds = new Array();
      	                 				    	for(var i = 0 ; i< sels.length ; i++){
      	                 				    		hideIds[i] = sels[i].data.product_id;
      	                 				    	}
      	                 				    	
      	                 				      Ext.MessageBox.confirm('设置批量不展示框', '确定要设置不展示商品？', function(btn) {  
        		                   				    if(btn == 'yes'){
	        		                   				     Ext.Ajax.request({
	          		  	                     	             url: URLS.HIDE_GET,
	          		  	                     	             params: {"hideIds":hideIds},
	          		  	                     	             method : "POST",
	          		  	                     	             success: function(resp, opts){
	          		  	                     	                var obj = Ext.decode(resp.responseText);
	          		  	                     	            	var success = obj.success;
	          		                                   			   if(success){
	          		                                   				   utils.show_msg("成功设置不展示商品数量："+ sels.length);
	          		                                 				   me.store.load({params: {start:0, limit: me.pageSize}});
	          		                                   			   }else{
	          		                                   				   utils.show_msg(obj.msg);
	          		                                   			   }
	          			  	                       		     } ,
	          			  	                       		     failure: function(resp, otps){
	          			                      	            	utils.show_msg("设置不展示商品失败!");
	          			                      	             }
	          			  	                       		});
        		                   				    }
        		                   				}); 
      	                      		   }else{
      	                      			   	 utils.show_msg("请选择要设置的不展示商品~");
      	                      		 }
      		                   				   
      	                       }
      	                    },
      	                  {text: '批量可下单', icon: 'static/libs/icons/lock_add.png', width: 100,
      	                        handler : function(){
                     				    	 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
                     				    	 if(sels && sels.length > 0){
      	                 				    	var  offIds = new Array();
      	                 				    	for(var i = 0 ; i< sels.length ; i++){
//      	                 				    		var productTypeGroupId = sels[i].data.product_type_group_id;
//      		     	                       		 	if(productTypeGroupId == 1  || productTypeGroupId == 2 || productTypeGroupId == 3){//非充值类商品
//      		     	                       		 	    	utils.show_msg("请选择充值类商品操作 批量可下单哦!");
//      		     	                       		 	    	return false;
//      		     	                       		 	}
      	                 				    		offIds[i] = sels[i].data.product_id;
      	                 				    	}
      	                 				    	Ext.MessageBox.confirm('导出框', '确定商品批量可下单？', function(btn) {  
        		                   				    if(btn == 'yes'){
        		                   				     Ext.Ajax.request({
          		  	                     	             url: URLS.ENABLE_ORDER_GET,
          		  	                     	             params: {"offIds":offIds},
          		  	                     	             method : "POST",
          		  	                     	             success: function(resp, opts){
          		  	                     	                var obj = Ext.decode(resp.responseText);
          		  	                     	            	var success = obj.success;
          		                                   			   if(success){
          		                                   				   utils.show_msg("商品批量可下单成功,共可下单数量："+ sels.length);
          		                                 				   me.store.load({params: {start:0, limit: me.pageSize}});
          		                                   			   }else{
          		                                   				   utils.show_msg(obj.msg);
          		                                   			   }
          	                         	            	
          			  	                       		     } ,
          			  	                       		     failure: function(resp, otps){
          			                      	            	utils.show_msg("可下单失败，请重试!");
          			                      	             }
          			  	                       		});
        		                   				    }
        		                   				}); 
      	                      		   }else{
      	                      			   	 utils.show_msg("请选择批量可下单的商品哦!");
      	                      		 }
      	                       }
      	                    },
      	                    {text: '批量不可下单', icon: 'static/libs/icons/lock_delete.png',width: 100,
      	                        handler : function(){
                     				    	 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
                     				    	 if(sels && sels.length > 0){
      	                 				    	var  offIds = new Array();
      	                 				    	for(var i = 0 ; i< sels.length ; i++){
//      	                 				    		var productTypeGroupId = sels[i].data.product_type_group_id;
//      		     	                       		 	if(productTypeGroupId == 1  || productTypeGroupId == 2 || productTypeGroupId == 3){//非充值类商品
//      		     	                       		 	    	utils.show_msg("请选择充值类商品操作 批量不可下单哦!");
//      		     	                       		 	    	return false;
//      		     	                       		 	}
      	                 				    		offIds[i] = sels[i].data.product_id;
      	                 				    	}
      	                 				    	
      	                 				     var isOrderWin = null;
      	                       		         if(!isOrderWin){
      	                       		        	 isOrderWin = new Ext.Window({//加载窗体
      	                       		                 layout:'fit',
      	                       		                 width:400,
      	                       		                 height:200,
      	                       		                 plain: true,
      	                       		                 items: new Ext.FormPanel({//加载form表单
      	                       		                 labelWidth: 100, // label settings
      	                               		               frame:true,
      	                               		               title: '填写不可下单原因窗体',
      	                               		               bodyStyle:'padding:5px 5px 0',
      	                               		               width: 350,
      	                               		               defaults: {width: 230},
      	                               		               defaultType: 'textfield',
      	                               		               items: [
      	                               		                     {
      	                               		                       fieldLabel: '不可下单原因',
      	                               		                       id : "unorder_reason",
      	                               		                       name: 'unorder_reason',
      	                               		                       value : "",
      	                               		                       allowBlank:false
      	                               		                   }
      	                               		               ]
      	                       		                 }) ,
      	                       		         buttons: [{
	      	                                          text:'保存批量不可下单',
	      	                                          handler : function(){
	      	                                        	  if(Ext.getCmp("unorder_reason").isValid()){
	      	                                        		  	var unorder_reason = Ext.getCmp("unorder_reason").getValue();
			        	  	                       			    Ext.Ajax.request({
			        		  	                     	             url: URLS.UNABLE_ORDER_GET,
			        		  	                     	             params: {"offIds":offIds,"unorder_reason":unorder_reason},
			        		  	                     	             method : "POST",
			        		  	                     	             success: function(resp, opts){
			        		  	                     	                var obj = Ext.decode(resp.responseText);
			        		  	                     	            	var success = obj.success;
			        		                                   			   if(success){
			        		                                   				   isOrderWin.close();
			        		                                   				   utils.show_msg("商品批量不可下单成功,共不可下单数量："+ sels.length);
			        		                                 				   me.store.load({params: {start:0, limit: me.pageSize}});
			        		                                   			   }else{
			        		                                   				   utils.show_msg(obj.msg);
			        		                                   			   }
			        	                         	            	
			        			  	                       		     } ,
			        			  	                       		     failure: function(resp, otps){
			        			                      	            	utils.show_msg("不可下单失败，请重试!");
			        			                      	             }
		        			  	                       			});
	      	                                        	  }
	      	                                          }
      	                       		         		},{
	      	                                          text: '取消',
	      	                                          handler: function(){
	      	                                        	isOrderWin.close();
	      	                                          }
      	                                       }]
      	                       		          });
      	                       		         }
      	                       		    isOrderWin.show(this);
      	                      		   }else{
      	                      			   	 utils.show_msg("请选择批量不可下单的商品哦!");
      	                      		 }
      	                       }
      	                    },
      	                    {xtype : "button", text : "批量操作", icon : "static/libs/icons/arrow_switch.png", width : 100, handler : function(){
      	                	   var selects = me.getSelectionModel().getSelections();// 获取选择的记录
      	                	   if(selects.length == 0){
      	                		   utils.show_msg("请选择要批量操作的数据");
      	                		   return;
      	                	   }
      	                	   var products = [];
      	                	   for(var i = 0; i < selects.length; i++){
      	                		   var select = selects[i];
      	                		   var o = {product_id : select.data.product_id};
      	                		   products.push(o);
      	                	   }
      	                	   var win = me.create_batch_opration_win(products);
      	                	   win.show();
      	                   }},{},
      	                   {xtype: 'label', text: '是否可下单： '},
   			               {xtype: 'combo', width: 85, mode: 'local', triggerAction: 'all', forceSelection: true, editable: true,
   		                     emptyText: '是否可下单', name: 'is_order', id : "is_order",  hiddenName: 'title', displayField: 'name', valueField: 'value',
   		                     store: new Ext.data.JsonStore({
	   		                     fields : ['name', 'value'],
	   		                     data   : [
		                               {name : '是',  value: '1'},
		                               {name : '否',   value: '0'}
	   		                     ]
   		                     })
   			               },
   			               
   			               /*************************标记****************************/
   			               
   			               {xtype: 'label', text: '账号： '},
						   {xtype: 'textfield',width: 80, id: 'game_login_id',name: 'game_login_id'},
   			               {xtype: 'label', text: '是否推荐： '},
   			               {xtype: 'combo', width: 85, mode: 'local', triggerAction: 'all', forceSelection: true, editable: true,
   			            	   emptyText: '是否推荐', name: 'is_recommended', id : "is_recommended",  hiddenName: 'title', displayField: 'name', valueField: 'value',
   			            	   store: new Ext.data.JsonStore({
   			            		   fields : ['name', 'value'],
   			            		   data   : [
   			            		             {name : '是',  value: '1'},
   			            		             {name : '否',   value: '0'}
   			            		             ]
   			            	   })
   			               },
   			               {xtype : "label", text : "单价:"},
   			               {xtype : "numberfield", width : 80, id : me.__make_id("single_price_from"), emptyText : "金额单位元",  style : {'text-align' : 'left'}},
   			               {xtype : "label", text : " 到"},
   			               {xtype : "numberfield", width : 80, id : me.__make_id("single_price_to"),  emptyText : "金额单位元", style : {'text-align' : 'left'}},
   			             
   			               {xtype: 'label', text: ' 渠道 ： '},
  	 		               {width: 100, mode: 'local', triggerAction: 'all', forceSelection: true,editable: true,fieldLabel: '渠道选择',
  		                    emptyText:	'渠道选择',name: 'channel_name', id :"channel_id",
  		                    xtype: 'combo', hiddenName:'title', displayField: 'channel_name',valueField:'channel_id',
  		                    store : me.channelStore
  		                   },
  			               {text: "<font size = 2  color='red'>搜索</font>", width: 70, icon: 'static/libs/icons/zoom.png',
	  	                        handler : function(){
	  	                        	me.load_data();
	  	                        }
 			              },
 			             {text: "<font color='blue'>导出数据</font>", width: 100,icon: 'static/libs/icons/application_go.png',
    	                        handler : function(){
    	                        	// 商品编号
    						        var product_id = Ext.getCmp('product_id').getValue();
    						        // 商品组编号
    						        var product_group_id = Ext.getCmp('product_group_id').getValue();
    						        // 卖家UID
    						        var seller_uid = Ext.getCmp('seller_uid').getValue();
    						        // 起创建时间
    						        var date_from = Ext.getCmp('date_from').getValue();
    						        // 始创建时间
    						        var date_to = Ext.getCmp('date_to').getValue();
    						        // 子渠道编号
    						        var sub_channel = Ext.getCmp('sub_channel').getValue();
    						        // 商品状态
    						        var status = Ext.getCmp('status').getValue();
    						        // 游戏
    						        var game_id = Ext.getCmp('game_id').getValue();
    						        // 游戏区服
    						        var partition_id = Ext.getCmp('partition_id').getValue();
    						        // 交易模式
    						        var trade_mode = Ext.getCmp('trade_mode').getValue();
    						        // 一级分类
    						        var product_type_group_id = Ext.getCmp('product_type_group_id').getValue();
    						        //是否可下单
    						        var is_order = Ext.getCmp('is_order').getValue();
    						        //单价
    						        var single_price_from = me.__get_cmp("single_price_from").getValue();
    					            var single_price_to = me.__get_cmp("single_price_to").getValue();
    					            //渠道
    						        var channel_id = Ext.getCmp('channel_id').getValue();
    						        //二级分类
//      						        var product_type_id = Ext.getCmp('product_type_id').getValue();
    						        //加载条件参数查询....
    						        if(product_id == "" && product_group_id == "" && seller_uid == "" && date_from == "" && date_to == ""
    						        	&& sub_channel == "" && status == "" && game_id == "" && partition_id == ""
    						        	&& trade_mode == "" && product_type_group_id == "" && single_price_from == "" && single_price_to == ""
    						        	&& is_order == "" && channel_id == ""){
    						        	 utils.show_msg('查询条件为空!请重新查询后再导出商品数据哦!');
    							            		return false;
    						           }
    						        	 
    						        Ext.MessageBox.confirm('导出框', '确定要导出商品数据？', function(btn) {  
    		                   				    if(btn == 'yes'){
    		                   				    	Ext.Msg.wait('提示','正在处理数据中...请稍候哦！');
    		                   				    	
    			                                   	 Ext.Ajax.request({
    			                                   		    url: URLS.EXPORT_GET,
    			                                   		    waitMsg: '正在导出数据中哦...',
    			                                   		    timeout:0,
    				                                   		params: {'product_id':product_id,'product_group_id': product_group_id,'seller_uid': seller_uid,'date_from': date_from ,
    							        						     'date_to': date_to,'sub_channel': sub_channel,'status': status,'product_type_group_id':product_type_group_id,
    							        						     'game_id': game_id,'partition_id': partition_id,'trade_mode': trade_mode,'single_price_from':single_price_from,
    							        						     'single_price_to':single_price_to,'is_order':is_order,'channel_id':channel_id
    							        						  },
    			                                   		   success: function(resp,otps){
    			                                   			   var obj = Ext.decode(resp.responseText);
    			                                   			   var isExportSuccess = obj.isExportSuccess;
    			                                   			   if(isExportSuccess){
    			                                   				  Ext.Msg.hide(); 
    			                                   				  utils.show_msg("导出成功!");
    			                                   				  window.location.href = obj.fileUrl;
    			                                   				
    			                                   			   }else{
    			                                   				 utils.show_msg(obj.msg);
    			                                   			   }
    			                                   		   },
    			                                   		   failure : function(resp ,otps){
    			                                   			   utils.show_msg("导出失败!");
    			                                   		   }
    			                                   		});  			 
    		                   				    }
    		                   				}); 
    	                        }
    	                    },
    	                    {xtype : "button", text : "批量推荐", icon : "static/libs/icons/heart_add.png", width : 100, handler : function(){
       	                	   var selects = me.getSelectionModel().getSelections();// 获取选择的记录
       	                	   if(selects.length == 0){
       	                		   utils.show_msg("请选择要批量操作的数据");
       	                		   return;
       	                	   }
       	                	   var productIds = new Array();
       	                	   for(var i = 0; i < selects.length; i++){
       	                		   var select = selects[i];
       	                		   productIds[i] = "'"+select.data.product_id+"'";
       	                	   }
	       	                	Ext.MessageBox.confirm('批量推荐', '推荐商品的前提是该商品处于出售中状态，确定要批量推荐商品吗？', function(btn) {  
		       	     			    if(btn == 'yes'){
		       	     			     Ext.Ajax.request({
		       	            	             url: URLS.EXECUTE_RECOMMEND_GET,
		       	            	             params: {"productIds":productIds},
		       	            	             method : "POST",
		       	            	             success: function(resp, opts){
		       	            	                var obj = Ext.decode(resp.responseText);
		       	            	            	var success = obj.success;
		       	                    			   if(success){
		       	                    				   utils.show_msg(obj.msg);
		       	                    				   me.store.reload();
		       	                    			   }else{
		       	                    				   utils.show_msg(obj.msg);
		       	                    			   }
		       	              		     } ,
		       	              		     failure: function(resp, otps){
		       	           	            	utils.show_msg("批量推荐商品失败!");
		       	              		     }
		       	                  		});
		       	     			    }
		       	     			}); 
       	                   }},
							{xtype : "button", text : "批量取消推荐", icon : "static/libs/icons/heart_delete.png", width : 100, handler : function(){
       	                	   var selects = me.getSelectionModel().getSelections();// 获取选择的记录
    	                	   if(selects.length == 0){
    	                		   utils.show_msg("请选择要批量操作的数据");
    	                		   return;
    	                	   }
    	                	   var productIds = new Array();
    	                	   for(var i = 0; i < selects.length; i++){
    	                		   var select = selects[i];
    	                		   productIds[i] = "'"+select.data.product_id+"'";
    	                	   }
    	                	   Ext.MessageBox.confirm('取消批量推荐', '确定要批量取消推荐商品吗？', function(btn) {  
	    	           	    		if(btn == 'yes'){
	    	           	    			Ext.Ajax.request({
	    	           	    				url: URLS.CANCEL_RECOMMEND_GET,
	    	           	    				params: {"productIds":productIds},
	    	           	    				method : "POST",
	    	           	    				success: function(resp, opts){
	    	           	    					var obj = Ext.decode(resp.responseText);
	    	           	    					var success = obj.success;
	    	           	    					if(success){
	    	           	    						utils.show_msg(obj.msg);
	    	           	    						me.store.reload();
	    	           	    					}else{
	    	           	    						utils.show_msg(obj.msg);
	    	           	    					}
	    	           	    				} ,
	    	           	    				failure: function(resp, otps){
	    	           	    					utils.show_msg("批量取消推荐商品失败!");
	    	           	    				}
	    	           	    			});
	    	           	    		}
	    	           	    	}); 
							}}
	  	              ]}
            		]
            	}),
                listeners:  {
                    afterrender : function(p){
                    	//按照顺序加载相应的store groupStore->tradModeStore->store, 保证商品列表渲染的时候相应的store已经加载完毕
                        me.load_store();
                    }
                }
            });
        },
        load_store : function(){
        	var me = this;
        	//商品一级分类store
        	this.groupStore.on("load", function(s){
        		//商品交易模式store
        		me.tradModeStore.on("load", function(){
        			//渠道
        			me.channelStore.on("load", function(){
            			//加载商品列表
            			me.load_data();
            		});
            		me.channelStore.load();
        		});
        		me.tradModeStore.load();
        	
        	});
        	this.groupStore.load();
        },
	    load_data : function(){
	    	this.store.load({params: {start:0, limit: this.pageSize}});
	    },
	    create_batch_opration_win : function(select_product_id){
	    	var me = this;
	    	var win = new fw.FormWindowUi({width : 300, height : 260, title : "批量操作" });
	    	win.addItem({xtype : "label",  html : "已经选择的商品数据<font color='red'>"+select_product_id.length+"</font>条"});
	    	win.addItem({xtype : "combo", fieldLabel : "交易模式",  hiddenName: "trade_mode", allowBlank: true, width : 150, triggerAction: 'all',
                typeAhead : true, mode : "remote", emptyText : "不更改",
                valueField: "value", displayField: "name",
                id : me.__make_id("bo_trade_mode"),
                store : new Ext.data.JsonStore({
                    url : utils.build_url("commonHelper/readTradModeList"),
                    fields : [{name : "name"},{name : "value"}],
                    root : "data"
                }),
                listeners: {
                    render: function(combo){
                        combo.store.load();
                    }
                }
            });
	    	win.addItem({xtype : "numberfield", fieldLabel : "库存", emptyText : "不更改", width : 150, id : me.__make_id("batch_op_stock")});
	    	win.onClickSubmit = function(){
	    		var trade_mode = me.__get_cmp("bo_trade_mode").getValue();
	    		var stock = me.__get_cmp("batch_op_stock").getValue();
	    		if(trade_mode == "" && stock == ""){
	    			utils.show_msg("请填写要批量修改的信息");
	    			return false;
	    		}
	    		var url = utils.build_url("adminProduct/batchOperation");
	    		var data = Ext.util.JSON.encode(
	    			{trade_mode : trade_mode, stock : stock}
	    		);
	    		console.log(data);
	    		var products = Ext.util.JSON.encode(select_product_id);
	    		win.submit(url, {data : data, products : products});
	    	}
	    	win.onSubmitSuccess = function(json){
	    		me.load_data();
	    		utils.show_msg(json.msg);
	    	}
	    	return win;
	    },
	    batch_execute_recommend_handler : function(productIds){
	    	Ext.MessageBox.confirm('批量推荐', '确定要批量推荐商品吗？', function(btn) {  
			    if(btn == 'yes'){
			     Ext.Ajax.request({
       	             url: URLS.EXECUTE_RECOMMEND_GET,
       	             params: {"productIds":productIds},
       	             method : "POST",
       	             success: function(resp, opts){
       	                var obj = Ext.decode(resp.responseText);
       	            	var success = obj.success;
               			   if(success){
               				   me.store.reload();
               			   }else{
               				   utils.show_msg(obj.msg);
               			   }
         		     } ,
         		     failure: function(resp, otps){
      	            	utils.show_msg("批量推荐商品失败!");
         		     }
             		});
			    }
			}); 
	    },
	    batch_cancel_recommend_handler : function(productIds){
	    	Ext.MessageBox.confirm('取消批量推荐', '确定要批量取消推荐商品吗？', function(btn) {  
	    		if(btn == 'yes'){
	    			Ext.Ajax.request({
	    				url: URLS.EXECUTE_RECOMMEND_GET,
	    				params: {"productIds":productIds},
	    				method : "POST",
	    				success: function(resp, opts){
	    					var obj = Ext.decode(resp.responseText);
	    					var success = obj.success;
	    					if(success){
	    						utils.show_msg(obj.msg);
	    						me.store.reload();
	    					}else{
	    						utils.show_msg(obj.msg);
	    					}
	    				} ,
	    				failure: function(resp, otps){
	    					utils.show_msg("批量取消推荐商品失败!");
	    				}
	    			});
	    		}
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

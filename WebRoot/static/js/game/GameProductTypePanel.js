define(function(require, exports, module){
	var utils = require("../utils.js");
    var gpt = require("./GameProductTypeEditWindow.js");
    var gsw = require("./GameSelectWindow.js");
    var tw = require("./TemplateWindow.js");
    
	var GameProductTypePanel = Ext.extend(Ext.grid.EditorGridPanel, {
		__make_id : function(name){
            return "GameProductTypePanel:" + name;
        },

        __get_cmp: function(name){
            return Ext.getCmp(this.__make_id(name));
        },

		constructor: function(collap_conf, game_id){
			collap_conf = collap_conf || {};
			this.game_id = game_id;
			var me = this;
			this.sm = new Ext.grid.CheckboxSelectionModel();
			this.record_fields = Ext.data.Record.create([
				{name: "product_type_group_id"},
				{name: "product_type_group_name"},
				{name: "product_type_id"},
				{name: "product_type_name"},
				{name: "sc_whitelist_add_flag"},
				{name: "dc_white_list_check_flag"},
				{name: "channel_id"},
				{name: "weight"},
				{name: "type_name"},
				{name: "unit"},
				{name: "max_ratio"},
				{name: "min_ratio"},
				{name: "is_audit"},
				{name: "is_publish"},
				{name: "auto_assign"},
				{name: "quota"},
				{name: "is_chat"},
				{name: "template_id"},
				{name: "template_name"},
				{name: "sub_id"},
				{name: "sub_game_name"},

				{name: "alldata"},
				{name: "collapsing"}, //这是一个伪字段，用于控制“其它信息汇总”字段的展开和收起
			]);
			this.store = new Ext.data.JsonStore({
				root: "data",
                fields: this.record_fields
			});

			GameProductTypePanel.superclass.constructor.call(this, {
				autoHeight: true,
				loadMask : true,
                stripeRows : true,
                clicksToEdit: 1,
                columnLines: true,
                view: new Ext.grid.GridView({
                    forceFit: true,
                    enableRowBody: true,
                }),
                sm: this.sm,
                store: this.store,
				tbar: [
					{xtype: "button", text: "添加游戏商品分类", icon: "static/libs/icons/add.png", width: 80, handler: function(){
						var win = new gpt.GameProductTypeEditWindow(me.game_id);
						win.opMethod = "add";  //标识方法为新增
						win.get_product_channels = me.get_product_channels;
						win.onAccept = function(data){
							//填充到gridpanel中
							var record = me._build_record(data, new me.record_fields());
							var store_records = me.store.getRange();
							// 默认为true 向store中添加数据
							var flag = true;
							for(var i = 0; i<store_records.length; i++){
								var store_record = store_records[i];
								//如果record数据已经存在的话，将不在add数据到store中
								if(record.get("id") == store_record.get("id")){
									//如果是已经存在的
									me._build_record(data, store_record);
									flag = false;
								}
							}
							if(flag){
								me.store.add([record]);
								//刷新统计数据
								me.refresh_info();
							}
							
						}
						win.show();
					}},
					{xtype: "label", html: "<font color='red'>(双击表格每行可进行编辑)</font>"},
					'-',
					{xtype: "button", text: "删除游戏商品分类", icon: "static/libs/icons/delete.png", width: 80, handler: function(){
						var records = me.getSelectionModel().getSelections();
						if(records.length == 0){
							utils.show_msg("请先选择需要删除的游戏商品分类配置");
							return;
						}
//						var select_num = records.length;
						utils.show_confirm("【不可撤销操作】<font color= 'red'>删除后不能上对应分类和渠道的商品,前台商品列表中也筛选不出这些商品哦</font>？", function(){
							var data = [];
							//收集要删除的数据
							for(var i=0; i<records.length; ++i){
								var record = records[i];
								data.push({
									game_id : me.game_id,
									product_type_id : record.get("product_type_id"),
									sub_id : record.get("sub_id"),
								});
							}
							var json = Ext.util.JSON.encode(data);
							utils.http_request(utils.build_url("gameProductType/deleteProductType"), {data: json}, function(json){
								if(json.success){
									//后台删除操作完成，删除页面的数据
									for(var i=0; i<records.length; ++i){
										me.store.remove(records[i]);

										//刷新统计数据
										me.refresh_info();
									}
								}
                            })
						})
					}}
				],
				columns: [
					this.sm,
					new Ext.grid.RowNumberer(),
                    {header:"商品大类", dataIndex:"product_type_group_name", align:"center", width:20, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	if(record.get("new_row")){
                    		return "<font color='green'>"+value+"</font>";
                    	}
                    	return value;
                    }},
                    {header:"商品类型", dataIndex:"product_type_name", align:"center", width:20, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	if(record.get("new_row")){
                    		return "<font color='green'>"+value+"</font>";
                    	}
                    	return value;
                    }},
                    {header:"首充白名单", dataIndex:"sc_whitelist_add_flag", align:"center", width:10, renderer : function(value, metaData, record, rowIndex, colIndex, store){
						return value==0 ? "不添加" : "添加";
                    }},
                    {header:"代充白名单", dataIndex:"dc_whitelist_check_flag", align:"center", width:10, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	return value==0 ? "不查验" : "查验";
                    }},
                    {header:"商品渠道", dataIndex:"channel_name", align:"center", width:20, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	return value == "" ||value == undefined ? "无" : value;
                    }},
                    {header:"游戏版本", dataIndex:"sub_game_name", align:"center", width:15, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	return value == "" ||value == undefined ? "" : value;
                    }},
                    {header:"权重", dataIndex:"weight", align:"center", width:10},
                    {header:"单位", dataIndex:"unit", align:"center", width:10},
                    {header:"单价最低比例", dataIndex:"min_ratio", align:"center", width:10},
                    {header:"单价最高比例", dataIndex:"max_ratio", align:"center", width:10},
                    {header:"审核方式", dataIndex:"is_audit", align:"center", width:10, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	if(value == 0) return "不审核";
                    	if(value == 1) return "审核";
                    }},
                    {header:"是否支持发布", dataIndex:"is_publish", align:"center", width:10, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	if(value == 1) return "是";
                    	if(value == 0) return "否";
                    }},
                    {header:"限购件数", dataIndex:"quota", align:"center", width:10},
                    {header:"是否支持聊天", dataIndex:"is_chat", align:"center", width:10, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	if(value == 1) return "是";
                    	if(value == 0) return "否";
                    }},
                    {header:"当前模版", dataIndex:"template_name", align:"center", width:10},
                ],
                listeners: {
                	rowdblclick: function(grid, rowIndex, e){
                		var record = grid.store.getAt(rowIndex);
                		var win = new gpt.GameProductTypeEditWindow(me.game_id);
                		win.opMethod = "edit";
						win.get_product_channels = me.get_product_channels;
						win.onAccept = function(data){
							me._build_record(data, record);
						}
						win.set_data(record.get("alldata"));
						win.show();
                	},
                	render: function(p){
                        //tbar2
                        var tbar2 = new Ext.Toolbar({
                        	items: [
	                        	{xtype: "button", text: "从其它游戏复制(<font color='red'>过滤含子游戏记录</font>)", icon: "static/libs/icons/page_copy.png", width: 80, handler: function(){
	                        		var win = new gsw.GameSelectWindow({
	                        			singleSelect: true,
	                        		});
	                        		win.onAccept = function(games){
	                        			if(games.length == 0){
		                                	win.close();
		                                	return;
		                                }

	                                    var game_id = games[0].game_id;
	                                    //获取游戏商品类型列表
	                                    utils.http_request(utils.build_url("gameProductType/getGameProductInfo"), {game_id: game_id}, function(json){
			                                var product_info_select = json.data;
			                                var product_info = [];
			                                var records = me.store.getRange();
			                                for(var i = 0; i < product_info_select.length; i++){
			                                	var info = product_info_select[i];
			                                	//设置一个标记，true 通过复制
			                                	var flag = true;
			                                	for(var j =0; j < records.length; j++ ){
			                                		//如果已经存在的商品类型，过滤掉，不进行复制
			                                		if(info.base_info.product_type_group_id == records[j].get("product_type_group_id") && info.base_info.product_type_id == records[j].get("product_type_id")){
			                                			flag = false;
			                                			break;
			                                		}
			                                	}
			                                	//子ID不空，直接跳过，因为不知道复制哪一个
			                                	if(flag && info.base_info.sub_id === 0){
			                                		product_info.push(info);
			                                	}
			                                }
			                                if(product_info.length <= 0) {
			                                	win.close();
				                                utils.show_msg("符合复制的商品类型为0条，复制退出");
			                                }
			                                //清除被复制的游戏id 和id
			                                me._clear_info(product_info);
			                                for(var i = 0;i<product_info.length; i++){
			                                	//复制新增数据，标记下，用来改变行的颜色
			                                	product_info[i].base_info.new_row = true;
			                                }
			                                //保存从游戏中复制的游戏商品类型信息
			                                var json = Ext.util.JSON.encode(product_info);
			                                var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "保存中，这可能需要一点时间..." });
			                                myMask.show();
			                                utils.http_request(utils.build_url("gameProductType/addProductTypeFormCopyGame"),{data : json}, function(json){
			                                	var data = json.data;
			                                	me.set_data(data);
				                                win.close();
				                                myMask.hide();
			                                },function(json){
			                                	myMask.hide();
			                                });
			                                
			                            });
	                        		}
				                    win.show();
								}},
								'-',
								{xtype: "button", text: "复制当前选中行", icon: "static/libs/icons/page_copy.png", width: 80, handler: function(){
									var records = me.getSelectionModel().getSelections();
									if(records.length == 0)
										return;
									if(records.length > 1){
										utils.show_msg("请选择一条数据");
										return;
									}
									var data = records[0].get("alldata");
									data.base_info.id = "";
									var win = new gpt.GameProductTypeEditWindow(me.game_id);
									win.opMethod = "copy";
									win.get_product_channels = me.get_product_channels;
									win.onAccept = function(data){
										//填充到gridpanel中
										var record = me._build_record(data, new me.record_fields());
										var store_records = me.store.getRange();
										// 默认为true 向store中添加数据
										var flag = true;
										for(var i = 0; i<store_records.length; i++){
											var store_record = store_records[i];
											//如果record数据已经存在的话，将不在add数据到store中
											if(record.get("id") == store_record.get("id")){
												//已经存在，表示为修改保证，不添加数据
												me._build_record(data, store_record);
												flag = false;
											}
										}
										if(flag){
											me.store.add([record]);
											//刷新统计数据
											me.refresh_info();
										}
										
									}
									win.set_data(data);
									win.setTitle("复制商品大类");
									win.show();
								}},
								'-',
			                    {xtype: "button", text: "模版管理", icon: "static/libs/icons/application_xp.png", style: "border: solid 1px gray;", width: 100, height: 40, handler: function(){
			                        var win = new tw.TemplateWindow(me.game_id);
			                        win.onApply = function(tmpl_id){
			                            me.sync_tmpl(tmpl_id);
			                        }
			                        win.show();
			                    }},
			                    '-',
			                    "选择模板：",
			                    {id: me.__make_id("sel_tmpl"), xtype: "combo", width: 150, triggerAction: 'all', height: 40, editable: false, typeAhead : true, editable: false, model:"remote", displayField: "name", valueField: "id",
			                    store: new Ext.data.JsonStore({
			                        url: utils.build_url("gameProductTypeTempl/getList"),
			                        root: "data",
			                        fields: [
			                            {name: "id"}, {name: "name"}
			                        ],
			                        listeners: {
			                            beforeload: function(s){
			                                s.baseParams.game_id = me.game_id;
			                            }
			                        }
			                    }), listeners: {
			                        beforequery: function(qe){
			                            delete qe.combo.lastQuery;
			                        },
			                        render: function(qe){
			                            qe.store.load();
			                        },
			                    }},
			                    {xtype: "button", text: "应用到商品分类", width: 100, height: 40, style: "border: solid 1px gray;", icon: "static/libs/icons/application_form_edit.png", handler: function(){
			                        var tmpl_id = me.__get_cmp("sel_tmpl").getValue();
			                        if(tmpl_id == ""){
			                            utils.show_msg("请先选择模板再应用到商品分类");
			                            return;
			                        }

			                        var sels = me.getSelectionModel().getSelections();
			                        if(sels.length == 0){
			                            utils.show_msg("请先选择商品分类后再应用模板");
			                            return;
			                        }
			                        //api商品分类不使用模版
			                        for(var i = 0; i<sels.length; i++){
			                        	var sel = sels[i];
			                        	if(sel.data.is_api == 1){
			                        		utils.show_msg("请选择不支持api的商品分类");
			                        		return;
			                        	}
			                        }
			                        utils.show_confirm("确定将模板应用到当前选中的商品分类?", function(){
			                            me.apply_tmpl(tmpl_id);
			                        });
			                    }}
                        	]
                        });
                        tbar2.render(p.tbar);
                    }
                }
			});
		},
		_clear_info : function(product_info){
			var me = this;
			//在复制的时候将一些信息清除
			for(var i = 0;i<product_info.length; i++){
				var info = product_info[i];
				info.base_info.id = "";
				info.base_info.game_id = me.game_id;
				info.base_info.sub_id = 0;
            	//清除 扩展信息
            	var ext_info = info.ext_info;
            	for(var j = 0; j<ext_info.length; j++){
            		ext_info[j].id = "";
            		ext_info[j].game_id = me.game_id;
            	}
            	//商品信息
            	var prod_info = info.prod_info;
            	for(var j = 0; j<prod_info.length; j++){
            		prod_info[j].id = "";
            		prod_info[j].game_id = me.game_id;
            	}
            	//卖家信息
            	var seller_info = info.seller_info;
            	for(var j = 0; j<seller_info.length; j++){
            		seller_info[j].id = "";
            		seller_info[j].game_id = me.game_id;
            	}
            	//购买信息
            	var buy_info = info.buy_info;
            	for(var j = 0; j<buy_info.length; j++){
            		buy_info[j].id = "";
            		buy_info[j].game_id = me.game_id;
            	}
            	//自定义提示信息
            	var tip_info = info.tip_info;
            	for(var j = 0; j<tip_info.length; j++){
            		tip_info[j].id = "";
            		tip_info[j].game_id = me.game_id;
            	}
            	//复制新增数据，标记下，用来改变行的颜色
            	info.base_info.new_row = true;
            }
		},
		_build_record: function(data, record){
			record.set("id", data.base_info.id);
			record.set("product_type_group_id", data.base_info.product_type_group_id);
			record.set("product_type_group_name", data.base_info.product_type_group_name);
			record.set("product_type_id", data.base_info.product_type_id);
			record.set("product_type_name", data.base_info.product_type_name);
			record.set("sc_whitelist_add_flag", data.base_info.sc_whitelist_add_flag);
			record.set("dc_whitelist_check_flag", data.base_info.dc_whitelist_check_flag);
			record.set("channel_id", data.base_info.channel_id);
			record.set("channel_name", data.base_info.channel_name);
			record.set("weight", data.base_info.weight);
			record.set("type_name", data.base_info.type_name);
			record.set("unit", data.base_info.unit);
			record.set("max_ratio", data.base_info.max_ratio);
			record.set("min_ratio", data.base_info.min_ratio);
			record.set("is_audit", data.base_info.is_audit);
			record.set("is_publish", data.base_info.is_publish);
			record.set("is_api", data.base_info.is_api);
			record.set("quota", data.base_info.quota);
			record.set("is_chat", data.base_info.is_chat);
			record.set("discount", data.base_info.discount);
			record.set("sub_channel", data.base_info.sub_channel);
			record.set("trade_mode", data.base_info.trade_mode);
			record.set("new_row", data.base_info.new_row);
			record.set("template_id", data.base_info.template_id);
			record.set("template_name", data.base_info.template_name);
			record.set("sub_id", data.base_info.sub_id);
			record.set("sub_game_name", data.base_info.sub_game_name);
			
			record.set("alldata", data);
			return record;
		},

		//to be implemented, for GameProductTypeEditWindow
		get_product_channels: function(){
		},

		get_data: function(){
			var data = [];
			var records = this.store.getRange();
			for(var i=0; i<records.length; ++i){
				data.push(records[i].get("alldata"));
			}
			return data;
		},

		set_data: function(product_info, reset_data){
			var records = [];
			for(var i=0; i<product_info.length; ++i){
				var data = product_info[i];
				
				//如果需要重置数据，将某些敏感数据重置
				if(reset_data){
					//置空渠道
					data.base_info.product_channel_display = "无";
					data.base_info.product_channel = 0;
				}
				var record = this._build_record(data, new this.record_fields());
				records.push(record);
			}

			//增加排序展示方式，按照“商品大类”排好序再add到store中，方便查看
			records = this._sort_records(records);

			this.store.add(records);
			//刷新统计数据
			this.refresh_info();
		},

		_sort_records: function(records){
			var rtn = [];

			var cache = {};
			for(var i=0; i<records.length; ++i){
				var key = records[i].get("game_product_group");
				if(cache[key] == undefined){
					cache[key] = [];
				}
				cache[key].push(records[i]);
			}

			for(var key in cache){
				rtn = rtn.concat(cache[key]);
			}

			return rtn;
		},

		reset: function(){
			this.store.removeAll();
        	
            this.refresh_info();
		},

		refresh_info: function(data){
			//to be implemented
		},

		_use_tmpl: function(record, data){
			var alldata = record.get("alldata");
			alldata.ext_info = data.ext_info;
			alldata.buy_info = data.buy_info;
			alldata.seller_info = data.seller_info;
			alldata.prod_info = data.prod_info;
			alldata.tip_info = data.tip_info;
			alldata.template_id = data.id;
			alldata.template_name = data.name;
			
			//同时设置到record中
			record.set("template_id", alldata.template_id);
			record.set("template_name", alldata.template_name);
		},

		//将模板数据应用到选中的商品分类
		apply_tmpl: function(template_id){
			var me = this;
			var records = me.getSelectionModel().getSelections();
			var select = [];
			for(var i=0; i<records.length; ++i){
				select.push(records[i].get("product_type_id"));
			}
			var params = {id: template_id, game_id : me.game_id, select : Ext.util.JSON.encode(select)};
			utils.http_request(utils.build_url("gameProductTypeTempl/updateGameProductTypeApplyTmpl"), params, function(json){
				
				for(var i=0; i<records.length; ++i){
					me._use_tmpl(records[i], json.data);
				}
				
				utils.show_msg("应用模板数据成功");
				me.view.refresh();
			});
			
		},

		sync_tmpl: function(template_id){
			var me = this;
			var records = me.store.getRange();
			var select = [];
			for(var i = 0; i < records.length; ++i){
				if(records[i].get("template_id") != template_id)
					continue;
				select.push(records[i].get("product_type_id"));
			}
			var params = {id: template_id, game_id : me.game_id, select : Ext.util.JSON.encode(select)};
			
			utils.http_request(utils.build_url("gameProductTypeTempl/updateGameProductTypeApplyTmpl"), params, function(json){
				var records = me.store.getRange();
				for(var i = 0; i < records.length; ++i){
					if(records[i].get("template_id") != template_id)
						continue;
					me._use_tmpl(records[i], json.data);
				}

				utils.show_msg("应用模板数据成功");
				me.view.refresh();
			});
		}
	});

	exports.GameProductTypePanel = GameProductTypePanel;
});
define(function(require, exports, module){
	var utils = require("../utils.js");
    var gpt = require("./GameKeFuProductTypeEditWindow.js");
    //var gsw = require("./GameSelectWindow.js");
    
    
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
				{name: "tmpl_id"},
				{name: "tmpl_name"},

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
                    enableRowBody: true
                }),
                sm: this.sm,
                store: this.store,
				tbar: [
					{xtype: "label", html: "<font color='red'>(双击表格每行可进行编辑)</font>"},
					'-',
				],
				columns: [
					this.sm,
					new Ext.grid.RowNumberer(),
                    {header:"商品大类", dataIndex:"product_type_group_name", align:"center", width:20, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	return value;
                    }},
                    {header:"商品类型", dataIndex:"product_type_name", align:"center", width:20, renderer : function(value, metaData, record, rowIndex, colIndex, store){
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
                    {header:"权重", dataIndex:"weight", align:"center", width:10},
                    {header:"单位", dataIndex:"unit", align:"center", width:10},
                    {header:"单价最低比例", dataIndex:"max_ratio", align:"center", width:10},
                    {header:"单价最高比例", dataIndex:"min_ratio", align:"center", width:10},
                    {header:"是否人工审核", dataIndex:"is_audit", align:"center", width:10, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	if(value == 1) return "是";
                    	if(value == 0) return "否";
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
                ],
                listeners: {
                	rowdblclick: function(grid, rowIndex, e){
                		var record = grid.store.getAt(rowIndex);
                		//不支持api弹出窗体
                		var is_api = record.data.is_api;
                		if(is_api == 1){
                			utils.show_msg('请选择不支持api的商品类型哦!');
                		}else{
                			var win = new gpt.GameKeFuProductTypeEditWindow(me.game_id);
                			win.get_product_channels = me.get_product_channels;
                			win.onAccept = function(data){
                				me._build_record(data, record);
                				
                			}
                			win.set_data(record.get("alldata"));
                			win.show();
                		}
                	},
                	render: function(p){
                        // if(collap_conf.collapsed){
                        //     p.collapse();
                        // }

                        //tbar2
                        var tbar2 = new Ext.Toolbar({
                        	items: [
	                        	{xtype: "button", text: "从其它游戏复制", icon: "static/libs/icons/page_copy.png", width: 80, handler: function(){
	                        		var win = new gsw.GameSelectWindow({
	                        			singleSelect: true,
	                        		});
	                        		win.onAccept = function(games){
	                        			if(games.length == 0){
		                                	win.close();
		                                	return;
		                                }

	                                    var game_id = games[0].gameId;
		                                var copy_game = function(clear){
		                                	if(clear){
		                                		me.store.removeAll();
		                                	}
		                                	//获取游戏信息
		                                    utils.http_request(utils.build_url("game/get_game"), {game_id: game_id}, function(json){
				                                var product_info = json.data.product_info;
				                                me.set_data(product_info, true);
				                            });
		                                }

	                                    utils.show_confirm("【不可撤销操作！】复制后是否保留现有数据？", function(){
	                                    	copy_game(false);
	                                		win.close();
	                                    }, function(){
	                                    	copy_game(true);
	                                		win.close();
	                                    })
	                        		}

				                    win.show();
								}},
								'-',
								{xtype: "button", text: "复制当前选中行", icon: "static/libs/page_copy.png", width: 80, handler: function(){
									var records = me.getSelectionModel().getSelections();
									if(records.length == 0)
										return;

									for(var i=0; i<records.length; ++i){
										var data = records[i].get("alldata");
										var nr = new me.record_fields();
										me._build_record(data, nr);
										me.store.add([nr]);
									}
										
									//刷新统计数据
									me.refresh_info();
								}}
                        	]
                        });
                        //tbar2.render(p.tbar);
                    }
                }
			});
		},
		
		_build_info_html: function(data){
			var str = "";

			//扩展信息
			var ext_info = data.ext_info;
			var ext = "";
			if(ext_info.image_url != ""){
				ext += String.format("<tr><th class='head1'>图片地址</th><td>{0}</td></tr>", ext_info.image_url);
			}
			if(ext_info.id_display != ""){
				ext += String.format("<tr><th class='head1'>ID前台展示名称</th><td>{0}</td></tr>", ext_info.id_display); 
			}
			if(ext_info.role_display != ""){
				ext += String.format("<tr><th class='head1'>角色前台展示名称</th><td>{0}</td></tr>", ext_info.role_display);
			}
			if(ext_info.account_display != ""){
				ext += String.format("<tr><th class='head1'>账号前台展示名称</th><td>{0}</td></tr>", ext_info.account_display);
			}
			if(ext_info.password_display != ""){
				ext += String.format("<tr><th class='head1'>密码前台展示名称</th><td>{0}</td></tr>", ext_info.password_display);
			}
			if(ext_info.safekey_display != ""){
				ext += String.format("<tr><th class='head1'>安全锁前台展示名称</th><td>{0}</td></tr>", ext_info.safekey_display);
			}
			if(ext_info.area_display != ""){
				ext += String.format("<tr><th class='head1'>分区前台展示名称</th><td>{0}</td></tr>", ext_info.area_display);
			}
			if(ext != ""){
				str += ext;
			}

			var inner_head = "<tr><th class='head1'>展示名称</th><th class='head1'>候选值</th><th class='head1'>权重</th></tr>";
			//自定义商品信息
			var prod_info = data.prod_info;
			var prod = "";
			for(var i=-1; i<prod_info.length; ++i){
				if(i == -1){
					prod += inner_head;
				}else{
					var el = prod_info[i];
					prod += String.format("<tr> <td class='head1'>{0}</td> <td class='head1'>{1}</td> <td class='head1'>{2}</td> </tr>", el.key, el.value, el.weight);
				}
			}
			if(prod_info.length > 0){
				str += String.format("<tr><th class='head1'>商品信息</th><td> <table border='1'>{0}</table> </td></tr>", prod);
			}

			//自定义卖家信息
			var saler_info = data.saler_info;
			var saler = "";
			for(var i=-1; i<saler_info.length; ++i){
				if(i == -1){
					saler += inner_head;
				}else{
					var el = saler_info[i];
					saler += String.format("<tr> <td class='head1'>{0}</td> <td class='head1'>{1}</td> <td class='head1'>{2}</td> </tr>", el.key, el.value, el.weight);
				}
			}
			if(saler_info.length > 0){
				str += String.format("<tr><th class='head1'>卖家信息</th><td> <table border='1'>{0}</table> </td></tr>", saler);
			}

			//自定义购买信息
			var buy_info = data.buy_info;
			var buy = "";
			for(var i=-1; i<buy_info.length; ++i){
				if(i == -1){
					buy += inner_head;
				}else{
					var el = buy_info[i];
					buy += String.format("<tr> <td class='head1'>{0}</td> <td class='head1'>{1}</td> <td class='head1'>{2}</td> </tr>", el.key, el.value, el.weight);
				}
			}
			if(buy_info.length > 0){
				str += String.format("<tr><th class='head1'>购买信息</th><td> <table border='1'>{0}</table> </td></tr>", buy);
			}

			//自定义购买信息
			var ty_info = data.ty_info;
			var ty = "";
			for(var i=-1; i<ty_info.length; ++i){
				if(i == -1){
					ty += inner_head;
				}else{
					var el = ty_info[i];
					ty += String.format("<tr> <td class='head1'>{0}</td> <td class='head1'>{1}</td> <td class='head1'>{2}</td> </tr>", el.key, el.value, el.weight);
				}
			}
			if(ty_info.length > 0){
				str += String.format("<tr><th class='head1'>退游信息</th><td> <table border='1'>{0}</table> </td></tr>", ty);
			}

			//提示信息
			var _build_msg_type = function(value){
				if(value == 11) return "(发布页)商品信息提示";
	        	if(value == 12) return "(发布页)账户信息提示";
	        	if(value == 13) return "(发布页)发布提示信息";
	        	if(value == 21) return "(详情页)商品提示信息";
	        	if(value == 31) return "支付成功页信息提示";
			}
			var tip_info = data.tip_info;
			var tip = "";
			for(var i=0; i<tip_info.length; ++i){
				var el = tip_info[i];
				tip += String.format("<tr><th class='head1'>{0}</th><td>{1}</td></tr>", _build_msg_type(el.type), utils.htmlEncode(el.message));
			}
			if(tip_info.length > 0){
				str += tip;
			}

			if(str == "")
				str = "无";
			else
				str = "<div class='product_type_info'><table style='border:1px solid; width: \"90%\"'>" + str + "</table></div>";

			return str;
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
			
			record.set("alldata", data);
			return record;
		},

		//to be implemented, for GameKeFuProductTypeEditWindow
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
			alldata.tmpl_id = data.id;
			alldata.tmpl_name = data.name;

			//同时设置到record中
			record.set("tmpl_id", alldata.tmpl_id);
			record.set("tmpl_name", alldata.tmpl_name);
		},

		//将模板数据应用到选中的商品分类
		apply_tmpl: function(tmpl_id){
			var me = this;

			utils.http_request(utils.build_url("tmpl/get_tmpl"), {id: tmpl_id}, function(json){
				var records = me.getSelectionModel().getSelections();
				for(var i=0; i<records.length; ++i){
					me._use_tmpl(records[i], json.data);
				}

				utils.show_msg("应用模板数据成功");
				me.view.refresh();
			});
			
		},

		sync_tmpl: function(tmpl_id){
			var me = this;
			utils.http_request(utils.build_url("tmpl/get_tmpl"), {id: tmpl_id}, function(json){
				var records = me.store.getRange();
				for(var i=0; i<records.length; ++i){
					if(records[i].get("tmpl_id") != tmpl_id)
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
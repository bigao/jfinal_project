define(function(require, exports, module){
	var utils = require("../utils.js");
    var xsm = require("../../com/SelectionModelRectify.js");

	var GameKeFuProductTypeEditWindow = Ext.extend(Ext.Window, {
		__make_id : function(name){
            return "GameKeFuProductTypeEditWindow:" + name;
        },

        __get_cmp: function(name){
            return Ext.getCmp(this.__make_id(name));
        },

		constructor: function(game_id){
			var me = this;
			this.game_id = game_id;
			this.base_info_panel = this.create_base_info_panel();

			this.ext_info_panel = this.create_ext_info_panel();
			this.prod_info_panel = this.create_property_panel("商品属性", "#D2E0F1", 1);
			this.saler_info_panel = this.create_property_panel("卖家信息", "#BFEFFF", 2);
			this.buy_info_panel = this.create_property_panel("购买信息", "#D2E0F1", 3);
			this.tip_info_panel = this.create_tip_panel();

			//用来判断当前窗口是否需要关闭
			this.closing = true;
			GameKeFuProductTypeEditWindow.superclass.constructor.call(this, {
				title: "客服配置商品大类",
                layout: "fit",
                autoDestroy: true,
                closable: true,
                closeAction: "close",
                resizable: true,
                modal: true,
                frame : true,
                width: 1000,
                height: 800,
				items: [{xtype: "panel", border: false, layout: "anchor", autoScroll: true, padding: 8, items: [
                    this.base_info_panel,
					this.ext_info_panel,
					this.prod_info_panel,
					this.saler_info_panel,
					this.buy_info_panel,
					this.tip_info_panel
				]}],
				listeners: {
					beforeclose: function(){
						//当操作人修改完扩展信息就直接点击关闭页面，关闭事件在组件失去焦点前，导致数据无法保存，此时不允许关闭页面
                    	if(!me.closing && me.product_type_id != undefined){
	                        utils.show_msg("有数据正在保存，请稍后关闭窗口");
	                        return false;
                    	}
                        return true;
                    },
                    show: function(p){
                    	var coord = p.getPosition(true);
                    	var x = coord[0];
                    	var y = coord[1];
                    	if(x < 0)
                    		x = 10;
                    	if(y < 0)
                    		y = 10;
                    	p.setPosition(x, y);
                    }
                }
			});
		},

		on_save: function(){
			var me = this;
    		var data = me.get_data();
    		
    		if(!me.is_valid(data)){
    			return;
    		}

    		me.onAccept(data);
		},

		//是否支持api，支持不显示扩展信息、商品属性、卖家信息、购买信息和自定义信息
		_is_api : function(value){
			if(value == 1){
				this.ext_info_panel.setVisible(false);
				this.prod_info_panel.setVisible(false); 
				this.saler_info_panel.setVisible(false);
				this.buy_info_panel.setVisible(false);
				this.tip_info_panel.setVisible(false);
			}
			else{
				this.ext_info_panel.setVisible(true);
				this.prod_info_panel.setVisible(true); 
				this.saler_info_panel.setVisible(true);
				this.buy_info_panel.setVisible(true); 
				this.tip_info_panel.setVisible(true);
			}
		},
		create_base_info_panel: function(){
			var me = this;

			var form1 = new Ext.form.FormPanel({
				border: false,
				hidden : true,
				width: 400,
				padding: 10,
				labelWidth : 150,
				
				items:[
				    {xtype : "hidden", id : me.__make_id("id")},
					//商品大类选项
					{id: me.__make_id("product_type_group"), xtype: "combo", fieldLabel: "商品大类<font color='red'>*</font>", anchor: "95%", triggerAction: 'all', typeAhead : true, editable: false, model:"remote", 
					allowBlank: false, store: new Ext.data.JsonStore({
						url: utils.build_url("adminProductTypeGroup/getList"),
						totalProperty: "total",
						root: "data",
						autoLoad : true,
						fields: [
							{name: "product_type_group_id"}, {name: "weight"}, {name: "usable"}, {name: "name"}
						],
						listeners: {
							beforeload: function(s){
								s.baseParams.page = 1;
								s.baseParams.rows = 1000;
								s.baseParams.sort = "weight";
								s.baseParams.order = "desc";
							},
							load: function(s){
								//加载完后重新设置以显示中文名称
								var combo = me.__get_cmp("product_type_group");
								combo.setValue(combo.getValue());
							}
						}
					}), displayField: "name", valueField: "product_type_group_id", listeners: {
						beforequery: function(qe){
	                        delete qe.combo.lastQuery;
	                    },
	                    render: function(qe){
							qe.store.load();
						},
						select: function(qe, record, index){
							var groupid = record.get("product_type_group_id");
							var cmp = me.__get_cmp("product_type");
							if(cmp.store.baseParams.groupid == groupid)
								return;
							cmp.setValue("");
							cmp.store.baseParams.groupid = groupid;

							//首充代充的展示
							//me._show_sc_dc(groupName);
						},
						render: function(qe){
							qe.store.load();
						},
					}},

					//首充白名单
					{id: me.__make_id("sc_whitelist"), xtype: "combo", fieldLabel: "首充白名单<font color='red'>*</font>", anchor: "95%", triggerAction: 'all', typeAhead : true, editable: false, model: "local",
					allowBlank: false, store: [[0, "不添加"], [1, "添加"]], value: 1},

					//商品渠道
					{id: me.__make_id("product_channel"), xtype: "combo", fieldLabel: "商品渠道<font color='red'>*</font>", anchor: "95%", triggerAction: 'all', typeAhead : true, 
					editable: false, model: "remote", disabled : true,
					allowBlank: false, value: 0, store: new Ext.data.JsonStore({
						url: utils.build_url("adminChannel/getList"),
						root: "data",
						fields: [
							{name: 'channel_id'},
						    {name: 'channel_name'}
						],
						listeners: {
							beforeload: function(s){
								s.baseParams.page = 1;
								s.baseParams.rows = 1000;
								s.baseParams.sort = "weight";
								s.baseParams.order = "desc";
							},
							load: function(s){
								var records = s.getRange();
								var f = Ext.data.Record.create([]);
								var record = new f({channel_id : 0, channel_name : "无"});
								s.insert(0, record);
								//加载完后重新设置以显示中文名称
								var combo = me.__get_cmp("product_channel");
								combo.setValue(combo.getValue());
							}
						}
					}), displayField: "channel_name", valueField: "channel_id", listeners: {
						beforequery: function(qe){
	                        delete qe.combo.lastQuery;
	                    },
	                    render: function(qe){
							qe.store.load();
						},
					}},

					//最高商品价
					{id: me.__make_id("max_price"), xtype: "textfield", fieldLabel: "商品单价最高比例<font color='red'>*</font>", anchor: "95%", allowBlank: false, value: "100"},

					//是否人工审核
					{id: me.__make_id("need_audit"), xtype: "combo", fieldLabel: "是否人工审核<font color='red'>*</font>", anchor: "95%", triggerAction: 'all', typeAhead : true, editable: false, model: "local",
					allowBlank: false, store: [[0, "否"], [1, "是"]], value: 0},
					//单位
					{id: me.__make_id("unit"), xtype: "textfield", fieldLabel: "单位<font color='red'>*</font>", anchor: "95%", allowBlank: false, value: "件"},
					//子渠道标识
					{id: me.__make_id("sub_channel"), xtype: "textfield", fieldLabel: "子渠道标识<font color='red'>*</font>", anchor: "95%", allowBlank: false, value: "0"},
					//交易模式
					//商品分类昵称
					{id: me.__make_id("nick_name"), xtype: "textfield", fieldLabel: "商品分类昵称<font color='red'>*</font>", anchor: "95%", allowBlank: false, value: "0"},
				]
			});
			var form2 = new Ext.form.FormPanel({
				border: false,
				hidden : true,
				width: 400,
				padding: 8,
				labelWidth : 120,
				items:[
					//商品类型
					{id: me.__make_id("product_type"), xtype: "combo", fieldLabel: "商品类型<font color='red'>*</font>", anchor: "95%", triggerAction: 'all', typeAhead : true, editable: false, model:"remote",
					allowBlank: false, store: new Ext.data.JsonStore({
						url: utils.build_url("adminProductType/getProductTypeList"),
						totalProperty: "total",
						root: "data",
						fields: [
							{name: "product_type_id"}, 
							{name: "channel_id"}, 
							{name: "name"}, 
							{name: "weight"}, 
							{name: "usable"},
							{name : "default_discount"}, 
							{name : "default_sub_channel"},
							{name : "default_trade_mode"}
						],
						listeners: {
							beforeload: function(s){
								if(s.baseParams.groupid == undefined || s.baseParams.groupid == ""){
									return false;
								}
								
								return true;
							},
							load: function(s){
								//加载完后重新设置以显示中文名称
								var combo = me.__get_cmp("product_type");
								combo.setValue(combo.getValue());
								
							},
						}
					}), displayField: "name", valueField: "product_type_id", listeners: {
						beforequery: function(qe){
	                        delete qe.combo.lastQuery;
	                    },
	                    select : function(combo, record, index ){
	                    	me.__get_cmp("product_channel").setValue(record.get("channel_id"));
	                    	me.__get_cmp("discount").setValue(record.get("default_discount"));
	                    	me.__get_cmp("sub_channel").setValue(record.get("default_sub_channel"));
//	                    	me.__get_cmp("trade_mode").setValue(record.get("default_trade_mode"));
	                    	me.__get_cmp("nick_name").setValue(record.get("name"));
	                    },
	                    render: function(qe){
							qe.store.load();
						},
					}},

					//代充白名单
					{id: me.__make_id("dc_whitelist"), xtype: "combo", fieldLabel: "代充白名单<font color='red'>*</font>", anchor: "95%", triggerAction: 'all', typeAhead : true, editable: false, model: "local",
					allowBlank: false, store: [[0, "不查验"], [1, "查验"]], value: 1},

					//商品类型权重
					{id: me.__make_id("weight"), xtype: "textfield", fieldLabel: "商品类型权重<font color='red'>*</font>", anchor: "95%", value: "0", allowBlank: false},

					//商品最低价
					{id: me.__make_id("min_price"), xtype: "textfield", fieldLabel: "商品单价最低比例<font color='red'>*</font>", anchor: "95%", allowBlank: false, value: "1"},

					//是否支持发布
					{id: me.__make_id("need_publish"), xtype: "combo", fieldLabel: "是否支持发布<font color='red'>*</font>", anchor: "95%", triggerAction: 'all', typeAhead : true, editable: false, model: "local",
					allowBlank: false, store: [[0, "不支持"], [1, "支持"]], value: 0},
					//是否支持api
					{id: me.__make_id("is_api"), xtype: "combo", fieldLabel: "是否支持api<font color='red'>*</font>", anchor: "95%", triggerAction: 'all', typeAhead : true, editable: false, model: "local",
						allowBlank: false, store: [[0, "不支持"], [1, "支持"]], value: 0,
						listeners : {
							select : function(combo, record, index){
								var value = combo.getValue();
								me._is_api(value);
							}
						}
					},
					//限购件数
					{id: me.__make_id("quota"), xtype: "textfield", fieldLabel: "限购件数<font color='red'>*</font>", anchor: "95%", allowBlank: false, value: "0"},
					//折扣值
					{xtype : "compositefield",anchor: "95%", hidden : true, items : [
	                     {id: me.__make_id("discount"), xtype: "textfield", fieldLabel: "折扣值<font color='red'>*</font>", width : 100, allowBlank: false, value: "0"},
	                     {xtype : "displayfield", value : "<font color='red'>只针对充值类商品有用</font>"},
	                 ]},
					
					//是否支持聊天
					{id: me.__make_id("is_chat"), xtype: "combo", fieldLabel: "是否支持聊天<font color='red'>*</font>", anchor: "95%",  triggerAction: 'all', typeAhead : true, editable: false, model: "local",
						allowBlank: false, store: [[0, "不支持"], [1, "支持"]], value: 0},
				]
			});
			
			var fieldset = new Ext.form.FieldSet({
				title: "基础信息",
				hidden : true,
				layout: "table",
				layoutConfig: {columns:2},
				anchor: "98%",
				items: [form1, form2],
				bbar: [
                	{id: me.__make_id("base_info_ok_btn"), xtype: "button", text: "保存基础信息", icon: "static/libs/icons/accept.png", width: 100, height: 30, style: "border: solid 1px gray; background-color: #ccc;", handler: function(){
                		var data = me.get_data();
                		if(!me.is_valid(data)){
                			return false;
                		}
                		var json = Ext.util.JSON.encode(data);
                		var myMask = new Ext.LoadMask(Ext.getBody(), {msg : "保存中..."});
                		myMask.show();
						utils.http_request(utils.build_url("gameProduct/updateProductType"), {data: json}, function(json){
							if(json.success){
								var data = json.data;
								me.__get_cmp("id").setValue(data.id);
								me.game_id = data.game_id;
								me.product_type_id = data.product_type_id;
								me.on_save();
								myMask.hide();
							}
                        });
                	}}//,
                ],
			});

			fieldset.get_data = function(){
				var base_info = {};
				base_info.id = me.__get_cmp("id").getValue();
				base_info.game_id = me.game_id;
				base_info.product_type_group_id = me.__get_cmp("product_type_group").getValue();
				
				base_info.product_type_group_name = me.__get_cmp("product_type_group").getRawValue();
				base_info.product_type_id = me.__get_cmp("product_type").getValue();
				
				base_info.product_type_name = me.__get_cmp("product_type").getRawValue();
				base_info.nick_name = me.__get_cmp("nick_name").getRawValue();
				base_info.unit = me.__get_cmp("unit").getValue();
				base_info.is_audit = me.__get_cmp("need_audit").getValue();
				base_info.is_publish = me.__get_cmp("need_publish").getValue();
				base_info.is_api = me.__get_cmp("is_api").getValue();
				base_info.min_ratio = me.__get_cmp("min_price").getValue();
				base_info.max_ratio = me.__get_cmp("max_price").getValue();
				base_info.weight = me.__get_cmp("weight").getValue();
				base_info.sc_whitelist_add_flag = me.__get_cmp("sc_whitelist").getValue();
				base_info.dc_whitelist_check_flag = me.__get_cmp("dc_whitelist").getValue();
				base_info.channel_id = me.__get_cmp("product_channel").getValue();
				base_info.channel_name = me.__get_cmp("product_channel").getRawValue();
				base_info.quota = me.__get_cmp("quota").getValue();
				base_info.discount = me.__get_cmp("discount").getValue();
				base_info.sub_channel = me.__get_cmp("sub_channel").getValue();
				base_info.is_chat = me.__get_cmp("is_chat").getValue();
				return base_info;
			}
			fieldset.set_data = function(base_info){
				me.__get_cmp("id").setValue(base_info.id);
				me.__get_cmp("product_type_group").setValue(base_info.product_type_group_id);
				me.__get_cmp("product_type").setValue(base_info.product_type_id);
				//设置store的初始参数
				me.__get_cmp("product_type").store.baseParams.groupid = base_info.product_type_group_id;
				
				me.__get_cmp("nick_name").setValue(base_info.nick_name);
				me.__get_cmp("sc_whitelist").setValue(base_info.sc_whitelist_add_flag);
				me.__get_cmp("dc_whitelist").setValue(base_info.dc_whitelist_check_flag);
				me.__get_cmp("product_channel").setValue(base_info.channel_id);
				me.__get_cmp("max_price").setValue(base_info.max_ratio);
				me.__get_cmp("min_price").setValue(base_info.min_ratio);
				me.__get_cmp("need_audit").setValue(base_info.is_audit);
				me.__get_cmp("is_api").setValue(base_info.is_api);
				//设置是否支出api的界面效果
				me._is_api(base_info.is_api);
				me.__get_cmp("weight").setValue(base_info.weight);
				me.__get_cmp("unit").setValue(base_info.unit);
				me.__get_cmp("need_publish").setValue(base_info.is_publish);
				me.__get_cmp("quota").setValue(base_info.quota);
				me.__get_cmp("discount").setValue(base_info.discount);
				me.__get_cmp("sub_channel").setValue(base_info.sub_channel);
//				me.__get_cmp("trade_mode").setValue(base_info.trade_mode);
				me.__get_cmp("is_chat").setValue(base_info.is_chat);
			}

			return fieldset;
		},
		create_ext_info_panel: function(){
			var me = this;
			var form = new Ext.form.FormPanel({
				border: false,
				labelWidth: 130,
				items: [
					{id: me.__make_id("roleId1"), xtype: "textfield", fieldLabel: "ID前台展现名称", anchor: "95%", enableKeyEvents : true, listeners : {
						change : function(t){
							var data = me.ext_info_panel.get_data();
							me.ext_info_panel.on_save(data);
						},
						keydown : function(t, e){
							me.closing = false;
						}
					}},
					{id: me.__make_id("roleName1"), xtype: "textfield", fieldLabel: "角色前台展现名称", anchor: "95%", enableKeyEvents : true, listeners : {
						change : function(t){
							var data = me.ext_info_panel.get_data();
							me.ext_info_panel.on_save(data);
						},
						keydown : function(t, e){
							me.closing = false;
						}
					}},
					{id: me.__make_id("account"), xtype: "textfield", fieldLabel: "账号前台展现名称", anchor: "95%", enableKeyEvents : true, listeners : {
						change : function(t){
							
							var data = me.ext_info_panel.get_data();
							me.ext_info_panel.on_save(data);
						},
						keydown : function(t, e){
							me.closing = false;
						}
					}},
					{id: me.__make_id("password"), xtype: "textfield", fieldLabel: "密码前台展现名称", anchor: "95%", enableKeyEvents : true, listeners : {
						change : function(t){
							var data = me.ext_info_panel.get_data();
							me.ext_info_panel.on_save(data);
						},
						keydown : function(t, e){
							me.closing = false;
						}
					}},
					{id: me.__make_id("safeKey"), xtype: "textfield", fieldLabel: "安全锁前台展现名称", anchor: "95%", enableKeyEvents : true, listeners : {
						change : function(t){
							var data = me.ext_info_panel.get_data();
							me.ext_info_panel.on_save(data);
						},
						keydown : function(t, e){
							me.closing = false;
						}
					}},

				],
			});

			var fieldset = new Ext.form.FieldSet({
				title: "扩展信息",
				collapsible: true,
				anchor: "98%",
				items: [form]
			});

			fieldset.get_data = function(){
				var ext_info = [];
				var items = form.items.items;
				for(var i = 0; i < items.length; i++){
					var field = items[i];
					var key = field.getValue();
					//业务id 
					var busy_id = field.busy_id ;
					//如果填的值为空就不保存该条记录
					if(key == "" && (busy_id == undefined || busy_id == "")){
						continue;
					}
					//组件id 
					var key_id = field.getId().split(":")[1];
					//field
					var label_name = field.fieldLabel;
					
					ext_info.push({
						id : busy_id,
    	    			key: key,
            			key_type: 0,
            			value: "",
            			value_type_limit: 1000,
            			value_required: 1,
            			value_encode: 0,
            			weight: 100,
            			key_desc: label_name,
            			key_id : key_id,
					});
				}
				return ext_info
			}
			fieldset.set_data = function(ext_info){
				var items = form.items.items;
				for(var i = 0; i < items.length; i++){
					var cmp = items[i];
					cmp.busy_id = "";
				}
				for(var i = 0; i<ext_info.length; i++){
					var info = ext_info[i];
					console.log(info);
					if(info.key_id == undefined || info.key_id == ""){
						continue;
					}
					var cmp = me.__get_cmp(info.key_id);
					cmp.setValue(info.key);
					cmp.busy_id = info.id;
				}
			}
			fieldset.on_save = function(data){
				//如果不满足新增条件，返回
        		if(!me.add_valid()){
        			return false;
        		}
				//设置窗口不可关闭
				me.closing = false;
				var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "保存中，这可能需要一点时间..." });
				myMask.show();

				var json = Ext.util.JSON.encode(data);
				var property_type = 5;
        		var params = {game_id : me.game_id, product_type_id : me.product_type_id, property_type : property_type,data: json};
        		utils.http_request(utils.build_url("gameProduct/saveProductTypeExtInfo"), params, function(json){
					if(json.success){
						var da = json.data;
						me.ext_info_panel.set_data(da);
						//保存
						me.on_save();
						myMask.hide();
						me.closing = true;
						
					};
                });
			};
			return fieldset;
		},

		//商品自定义属性信息
		create_property_panel: function(title, color, property_type){
			var me = this;
			var fields = Ext.data.Record.create([
				{name: "key"},
				{name: "key_type"},
				{name: "value"},
				{name: "value_type_limit"},
				{name: "value_required"},
				{name: "value_encode"},
				{name: "weight"},
				{name: "key_desc"},
        	]);
        	var sm = new xsm.XCheckboxSelectionModel();
        	
        	//编辑器
    	    var editor = new Ext.ux.grid.RowEditor();
    	    editor.on({
    	    	scope: this,
    	    	afteredit: function(roweditor, changes, record, rowIndex) {
    	    		var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "保存中，这可能需要一点时间..." });
    				myMask.show();
	    	    	var data = {
    	    			id: record.get("id"),
    	    			key: record.get("key"),
            			key_type: record.get("key_type"),
            			value: record.get("value"),
            			value_type_limit: record.get("value_type_limit"),
            			value_required: record.get("value_required"),
            			value_encode: record.get("value_encode"),
            			weight: record.get("weight"),
            			key_desc: record.get("key_desc"),
	    	    	};
	    	    	var json = Ext.util.JSON.encode(data);
            		var params = {game_id : me.game_id, product_type_id : me.product_type_id, property_type : property_type,data: json};
            		utils.http_request(utils.build_url("gameProduct/saveProductTypePropertyInfo"), params, function(json){
						if(json.success){
							//保存
							me.on_save();
							//完成请求后重新去除蒙板
							myMask.hide();
						}
                    });
    	    	},
	    	});
			var grid = new Ext.grid.GridPanel({
				//loadMask : true,
                stripeRows : true,
                layout: "fit",
                //autoHeight: true,
                clicksToEdit: 2,
                anchor: "98%",
                border: false,
                columnLines: true,
                autoScoll : true,
                height : 200,
                plugins : [editor],
                view: new Ext.grid.GridView({
                    forceFit: true,
                    enableRowBody: true
                }),
                store: new Ext.data.JsonStore({
                	root: "data",
                	fields: fields,
                }),
                //sm: sm,
                columns: [
                	//sm,
                    {header:"前台展现名称", dataIndex:"key", align:"center", width:40, editor: new Ext.form.TextField()},
                    {header:"字段类型", dataIndex:"key_type", align:"center", width:30, editor: new Ext.form.ComboBox({
                    	triggerAction: 'all', typeAhead : true, editable: false, model:"local", store: [[0, "文本"], [1, "数值"], [2, "单选"], [3, "多选"]],
                    	listeners: {
                    		select: function(combo, record, index){
                    			if(combo.getValue() == 0 || combo.getValue() == 1){
	                    			grid.getColumnModel().setColumnHeader(2, "限制(字数)");	
                    			}else{
	                    			grid.getColumnModel().setColumnHeader(2, "限制");
                    			}
                    		}
                    	}
                    }), renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	if(value == 0) return "文本";
                    	if(value == 1) return "数值";
                    	if(value == 2) return "单选";
                    	if(value == 3) return "多选";
                    }},
                    {header:"限制(字数)", dataIndex:"value_type_limit", align:"center", width:30, editor: new Ext.form.NumberField()},
                    {header:"候选值", dataIndex:"value", align:"center", width:30, editor: new Ext.form.TextField()},
                    {header:"是否必选", dataIndex:"value_required", align:"center", width:30, editor: new Ext.form.ComboBox({
                    	triggerAction: 'all', typeAhead : true, editable: false, model:"local", store: [[0, "否"], [1, "是"]]
                    }), renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	if(value == 0) return "否";
                    	if(value == 1) return "是";
                    }},
                    {header:"是否加密", dataIndex:"value_encode", align:"center", width:30, editor: new Ext.form.ComboBox({
                    	triggerAction: 'all', typeAhead : true, editable: false, model:"local", store: [[0, "否"], [1, "是"]]
                    }), renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	if(value == 0) return "否";
                    	if(value == 1) return "是";
                    }},
                    {header:"权重", dataIndex:"weight", align:"center", width:30, editor: new Ext.form.TextField()},
                    {header:"字段说明", dataIndex:"key_desc", align:"center", width:50, editor: new Ext.form.TextField()},
                ],
                tbar: new Ext.Toolbar({
                	style: "background:" + color,
                	items: [
	                	{xtype: "button", icon: "static/libs/icons/add.png", text: "添加", handler: function(){
	                		//如果不满足新增条件，返回
	                		if(!me.add_valid()){
	                			return false;
	                		}
	                		//判断已经添加store中msg的内容是否有空
	                		var records = grid.store.getRange();
	                		for(var i = 0; i< records.length; i++){
	                			var record = records[i];
	                			if(record.get("key") == ""){
	                				utils.show_msg("已经添加的数据中存在空的\"前台展示名称\"，请填写前台展示名称");
	                				grid.getSelectionModel().selectRow(i);
			                        editor.startEditing(i);
	                				return false;
	                			}
	                		}
	                		var data = {
	                			key: "",
	                			key_type: 0,
	                			value: "",
	                			value_type_limit: 100,
	                			value_required: 0,
	                			value_encode: 0,
	                			weight: 100,
	                			key_desc: ""
	                		}
	                		var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "保存中，这可能需要一点时间..." });
	        				myMask.show();
	                		var json = Ext.util.JSON.encode(data);
	                		var params = {game_id : me.game_id, product_type_id : me.product_type_id, property_type : property_type,data: json};
	                		utils.http_request(utils.build_url("gameProduct/saveProductTypePropertyInfo"), params, function(json){
	                			if(json.success){
									var row = json.data
									var e = new fields(row);
			                		//编辑器 新增
			                		editor.stopEditing();
			                		grid.store.insert(0, e);
			                        grid.getView().refresh();
			                        grid.getSelectionModel().selectRow(0);
			                        editor.startEditing(0);
			                        //保存
			                        me.on_save();
			                        myMask.hide();
								}
                            });
	                	}},
	                	{xtype: "button", icon: "static/libs/icons/delete.png", value : "delete",  disabled : true, text: "删除", handler: function(){
	                		utils.show_confirm("删除该配置信息是不可恢复的操作，确定要删除吗？",function(){
	                			editor.stopEditing();
		                		var records = grid.getSelectionModel().getSelections();
		                		if(records.length == 0){
		                			utils.show_msg("请先选择需要删除的属性信息");
		                			return;
		                		}
		                		var data = [];
		                		for(var i=0; i<records.length; ++i){
		                			data.push({id : records[i].get("id")});
		                		}
		                		var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "保存中，这可能需要一点时间..." });
		        				myMask.show();
		                		var json = Ext.util.JSON.encode(data);
		                		utils.http_request(utils.build_url("gameProduct/deleteProductTypePropertyById"), {data : json}, function(json){
		                			if(json.success){
		                				for(var i=0; i<records.length; ++i){
		    		                		grid.store.remove(records[i]);
		    	                		}
		                				//保存
				                        me.on_save();
				                        myMask.hide();
									}
	                            });
	                		});
	                	}}
	                ]
                }),
			});
			grid.getSelectionModel().on('selectionchange', function(sm){
				var tbars = grid.getTopToolbar().items.items;
				var tbar_cmp = tbars[1];
				tbar_cmp.setDisabled(sm.getCount() < 1);
		    });
			var fieldset = new Ext.form.FieldSet({
				title: title,
				collapsible: true,
				collapsed : true,
				anchor: "98%",
				items: [grid]
			});
			fieldset.get_data = function(){
				var records = grid.store.getRange();
				var data = [];
				for(var i=0; i<records.length; ++i){
					var el = records[i].data;
					if(el.key == "")
						continue;
					if(el.value_type_limit == "")
						el.value_type_limit = 0;
					el.game_id = me.game_id;
					data.push(el);
				}
				return data;
			}
			fieldset.set_data = function(data){
				for(var i=0; i<data.length; ++i){
					var record = new fields();
					record.set("id", data[i].id);
					record.set("key", data[i].key);
					record.set("key_type", data[i].key_type);
					record.set("value", data[i].value);
					record.set("value_type_limit", data[i].value_type_limit);
					record.set("value_required", data[i].value_required);
					record.set("value_encode", data[i].value_encode);
					record.set("weight", data[i].weight);
					record.set("key_desc", data[i].key_desc);

					grid.store.add([record]);
				}
			}

			return fieldset;
		},

		create_tip_panel: function(){
			var me = this;
			var fields = Ext.data.Record.create([
				{name: "type"},
				{name: "message"},
        	]);
        	var sm = new xsm.XCheckboxSelectionModel();
        	
        	//编辑器
    	    var editor = new Ext.ux.grid.RowEditor();
    	    editor.on({
    	    	scope: this,
    	    	afteredit: function(roweditor, changes, record, rowIndex) {
	    	    	var data = {
    	    			id: record.get("id"),
    	    			type: record.get("type"),
            			message: record.get("message")
	    	    	};
	    	    	var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "保存中，这可能需要一点时间..." });
    				myMask.show();
	    	    	var json = Ext.util.JSON.encode(data);
            		var params = {game_id : me.game_id, product_type_id : me.product_type_id, data: json};
            		utils.http_request(utils.build_url("gameProduct/saveProductTypeRemmiderInfo"), params, function(json){
						if(json.success){
							//保存
	                        me.on_save();
	                        myMask.hide();
						}
                    });
    	    	},
	    	});
			var grid = new Ext.grid.GridPanel({
				//loadMask : true,
                stripeRows : true,
                layout: "fit",
                //autoHeight: true,
                autoScoll : true,
                clicksToEdit: 2,
                anchor: "98%",
                border: false,
                columnLines: true,
                //sm: sm,
                height : 200,
                plugins : [editor],
                view: new Ext.grid.GridView({
                    forceFit: true,
                    enableRowBody: true
                }),
                store: new Ext.data.JsonStore({
                	root: "data",
                	fields: fields
                }),
                columns: [
                	//sm,
                    {header:"提示信息位置", dataIndex:"type", align:"center", width:20, editor: new Ext.form.ComboBox({
                    	triggerAction: 'all', typeAhead : true, editable: false, model:"local", 
                    	store: [[1, "(发布页)商品信息提示"], [2, "(发布页)账户信息提示"], [3, "(发布页)发布提示信息"], [4, "(详情页)商品提示信息"], [5, "支付成功页信息提示"]],
                    }), renderer: function(value, metaData, record, rowIndex, colIndex, store){
                    	if(value == 1) return "(发布页)商品信息提示";
                    	if(value == 2) return "(发布页)账户信息提示";
                    	if(value == 3) return "(发布页)发布提示信息";
                    	if(value == 4) return "(详情页)商品提示信息";
                    	if(value == 5) return "支付成功页信息提示";
                    }},
                    {header:"提示内容", dataIndex:"message", align:"center", width:50, editor: new Ext.form.TextField(), renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	return utils.htmlEncode(value);
                    }},
                ],
                tbar: [
                	{xtype: "button", icon: "static/libs/icons/add.png", text: "添加", handler: function(){
                		//如果不满足新增条件，返回
                		if(!me.add_valid()){
                			return false;
                		}
                		//判断已经添加store中msg的内容是否有空
                		var records = grid.store.getRange();
                		for(var i = 0; i< records.length; i++){
                			var record = records[i];
                			if(record.get("message") == ""){
                				utils.show_msg("已经添加的数据中存在空的\"提示内容\"，请填写要提示内容");
                				grid.getSelectionModel().selectRow(i);
		                        editor.startEditing(i);
                				return false;
                			}
                		}
                		var data = {type: 1, message: ""};
                		var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "保存中，这可能需要一点时间..." });
        				myMask.show();
                		var json = Ext.util.JSON.encode(data);
                		var params = {game_id : me.game_id, product_type_id : me.product_type_id, data: json};
                		utils.http_request(utils.build_url("gameProduct/saveProductTypeRemmiderInfo"), params, function(json){
                			if(json.success){
								var row = json.data
								var e = new fields(row);
		                		//编辑器 新增
		                		editor.stopEditing();
		                		grid.store.insert(0, e);
		                        grid.getView().refresh();
		                        grid.getSelectionModel().selectRow(0);
		                        editor.startEditing(0);
		                        //保存
		                        me.on_save();
		                        myMask.hide();
							}
                        });
                	}},
                	{xtype: "button", icon: "static/libs/icons/delete.png", disabled : true, text: "删除", handler: function(){
                		utils.show_confirm("删除该配置信息是不可恢复的操作，确定要删除吗？",function(){
                			editor.stopEditing();
                    		var records = grid.getSelectionModel().getSelections();
                    		if(records.length == 0){
                    			utils.show_msg("请先选择需要删除的提示信息");
                    			return;
                    		}
                    		var data = [];
                    		for(var i=0; i<records.length; ++i){
                    			data.push({id : records[i].get("id")});
                    		}
                    		var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "保存中，这可能需要一点时间..." });
            				myMask.show();
                    		var json = Ext.util.JSON.encode(data);
                    		utils.http_request(utils.build_url("gameProduct/deleteProductTypeRemmiderById"), {data : json}, function(json){
                    			if(json.success){
                    				for(var i=0; i<records.length; ++i){
        		                		grid.store.remove(records[i]);
        	                		}
                    				//保存
    		                        me.on_save();
    		                        myMask.hide();
    							}
                            });
                		});
                		
                	}}
                ]
			});
			grid.getSelectionModel().on('selectionchange', function(sm){
				var tbars = grid.getTopToolbar().items.items;
				var tbar_cmp = tbars[1];
				tbar_cmp.setDisabled(sm.getCount() < 1);
		    });
			var fieldset = new Ext.form.FieldSet({
				title: "自定义提示信息",
				collapsible: true,
				collapsed : true,
				anchor: "98%",
				items: [grid]
			});

			fieldset.get_data = function(){
				var records = grid.store.getRange();
				var data = [];
				for(var i=0; i<records.length; ++i){
					var el = records[i].data;
					if(el.message == "")
						continue;
					el.game_id = me.game_id;
					data.push(el);
				}
				return data;
			}

			fieldset.set_data = function(data){
				for(var i=0; i<data.length; ++i){
					var record = new fields();
					record.set("id", data[i].id);
					record.set("type", data[i].type);
					record.set("message", data[i].message);
					grid.store.add([record]);
				}
			}

			return fieldset;
		},

		//获取数据
		get_data: function(){
			var data = {};
			data.base_info = this.base_info_panel.get_data();
			data.ext_info = this.ext_info_panel.get_data();
			data.prod_info = this.prod_info_panel.get_data();
			data.saler_info = this.saler_info_panel.get_data();
			data.buy_info = this.buy_info_panel.get_data();
			data.tip_info = this.tip_info_panel.get_data();
			return data;
		},
		add_valid : function(){
			if((this.product_type_id == undefined || this.product_type_id == "") || (this.game_id == undefined ||this.game_id == "")){
				utils.show_msg("请保存游戏商品基本信息");
				return false;
			}
			return true;
		},
		is_valid: function(data){
			if(data.base_info.product_type_group_id == ""){
				utils.show_msg("请选择商品大类");
				return false;
			}
			if(data.base_info.product_type_id == ""){
				utils.show_msg("请选择商品类型");
				return false;
			}

			var infos = [data.prod_info, data.saler_info, data.buy_info];
			for(var k=0; k<infos.length; ++k){
				for(var i=0; i<infos[k].length; ++i){
					var info = infos[k][i];

					//没配置key的数据就不需要检验了，反正会忽略掉的
					if(info.key == "")
						continue;

					//文本和数值，要求必填“限制”字段
					if(info.key_type == 0 || info.key_type == 1){
						if(info.value_type_limit == ""){
							utils.show_msg("属性配置中，文本和数值类型必须填写限制字段。")
							return false;
						}
					}
				}
			}

			return true;
		},

		//设置数据及界面
		set_data: function(data){
			//设置二级分类id
			this.product_type_id = data.base_info.product_type_id;
			//设置游戏id
			this.game_id = data.base_info.game_id;
			
			this.base_info_panel.set_data(data.base_info);
			this.ext_info_panel.set_data(data.ext_info);
			this.prod_info_panel.set_data(data.prod_info);
			this.saler_info_panel.set_data(data.saler_info);
			this.buy_info_panel.set_data(data.buy_info);
			this.tip_info_panel.set_data(data.tip_info);
			
			//设置一些效果 当配置没有数据时，将fieldset收缩起来
			if(data.ext_info.length > 0){
				this.ext_info_panel.collapsed = false;
			}
			if(data.prod_info.length > 0){
				this.prod_info_panel.collapsed = false;
			}
			if(data.saler_info.length > 0){
				this.saler_info_panel.collapsed = false;
			}
			if(data.buy_info.length > 0){
				this.buy_info_panel.collapsed = false;
			}
			if(data.tip_info.length > 0){
				this.tip_info_panel.collapsed = false;
			}
		},

		//to be implemented
		get_product_channels: function(){
		},

		//to be implemented
		onAccept: function(data){
		}
	});

	exports.GameKeFuProductTypeEditWindow = GameKeFuProductTypeEditWindow;
});
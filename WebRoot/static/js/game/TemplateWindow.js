define(function(require, exports, module){
	var utils = require("../utils");
    var xsm = require("../../com/SelectionModelRectify");

	var TemplateWindow = Ext.extend(Ext.Window, {
		__make_id : function(name){
            return "TemplateWindow:" + name;
        },

        __get_cmp: function(name){
            return Ext.getCmp(this.__make_id(name));
        },

		constructor: function(game_id){
			this.game_id = game_id;

			this.grid = this.createGrid();
			var me = this;
			TemplateWindow.superclass.constructor.call(this, {
				title: "配置商品类型模板",
                layout: "fit",
                autoDestroy: true,
                closable: true,
                closeAction: "close",
                resizable: true,
                modal: true,
                frame : true,
                width: 800,
                height: 700,
                tbar: [
                	{xtype: "button", width: 80, icon: "static/libs/icons/add.png", text: "添加模板", handler: function(){
                		var win = me.createEditWindow();
                		win.show();
                	}}
                ],
                items: [this.grid],
                listeners: {
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

		createGrid: function(){
			var me = this;
			var sm = new Ext.grid.CheckboxSelectionModel();
			var grid = new Ext.grid.GridPanel({
				autoDestroy: true,
                layout: "fit",
                loadMask : true,
                stripeRows : true,
                autoScroll : true,
                view: new Ext.grid.GridView({
                    forceFit: true,
                    enableRowBody: true
                }),
                sm: sm,
                store: new Ext.data.JsonStore({
                	url: utils.build_url("gameProductTypeTempl/getList"),
                	root: "data",
                	fields: [
                        {name: "id"}, {name: "name"}, {name: "product_type"}
                    ],
                    listeners: {
                    	beforeload: function(s) {
                    		s.baseParams.game_id = me.game_id;
                    	}
                    }
                }),
                columns: [
                	sm,
                	{header:"模板名称", dataIndex:"name", align:"center", width:30},
                	{header:"关联配置", dataIndex:"product_type", align:"center", width:40},
                	{header:"操作", dataIndex: "opt", align: "center", width: 30, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                		var editId = utils.createGridBtn({
                			text: "编辑",
                			width: "80",
                			icon: "static/libs/icons/page_edit.png",
                			handler: function(){
                				utils.http_request(utils.build_url("gameProductTypeTempl/findTemplateInfoById"), {id: record.get("id")}, function(json){
                					var win = me.createEditWindow(record, json.data);
                					win.show();
                				});
                			}
                		});
                		var delId = utils.createGridBtn({
							text: "删除",
                			width: "80",
                			icon: "static/libs/icons/delete.png",
                			handler: function(){
                				utils.show_confirm("确定删除该模板?", function(){
                					utils.http_request(utils.build_url("gameProductTypeTempl/delete"), {id: record.get("id")}, function(){
                						utils.show_msg("删除成功");
                						grid.store.reload();
                					}, function(json){
                						utils.show_msg(json.msg);
                					})
                				});
                			}
                		});

                		return ('<div style="width:100px;float:left;"><span id="' + editId + '" /></div>'
                            + '<div style="width:100px;float:left;"><span id="' + delId + '" /></div>');
                	}}
                ],
                listeners: {
                	render: function(p){
                		p.store.load();
                	}
                }
			});
			return grid;
		},

		//编辑窗口
		createEditWindow: function(record, data){
			var id = 0;
			if(record){
				id = record.get("id");
			}
			var base_info_panel = this.create_base_info_panel();
			var ext_info_panel = this.create_ext_info_panel();
			var prod_info_panel = this.create_property_panel("商品属性", "#D2E0F1");
			var seller_info_panel = this.create_property_panel("卖家信息", "#BFEFFF");
			var buy_info_panel = this.create_property_panel("购买信息", "#D2E0F1");
			var tip_info_panel = this.create_tip_panel();
			if(data){
				base_info_panel.set_tmpl_name(data.name);
				ext_info_panel.set_data(data.ext_info);
				prod_info_panel.set_data(data.prod_info);
				seller_info_panel.set_data(data.seller_info);
				buy_info_panel.set_data(data.buy_info);
				tip_info_panel.set_data(data.tip_info);
			}

			var me = this;

			var items = [base_info_panel, ext_info_panel, prod_info_panel, seller_info_panel, buy_info_panel, tip_info_panel];
			if(record && record.get("product_type") != ""){
				var fieldset = new Ext.form.FieldSet({
					title: "当前模板关联的商品分类",
					anchor: "98%",
					html: record.get("product_type")
				});
				items.push(fieldset);
			}
			var win = new Ext.Window({
				title: "编辑模板",
                layout: "fit",
                autoDestroy: true,
                closable: true,
                closeAction: "close",
                resizable: false,
                modal: true,
                frame : true,
                width: 800,
                height: 700,
                items: [
                	{xtype: "panel", layout: "fit", border: false, autoScroll: true, padding: 10, items: items}
                ],
                buttons: [
                	{xtype: "button", width: 80, height: 30, icon: "static/libs/icons/accept.png", text: "保存", handler: function(){
                		//保存模板
                		var tmpl_name = base_info_panel.get_tmpl_name();
                		if(tmpl_name == ""){
                			utils.show_msg("必须配置模板名称");
                			return;
                		}
                		var ext_info = ext_info_panel.get_data();
                		var buy_info = buy_info_panel.get_data();
                		var prod_info = prod_info_panel.get_data();
                		var seller_info = seller_info_panel.get_data();
                		var tip_info = tip_info_panel.get_data();
                		var param = {
            				game_id: me.game_id, 
            				name: tmpl_name, 
            				ext_info: ext_info, 
            				buy_info: buy_info,
            				prod_info: prod_info,
            				seller_info: seller_info,
            				tip_info : tip_info,	
                		};
                		if(id > 0){
                			param.id = id;
                		}
                		//判断数据是否合法 	
                		if(!me.is_valid(param)){
                			return;
                		}

                		utils.http_request(utils.build_url("gameProductTypeTempl/addOrUpdate"), {data: Ext.util.JSON.encode(param)}, function(){
                			//如果是修改，则询问是否应用到当前关联的商品分类中
                			if(id > 0){
                				utils.show_confirm("保存模板成功，是否将该模板应用到所有已关联的商品分类中?", function(){
									me.onApply(id);
									me.grid.store.reload();
		                			win.close();
								}, function(){
		                			me.grid.store.reload();
		                			win.close();
								});
                			}else{
                				utils.show_msg("保存模板成功");
	                			me.grid.store.reload();
	                			win.close();
                			}
                		});
                	}}
                ],
                listeners: {
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
			return win;
		},


		create_base_info_panel: function(){
			var me = this;
			var form = new Ext.form.FormPanel({
				border: false,
				labelWidth: 130,
				items: [
					{id: me.__make_id("name"), xtype: "textfield", fieldLabel: "模板名称", anchor: "95%", allowBlank: false}
				]
			});

			var fieldset = new Ext.form.FieldSet({
				title: "基础信息",
				anchor: "95%",
				autoHeight: true,
				items: [form]
			});

			fieldset.get_tmpl_name = function(){
				return me.__get_cmp("name").getValue();
			}

			fieldset.set_tmpl_name = function(name){
				me.__get_cmp("name").setValue(name);
			}

			return fieldset;
		},

		//扩展信息
		create_ext_info_panel: function(){
			var me = this;
			var form = new Ext.form.FormPanel({
				border: false,
				labelWidth: 130,
				items: [
					{id: me.__make_id("roleId1"), xtype: "textfield", fieldLabel: "ID前台展现名称", anchor: "95%"},
					{id: me.__make_id("roleName1"), xtype: "textfield", fieldLabel: "角色前台展现名称", anchor: "95%"},
					{id: me.__make_id("account"), xtype: "textfield", fieldLabel: "账号前台展现名称", anchor: "95%"},
					{id: me.__make_id("password"), xtype: "textfield", fieldLabel: "密码前台展现名称", anchor: "95%"},
					{id: me.__make_id("safeKey"), xtype: "textfield", fieldLabel: "安全锁前台展现名称", anchor: "95%"},
				]
			});

			var fieldset = new Ext.form.FieldSet({
				title: "扩展信息",
				collapsible: true,
				anchor: "98%",
				autoHeight: true,
				items: [form]
			});

			fieldset.get_data = function(){
				var ext_info = [];
				var items = form.items.items;
				for(var i = 0; i < items.length; i++){
					var field = items[i];
					var key = field.getValue();
					//如果填的值为空就不保存该条记录
					if(key == ""){
						continue;
					}
					//组件id 
					var key_id = field.getId().split(":")[1];
					//field
					var label_name = field.fieldLabel;
					
					ext_info.push({
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
				for(var i = 0; i<ext_info.length; i++){
					var info = ext_info[i];
					if(info.key_id == undefined || info.key_id == ""){
						continue;
					}
					var cmp = me.__get_cmp(info.key_id);
					cmp.setValue(info.key);
				}
			}

			return fieldset;
		},

		//商品自定义属性信息
		create_property_panel: function(title, color){
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
			var grid = new Ext.grid.EditorGridPanel({
				loadMask : true,
                stripeRows : true,
                layout: "fit",
                autoHeight: true,
                clicksToEdit: 1,
                anchor: "98%",
                border: false,
                columnLines: true,
                view: new Ext.grid.GridView({
                    forceFit: true,
                    enableRowBody: true
                }),
                store: new Ext.data.JsonStore({
                	root: "data",
                	fields: fields
                }),
                sm: sm,
                columns: [
                	sm,
                    {header:"前台展现名称", dataIndex:"key", align:"center", width:40, editor: new Ext.form.TextField()},
                    {header:"字段类型", dataIndex:"key_type", align:"center", width:30, editor: new Ext.form.ComboBox({
                    	triggerAction: 'all', typeAhead : true, editable: false, model:"local", store: [[0, "文本"], [1, "数值"], [2, "单选"], [3, "多选"]],
                    	listeners: {
                    		select: function(combo, record, index){
                    			if(combo.getValue() == 0 || combo.getValue() == 1){
	                    			grid.getColumnModel().setColumnHeader(3, "限制(字数)");	
                    			}else{
	                    			grid.getColumnModel().setColumnHeader(3, "限制");
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
	                		var record = new fields({
	                			key: "",
	                			key_type: 0,
	                			value: "",
	                			value_type_limit: "",
	                			value_required: 0,
	                			value_encode: 0,
	                			weight: 100,
	                			key_desc: ""
	                		});
	                		grid.store.add([record]);
	                		grid.view.refresh();
	                	}},
	                	{xtype: "button", icon: "static/libs/icons/delete.png", text: "删除", handler: function(){
	                		var records = grid.getSelectionModel().getSelections();
	                		if(records.length == 0){
	                			utils.show_msg("请先选择需要删除的属性信息");
	                			return;
	                		}
	                		for(var i=0; i<records.length; ++i){
		                		grid.store.remove(records[i]);
	                		}
	                	}}
	                ]
                })
			});

			var fieldset = new Ext.form.FieldSet({
				title: title,
				collapsible: true,
				anchor: "98%",
				autoHeight: true,
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

					data.push(el);
				}
				return data;
			}
			fieldset.set_data = function(data){
				for(var i=0; i<data.length; ++i){
					var record = new fields();
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
		//自定义提示信息
		create_tip_panel: function(){
			var me = this;
			var fields = Ext.data.Record.create([
				{name: "type"},
				{name: "message"},
        	]);
        	var sm = new xsm.XCheckboxSelectionModel();
        	
			var grid = new Ext.grid.EditorGridPanel({
				//loadMask : true,
                stripeRows : true,
                layout: "fit",
                //autoHeight: true,
                autoScoll : true,
                clicksToEdit: 2,
                anchor: "98%",
                border: false,
                columnLines: true,
                sm: sm,
                height : 200,
                view: new Ext.grid.GridView({
                    forceFit: true,
                    enableRowBody: true
                }),
                store: new Ext.data.JsonStore({
                	root: "data",
                	fields: fields
                }),
                columns: [
                	sm,
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
                		//判断已经添加store中msg的内容是否有空
                		var records = grid.store.getRange();
                		for(var i = 0; i< records.length; i++){
                			var record = records[i];
                			if(record.get("message") == ""){
                				utils.show_msg("已经添加的数据中存在空的\"提示内容\"，请填写要提示内容");
                				return false;
                			}
                		}
                		var record = new fields({
                			type : "",
                			message : "",
                		});
                		grid.store.add([record]);
                		grid.view.refresh();
                		
                	}},
                	{xtype: "button", icon: "static/libs/icons/delete.png", disabled : true, text: "删除", handler: function(){
                		utils.show_confirm("删除该配置信息是不可恢复的操作，确定要删除吗？",function(){
                    		var records = grid.getSelectionModel().getSelections();
                    		if(records.length == 0){
                    			utils.show_msg("请先选择需要删除的提示信息");
                    			return;
                    		}
                    		for(var i=0; i<records.length; ++i){
		                		grid.store.remove(records[i]);
	                		}
                    		
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
				if(data.length > 0){
					fieldset.collapsed = false;
				}
			}

			return fieldset;
		},
		
		is_valid: function(data){
			for(var i=0; i<data.buy_info.length; ++i){
				var info = data.buy_info[i];

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

			return true;
		},

		//由调用者实现
		onApply: function(tmpl_id){}
	});

	exports.TemplateWindow = TemplateWindow;
});
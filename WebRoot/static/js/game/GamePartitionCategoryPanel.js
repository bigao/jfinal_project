define(function(require, exports){
	var utils = require("../utils.js");
	var fw = require("../../com/FormWindow.ui.js");
	var GamePartitionCategoryPanel = Ext.extend(Ext.form.FormPanel, {
		__make_id : function(name){
			return "GamePartitionCategoryPanel" + this.id + name;
		},
		__get_cmp : function(name){
            var id = this.__make_id(name);
            return Ext.getCmp(id);
        },
        constructor : function(id){
        	var me = this;
        	this.category = {};
        	this.id = id;
        	this.new_partition_num = 1;
        	this.fields = this.createFields();
        	GamePartitionCategoryPanel.superclass.constructor.call(this, {
        		id : id,
        		border: false,
        		autoDestroy : true,
        		autoHeight : true,
        	});
        },
        createPartitionCategoryPanel : function(id, category_name, weight, data, category_id, group_id){
        	var me = this;
        	//初始化store
        	var store = this.createStore();
    		for(var i = 0; i<data.length; i++){
    			var da = data[i];
    			var record =me._create_record(da);
    			store.add([record]);
    		}
    		// 记录操作是否为编辑操作
    		var is_editor = true;
    		//编辑器
    	    var editor = new Ext.ux.grid.RowEditor();
    	    editor.on({
    	    	scope: this,
    	    	//如果点击的是删除 ，不弹出编辑器 
    	    	beforeedit : function(roweditor,rowIndex){
    	    		return is_editor;
    	    	},
    	    	afteredit: function(roweditor, changes, record, rowIndex) {
	    	    	var data = me._get_record_data_to_obj(record);
	    	    	var game_id = utils.get_data("game_id");
		        	var json = Ext.util.JSON.encode(data);
		        	 Ext.MessageBox.confirm('修改区服名称确认框', '修改游戏区服名称,对应商品引用的游戏区服名称也会同步更改哦,确认更改?', function(btn) { 
		        		 if("yes" == btn){
		        			 var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "正在处理中,请耐心等待..." });
								myMask.show();
					        	utils.http_request(utils.build_url("gamePartition/updatePartition"), {data : json, game_id : game_id}, function(json){
					        		myMask.hide();
					        		if(json.success){
			            				utils.tips(json.msg);
			            			}
			            		}, function(json){
			            			myMask.hide();
			            			utils.show_msg(json.msg);
			            			//如果是线下区服，并且下线失败了，页面显示恢复到上线的状态
			            			if(changes.usable != undefined && changes.usable == 0){
			            				record.set("usable", 1);
			            			}
			            		});
		        		 }
		        	 }); 
    	    	},
	    	});
    	    //为了能够兼容 Ext.ux.grid.RowEditor编辑器  在复选框中加setValue 和getEditor方法
    	    var sm = new Ext.grid.CheckboxSelectionModel({
    	    	editor : null,
    	    	setValue : function(){},
    	    	getEditor : function(){},
    	    	
    	    });
    	    var tbar1 =  new Ext.Toolbar({
        		items :[
        		        "分组名：",
        		        {xtype : "textfield", id : me.__make_id("category_name"+id), width : 100, value : category_name},
        		        '-',"权重:",
        		        {xtype : "textfield", id : me.__make_id("weight"+id), width : 100, value : weight},
        		        {xtype : "button", text : "修改", icon : "static/libs/icons/application_edit.png", handler : function(t){
        		        	var name = me.__get_cmp("category_name"+id).getValue();
        		        	var weight = me.__get_cmp("weight"+id).getValue();
        		        	var game_id = utils.get_data("game_id");
        		        	utils.http_request(utils.build_url("gamePartitionCategory/update"), {game_id : game_id, category_name : name, category_id: category_id, weight : weight}, function(json){
                    			if(json.success){
                    				var records = store.getRange();
                    				for(var i =0; i < records.length; i++){
                    					var record = records[i];
                    					record.set("category_name", name);
                    				}
                    				utils.tips("修改成功");
                    			}
                    		});
        		        	me.info_change();
        		        }}, 
        		        "-", {xtype : "button", text : "新增区服", icon : "static/libs/icons/add.png", handler : function(t){
        		        	//获取store中的最后一个元素作为新增区服的默认数据
        		        	var records = store.getRange();
        		        	last_record = records[records.length-1];
        		        	
        		        	var name = "新建区服-"+me.new_partition_num++;
        		        	var weight = Number(last_record == undefined ? 1 : last_record.get("weight"))+1;
        		        	var game_id = utils.get_data("game_id");
        		        	var data = {
    		        			partition_name : name, 
    		        			game_id : game_id, 
    		        			weight : weight,
    		        			game_channel_group_id : group_id,
    		        			category_name : category_name,
    		        			category_id : category_id,
    		        			usable : 0,
        		        	};
        		        	var json = Ext.util.JSON.encode(data);
        		        	utils.http_request(utils.build_url("gamePartition/addPartition"), {data : json}, function(json){
                    			if(json.success){
                    				var da = json.data;
                    				var record = me._create_record(da);
                    				store.add([record]);
                    				//找到最后一个元素
                    				var index = store.getCount()-1;
                    				//编辑器 新增
			                		editor.stopEditing();
			                        grid.getSelectionModel().selectRow(index);
			                        editor.startEditing(index);
                    			}
                    		});
        		        	me.info_change();
        		        }},
        		        "->",
        		        {xtype : "button", text : "删除该分组", icon : "static/libs/icons/cancel.png", handler : function(t){
        		        	utils.show_confirm("删除该分组是不可恢复的操作，确定要删除吗？",function(){
        		        		//先蒙起来
        		        		var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "删除中，这可能需要一点时间..." });
        		        		myMask.show();

        		        		var game_id = utils.get_data("game_id");
            		        	utils.http_request(utils.build_url("gamePartitionCategory/delete"), {game_id : game_id, category_id: category_id, group_id : group_id}, function(json){
                        			if(json.success){
                        				me.info_change();
                    		        	delete me.category[category_name];
        								var cmp = grid.findParentByType("fieldset");
        								me._remove_sub(cmp);
        								utils.tips("操作成功");
                        			}
                        			//完成请求后重新去除蒙板
                        			myMask.hide();
                        		}, function(json){
                        			//完成请求后重新去除蒙板
                       			 	myMask.hide();
                       			 	utils.show_msg(json.msg);
                        		});
        		        	});
        		        }},
    		        ],
            	});
    	    var tbar2 = new Ext.Toolbar({
    	    	//批量上下线区服
    	    	update_usable : function(usable){
    	    		var game_id = utils.get_data("game_id");
    	    		var selects = sm.getSelections();
	    	    	var data = [];
	    	    	for(var index = 0; index < selects.length; index++){
	    	    		var d = selects[index].data;
	    	    		d.usable = usable;
	    	    		data.push(d);
	    	    	}
	    	    	var json = Ext.util.JSON.encode(data);
	    	    	var myMask = new Ext.LoadMask(Ext.getBody(), {msg : "保存中, 可能需要一些时间"});
	    	    	myMask.show();
	    	    	utils.http_request(utils.build_url("gamePartition/updatePartitionToUsable"),{data : json, game_id : game_id, usable : usable}, function(json){
	    	    		var records = store.getRange();
        				for(var i =0; i < records.length; i++){
        					for(index in data){
        						var record = records[i];
        						if(record.get("id") == data[index].id){
                					record.set("usable", usable);
        						}
        					}
        				}
        				grid.getView().refresh();
	    	    		myMask.hide();
	    	    		utils.show_msg(json.msg);
	    	    	},function(json){
	    	    		utils.show_msg(json.msg);
	    	    		myMask.hide();
	    	    	});
    	    	},
    	    	//合并区服
    	    	merge_partition : function(){
    	    		var get_select_data = function(){
    	    			var selects = sm.getSelections();
    	    	    	var data = [];
    	    	    	if(selects.length == 0){
    	    	    		utils.show_msg('请选择要合并的区服');
    	    	    		return false;
    	    	    	}
    	    	    	for(var index = 0; index < selects.length; index++){
    	    	    		var partition_info = selects[index].data;
    	    	    		if(partition_info.usable == 0){
    	    	    			utils.show_msg("请选择上线的区服进行合并,【"+partition_info.partition_name+"】不是上线状态的区服");
    	    	    			return false;
    	    	    		}
    	    	    		data.push(partition_info);
    	    	    	}
    	    	    	return data;
    	    		}
    	    		var select_data = get_select_data();
    	    		if(!select_data)
    	    			return false;
	    			var win =  new fw.FormWindowUi({
                        title : "合并游戏区服<font color='red'>(已经选择的区服在合并后会下线，同时【相应商品的区服】会同步为【合并后的区服】)</font>",
                        width : 410,
                        height : 300,
                        labelWidth : 60,
                        id : Ext.id(),
                    });
	    			win.addItem({
	    				xtype : "label", html : "已选择的区服信息:"
	    			});
	    			for(var i = 0; i < select_data.length; i++){
	    				var da = select_data[i];
	    				win.addItem({
		    				xtype : "compositefield", disabled : true, items : [
	    				        {xtype : "displayfield", value : "区服ID"},
	    				        {xtype : "textfield", value : da.partition_id, width : 60},
	    				        {xtype : "displayfield", value : "区服名称"},
	    				        {xtype : "textfield", value : da.partition_name, width : 80},
	                        ]
		    			});
	    			}
	    			
	    			win.addItem({
    	    			xtype : "combo", fieldLabel : "合并到", allowBlank: false, width : 100, triggerAction: 'all',
                        typeAhead : true, mode : "local",
                        valueField: "partition_id", displayField: "partition_name",
                        id : me.__make_id("merge_partition"),
                        editable : false,
                        store : me.createStore(),
                        listeners : {
                        	render : function(combo){
                        		for(var i = 0; i < select_data.length; i++){
                        			var record = new me.fields(select_data[i]);
                        			combo.store.add([record]);
                        		}
                        	},
                        	select : function(combo, record, index){
                        		me.__get_cmp("merged_partition_id").setValue(record.get("partition_id"));
                        		me.__get_cmp("merged_partition_name").setValue(record.get("partition_name"));
                        	}
                        }
    	    		});
	    			win.addItem({
	    				xtype : "label", text : "合并后的区服信息:",
	    			});
	    			win.addItem({
	    				xtype : "textfield", disabled : true, fieldLabel : "区服ID", id : me.__make_id("merged_partition_id"), width : 100,
	    			});
	    			win.addItem({
	    				xtype : "textfield", fieldLabel : "区服名称", id : me.__make_id("merged_partition_name"), width : 100
	    			});
	    			win.onClickSubmit = function(){
	    				var game_id = utils.get_data("game_id");
	    				var data = [];
	    				var merged_partition_id = me.__get_cmp("merged_partition_id").getValue();
	    				if(merged_partition_id == ""){
	    					utils.show_msg("请选择合并到哪个区服");
	    					return false;
	    				}
	    				var merged_partition_name = me.__get_cmp("merged_partition_name").getValue();
	    				for(var i = 0; i<select_data.length; i++){
	    					var da = select_data[i];
	    					var select_partition_id = da.partition_id;
	    					if(select_partition_id == merged_partition_id){
	    						//如果是要合并到的区服，将修改该区服的名称重新获取
	    						da.partition_name = merged_partition_name
	    					}
	    					else{
	    						//如果是被合并的区服，将该区服下线
	    						da.usable = 0;
	    					}
	    					data.push(da);
	    				}
        	    		var json = Ext.util.JSON.encode(data);
        	    		var merge_result_data = Ext.util.JSON.encode({partition_id : merged_partition_id, partition_name : merged_partition_name});
    	    	    	var myMask = new Ext.LoadMask(Ext.getBody(), {msg : "保存中, 可能需要一些时间"});
    	    	    	myMask.show();
                		var params = {game_id : game_id, data : json, merge_result_data : merge_result_data};
            			utils.http_request(utils.build_url("gamePartition/updateMergePartition"), params, function(json){
            				if(json.success){
            					//修改合并区服后的界面信息
            					var records = store.getRange();
                				for(var i =0; i < records.length; i++){
                					for(index in data){
                						var record = records[i];
                						if(record.get("id") == data[index].id){
                        					record.set("usable", data[index].usable);
                        					record.set("partition_name", data[index].partition_name);
                						}
                					}
                				}
            					grid.getView().refresh();
        	    	    		myMask.hide();
        	    	    		utils.show_msg(json.msg);
            				}
            			}, function(json){
            				utils.show_msg(json.msg);
    	    	    		myMask.hide();
            			});
	    			}
	    			win.onSubmitSuccess = function(json){
                        if(json.success){
                            utils.tips(json.msg);
                            win.close();
                        }   
                        else{
                            utils.show_msg(json.msg);
                        }   
                    } 
    	    		win.show();
    	    		
    	    	},
    	    	items : [
    	    	    {xtype : "button", text : "区服批量上线", icon : "static/libs/icons/arrow_up.png", width : 80, handler : function(){
    	    	    	utils.show_confirm("确定要批量上线区服吗？", function(){
    	    	    		tbar2.update_usable(1);
    	    	    	});
    	    	    }},
    	    	    '-','-',
    	    	    {xtype : "button", text : "区服批量下线", icon : "static/libs/icons/arrow_down.png", width : 80, handler : function(){
    	    	    	utils.show_confirm("下线区服同时会将区服下的商品也下架，确认要下线区服吗？", function(){
    	    	    		tbar2.update_usable(0);
    	    	    	});
    	    	    }},'-',
    	    	    {xtype : "button", text : "合并区服", icon : "static/libs/icons/arrow_in.png", width : 80, handler : function(){
    	    	    	tbar2.merge_partition();
    	    	    }}
    	    	],
    	    });
    	    var myColumns = function createColumns(){
    			var me = this;
    			return [
    			    new Ext.grid.RowNumberer,
    			    sm,
    	        	{header : "区服分组名称", dataIndex : "category_name", align : "center", width : 80, },
    	        	{header : "区服ID", dataIndex : "partition_id", align : "center", width : 80, },
    	        	{header : "区服名称", dataIndex : "partition_name", align : "center", width : 80, editor: new Ext.form.TextField({allowBlank: false})},
    	        	{header : "权重", dataIndex : "weight", align : "center", width : 80, editor : new Ext.form.NumberField({allowBlank: false})},
    	        	{header:"状态", dataIndex:"usable", align:"center", width:30, editor: new Ext.form.ComboBox({
                    	triggerAction: 'all', typeAhead : true, editable: false, model:"local", store: [[1, "上线"], [0, "下线"]],
                    }), renderer : function(value, metaData, record, rowIndex, colIndex, store){
                    	if(value == 0) return "<font color='red'>下线</font>";
                    	if(value == 1) return "上线";
                    }},
    	        	{header : "操作", dataIndex : "op",align : "center", layout : "fit", width : 80, renderer : function(value, metaData, record, rowIndex, colIndex, store){
    	        		return "<a href='javascript:void(0)'>删除</a>";
    	        	}},
    			];
    		};
        	var grid = new Ext.grid.GridPanel({
        		autoDestroy : true,
                frame : true,
                stripeRows : true,
                height : 500,
                autoScroll: true,
                plugins: [editor],
                sm : sm,
                view : new Ext.grid.GridView({
                    forceFit: true,
                    enableRowBody: true,
                }),
                store : store, 
                columns : myColumns(), 
                tbar :tbar1,
                listeners : {
                	render : function(g){
                		var store = g.store;
                		tbar2.render(g.tbar);
                	},
		        	cellclick: function(grid, rowIndex, columnIndex, e){
		        		is_editor = true;
		        		//删除单个区
		        		var record = grid.getStore().getAt(rowIndex);
                        var fieldName = grid.getColumnModel().getDataIndex(columnIndex);
                        //如果是区服分组ID 不弹出修改界面
                        if(fieldName == "category_name" ){
                        	is_editor = false;
                        	return false;
                        }
                        if(fieldName == "op"){
                        	is_editor = false;
                        	utils.show_confirm("删除该分区服是不可恢复的操作，确定要删除吗？",function(){
                        		//先蒙起来
                        		var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "删除中，这可能需要一点时间..." });
                        		myMask.show();

                        		var id = record.get("id");
                            	var game_id = utils.get_data("game_id");
                            	var partition_id = record.get("partition_id");
                            	var category_id = record.get("category_id");
                            	utils.http_request(utils.build_url("gamePartition/deletePartition"), {game_id : game_id, id: id, partition_id : partition_id, category_id : category_id}, function(json){
                        			if(json.success){
                        				me.info_change();
                                    	store.remove(record);
                                    	utils.tips("操作成功");
                        			}
                        			//完成请求后重新去除蒙板
                        			 myMask.hide();
                        		}, function(json){
                        			//完成请求后重新去除蒙板
                       			 	myMask.hide();
                       			 	utils.show_msg(json.msg);
                        		});
                        	});
                        }
		        	},
                },
        	});
        	
        	return grid;
        },
        createStore : function(){
        	var me = this;
            return new Ext.data.JsonStore({
                fields : me.fields,
                root : "data",
                titalProperty : "total",
            });
        },
        createFields : function(){
			var me = this;
			return Ext.data.Record.create([
                {name : "id"},       
			    {name : "partition_id"},
                {name : "category_name"},
                {name : "category_id"},
                {name : "partition_name"},
                {name : "weight"},
                {name : "usable"},
			]);
		},
		
		createFieldset : function(category_name, weight, data, category_id, group_id){
			var me = this;
			
			this.grid = me.createPartitionCategoryPanel(Ext.id(), category_name, weight, data, category_id, group_id);
			//保存区服分组的gird
			this.category[category_name] = this.grid;
			//区服分组
			var fieldset = new Ext.form.FieldSet({
				 title: category_name,
				 collapsible : true,
				 collapsed : true,
	             autoHeight:true,
	             autoScroll: true,
	             defaultType: 'textfield',
	             items :[
	                //区服列表
                	this.grid,
	             ]
			});
			return fieldset;
		},
		add_groups : function(data, group_id){
			//一个一个的区服组add到panel中
			for(var i = 0; i<data.length; i++){
				var category = data[i];
				this.add_group(category, group_id);
			}
		},
		add_group : function(category, group_id, op_type){
			var fieldset = this.createFieldset(category.category_name,category.weight, category.partitions, category.category_id, group_id);
			//如果是新增的区服分组，展示列表
			if(op_type == "add_new"){
				fieldset.collapsed = false;
			}
			this.add(fieldset);
			this.doLayout();
		},
		remove_all : function(){
			this.removeAll();
			this.category = [];
		},
		_remove_sub : function(cmp){
			this.remove(cmp);
			this.doLayout();
		},
		info_change : function(){
			//to be implement
		},
		_create_record : function(da){
			var record = new this.fields({
				id : da.id,
				partition_id : da.partition_id,
				category_name : da.category_name,
				category_id : da.category_id,
    			partition_name : da.partition_name,
    			weight : da.weight,
    			usable : da.usable,
    		});
			return record;
		},
		_get_record_data_to_obj : function(record){
			var data = {
				id : record.get("id"),
				partition_id : record.get("partition_id"), 
				partition_name : record.get("partition_name"),
				weight : record.get("weight"),
				usable : record.get("usable"),
			};
			return data;
		},
		get_data : function(){
			var partition_category = [];
			for(var category_name in this.category){
				//判断数组是否为空
				if(category_name == 'remove')
					return partition_category;
				var records = this.category[category_name].store.getRange();
				var weight = 0;
				if(records.length > 0){
					weight = records[0].get("weight");
				}
				var row = {category_name : category_name, weight : weight};
				var partitions = [];
				for(var i = 0; i<records.length; i++){
					var record = records[i];
					partitions[i] = {
						id : record.get("id"),
						category_name : record.get("category_name"), 
						partition_id : record.get("partition_id"), 
						partition_name : record.get("partition_name"),
						weight : record.get("weight"),
						usable : record.get("usable"),
					};
				}
				row.partitions = partitions;
				partition_category.push(row);
			}
			return partition_category;
		}
	});
	exports.GamePartitionCategoryPanel = GamePartitionCategoryPanel;
});
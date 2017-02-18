define(function(require, exports){
	var utils = require('../utils.js');
	var agpcp = require('./GamePartitionCategoryPanel.js');
	var CreateGamePartitionCategoryPanel = Ext.extend(Ext.Panel, {
		__make_id : function(name){
			return "CreateGamePartitionCategoryPanel"+ this.id + name;
		},
		__get_cmp : function(name){
            var id = this.__make_id(name);
            return Ext.getCmp(id);
        },
		constructor : function(id, group_id){
			var me = this;
        	//区服分组
			this.id = id;
			this.group_id = group_id;
			//默认新增的区服组权重
			this.category_weight = 1;
			//默认新增的区服起始权重
			this.max_partition_weight = 1;
        	this.categoryPanel = new agpcp.GamePartitionCategoryPanel(Ext.id());
        	CreateGamePartitionCategoryPanel.superclass.constructor.call(this, {
				id : id,
				padding: 8,
                border: false,
                anchor: "95%",
        		autoHeight:true,
                tbar: [
                    "区服分组名称:",
                    {id: me.__make_id("grp_name"), xtype: "textfield", width: 100},
                    '-',
                    "区服分组权重",
                    {id: me.__make_id("weight"), xtype: "textfield", width: 100, value : 100},
                    '-',
                    "区名前缀：",
                    {id: me.__make_id("prefix"), xtype: "textfield", width: 60},
                    '-',
                    {id: me.__make_id("start_type"), xtype: "combo", width: 80, triggerAction: 'all', typeAhead : true, editable: false, model:"local", value: 1, 
                        store: [[1, "起始数字"], [2, "起始文字"]]},
                    {id: me.__make_id("start_num"), xtype: "numberfield", width: 40, value: 1},
                    '-',
                    "区服单位:",
                    {id: me.__make_id("unit"), xtype: "textfield", width: 40, value: "区"},
                    '-',
                    "起始权重:",
                    {id: me.__make_id("start_weight"), xtype: "numberfield", width: 40, value: 100},
                    '-',
                    '权重排序:',
                    {id: me.__make_id("weight_sort"), xtype: "combo", width: 80, triggerAction: 'all', typeAhead : true, editable: false, model:"local", value: "asc", 
                        store: [["asc", "升序"], ["desc", "降序"]]},
                    '-',
                    "创建数量:",
                    {id: me.__make_id("create_num"), xtype: "numberfield", width: 40, value: 10},
                    '-',
                    {xtype: "button", text: "创建分组", widht: 80, icon: "static/libs/icons/add.png", handler: function(p){
                    	var grp_name = me.__get_cmp("grp_name").getValue();
                    	var weight = me.__get_cmp("weight").getValue();
                        if(grp_name == ""){
                        	utils.show_msg("请填写区服分组名称");
                        	return false;
                        }
                        var records = me._generate_records(grp_name);
                        if(records.length != 0){
                    		var game_id = utils.get_data("game_id");
                        	var data = {
                        		category_name : grp_name,
                        		game_id : game_id,
                        		weight : weight,
                        		game_channel_group_id : me.group_id,
                        		partitions : records,
                        	};
                        	var data_json = Ext.util.JSON.encode(data);
                        	utils.http_request(utils.build_url("gamePartitionCategory/add"), {data : data_json}, function(json){
                        		if(json.success){
                        			var category = json.data;
                        			me._update_weight(category);
                        			me.categoryPanel.add_group(category, me.group_id, "add_new");
                                	me.categoryPanel.doLayout();
                                    //utils.scroll_bottom(me.inner_pannel);
                        		}
                        	});
                        	
                        }
                    }}
                ],
                items : [this.categoryPanel],
			});
		},
		//获取区服组的权重和区服的权重并更新到当前权重最大
		_update_weight : function(category){
			if(this.category_weight <= category.weight){
				this.category_weight = parseInt(category.weight)+1;
			}
			var partitions = category.partitions;
			for(var j = 0; j < partitions.length; j++){
				var partition = partitions[j];
				if(this.max_partition_weight <= partition.weight){
					this.max_partition_weight = parseInt(partition.weight)+1;
				}
			}
			this.__get_cmp("weight").setValue(this.category_weight);
			this.__get_cmp("start_weight").setValue(this.max_partition_weight);
		},
		 _generate_records: function(grp_name){
            var records = [];
            var me = this;
            var start_num = utils.parseInt(me.__get_cmp("start_num").getValue());
            if(start_num <= 0){
                utils.show_msg("请设置起始数字/起始文字为一个大于0的数字");
                return records;
            }
            
            var create_num = utils.parseInt(me.__get_cmp("create_num").getValue());
            if(create_num <= 0){
                utils.show_msg("请设置创建数量为一个大于0的数字");
                return records;
            }
            var start_type = me.__get_cmp("start_type").getValue();

            var start_weight = utils.parseInt(me.__get_cmp("start_weight").getValue());
            if(start_weight <= 0){
                utils.show_msg("请设置起始权重为一个大于0的数字");
                return records;
            }
            
            var weight_sort = me.__get_cmp("weight_sort").getValue();
            var unit = me.__get_cmp("unit").getValue();

            var prefix = me.__get_cmp("prefix").getValue();

            for(var i=0; i<create_num; ++i){
                var area = start_num+i;
                var weight = start_weight;
                if(weight_sort == "asc"){
                    weight += i;
                }
                if(weight_sort == "desc"){
                    weight -= i;
                    if(weight < 0)
                        weight = 0;
                }
                var game_id = utils.get_data("game_id");
                var game_channel_group_id = this.group_id;
                var record = {game_id : game_id, category_name : grp_name, game_channel_group_id : game_channel_group_id, weight : weight, usable : 1};
                //起始数字
                if(start_type == 1){
                    record.partition_name = prefix+area+unit ;
                }
                //起始文字
                if(start_type == 2){
                    var nc = new utils.number_change(area+"");
                    var zh_area = nc.pri_ary();
                    record.partition_name = prefix+zh_area+unit;
                }
                records.push(record);
            }
            return records;
	    },
	    remove_all : function(){
	    	this.categoryPanel.remove_all();
	    },
		get_data : function(){
			var partition_category = this.categoryPanel.get_data();
			return partition_category;
		},
		
		set_data : function(partition_category, group_id){
			
			//获取该渠道分组中区服分组和区服最大的权重
			//category.category_name,category.weight, category.partitions
			for(var i = 0; i< partition_category.length; i++){
				this._update_weight(partition_category[i]);
			}
			if(partition_category != undefined){
				this.group_id = group_id;
        		this.categoryPanel.add_groups(partition_category, group_id);
        	}
		}
		
	});
	exports.CreateGamePartitionCategoryPanel = CreateGamePartitionCategoryPanel;
});
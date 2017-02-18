define(function(require, exports){

    var utils = require("../utils.js");
    var fw = require("../../com/FormWindow.ui.js");
    
    
    var DictionaryPanel = Ext.extend(Ext.Panel, {
        __make_id: function(name){
            return this.id + ":" + name;
        },  
        __get_cmp: function(name){
            return Ext.getCmp(this.__make_id(name));
        },

        constructor: function(id){
            this.id = id;
            this.groupPanel = this.createGroupPanel();
            this.itemPanel = this.createItemPanel();
            DictionaryPanel.superclass.constructor.call(this, {
                id: id,
                layout: "border",
                title: "字典编辑",
                items: [
                    this.groupPanel, 
                    new Ext.Panel({
                        region: "east",
                        layout: "fit",
                        width: 550,
                        collapsible: true,
                        split: true,
                        border:false, 
                        items: [this.itemPanel]
                    })
                ]
            });
        },
        
        createGroupPanel: function(){
            var me = this;
            var store = new Ext.data.JsonStore({
                url: utils.build_url("adminDictionary/getGroups"),
                baseParams: {'authority_type':authority_type},
                fields: [
                    {name: "id"},
                    {name: "group_code"},
                    {name: "group_name"},
                    {name: "description"},
                    {name: "status"},
                    {name: "sort"},
                    {name: "create_time"},
                ],
                root: "data",
                totalProperty: "total",
                listeners: {
                    beforeload: function(s){
                        s.baseParams.group_code = Ext.getCmp("sel_group_code").getValue();
                        s.baseParams.group_name = Ext.getCmp("sel_group_name").getValue();
                    }
                }
            });
            var sm = new Ext.grid.CheckboxSelectionModel({
                listeners: {
                    rowselect: function(sm, rowIndex, r){
                        //选中的组编码存储到itemPanel中
                        me.itemPanel.group_code = sm.getSelected().get("group_code");
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
                layout: "fit",
                loadMask : true,
                border: false,
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
                    {header:"ID", dataIndex:"id", align:"center", width:10},
                    {header:"组编码", dataIndex:"group_code", align:"center", width:10, editor: new Ext.form.TextField()},
                    {header:"组名称", dataIndex:"group_name", align:"center", width:10, editor: new Ext.form.TextField()},
                    {header:"组描述", dataIndex:"description", align:"center", width:10, editor: new Ext.form.TextField()},
                    {header:"排序权重", dataIndex:"sort", align:"center", width:10, editor: new Ext.form.NumberField()},
                    {header:"状态", dataIndex:"status", align:"center", width:10, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                        if(value == 1)
                            return "<b>上线</b>";
                        if(value == 0)
                            return "<font color='gray'>下线</font>";
                        return value;
                    }},
                    {header:"创建时间", dataIndex:"create_time", align:"center", width:10},
                    {header:"操作", dataIndex:"opt", align:"center", width:10, hidden : true,renderer : function(value, metaData, record, rowIndex, colIndex, store){
                        var delId = utils.createGridBtn({
                            text: "删除",
                            icon: "static/libs/icons/delete.png",
                            width: 60,
                            handler: function(){
                                utils.show_confirm("确认删除这个字典组?", function(){
                                    utils.http_request(utils.build_url("adminDictionary/deleteGroups"), {id: record.get("id")}, function(json){
                                        utils.tips("删除字典组成功");
                                        grid.store.reload();
                                        me.itemPanel.store.removeAll();
                                    });
                                });
                            }
                        });
                        return '<div style="width:70px;float:left;"><span id="' + delId + '" /></div>';
                    }},
                ],
                bbar: new Ext.PagingToolbar({
                    store : store,
                    pageSize : pageSize, 
                    displayInfo : true
                }),
                tbar: [
                    {xtype: "button", text: "创建字典组", icon: "static/libs/icons/add.png", width: 100, handler: function(){
                        var win = new fw.FormWindowUi({
                            title: "创建字典组",
                            width: 500,
                            height: 220,
                            need_confirm: false,
                        });
                        win.addItem({
                            xtype: "textfield", fieldLabel: "组编码", name: "group_code", anchor: "95%", allowBlank: false
                        });
                        win.addItem({
                            xtype: "textfield", fieldLabel: "组名称", name: "group_name", anchor: "95%", allowBlank: false
                        });
                        win.addItem({
                            xtype: "textfield", fieldLabel: "组描述", name: "description", anchor: "95%"
                        });
                        win.addItem({
                            xtype: "numberfield", fieldLabel: "排序权重", name: "sort", anchor: "95%"
                        });
                        win.onClickSubmit = function(){
                            win.submit(utils.build_url("adminDictionary/addGroup?authority_type="+authority_type));
                        };
                        win.onSubmitSuccess = function(json){
                            utils.tips("保存字典组成功");
                            grid.store.load({params: {start: 0, limit: pageSize}});
                            win.close();
                        };
                        win.show();
                    }},
                    '-',
                    {xtype: "button", text: "上线", icon: "static/libs/icons/lock_add.png", width: 100, handler: function(){
                        var selections = grid.getSelectionModel().getSelections();
                        if(selections.length == 0){
                            utils.show_msg("请先选择需要上线的字典组");
                            return;
                        }

                        var id = selections[0].get("id");
                        for(var i=1; i<selections.length; ++i){
                            id += "`" + selections[i].get("id");
                        }
                        utils.http_request(utils.build_url("adminDictionary/updateEnableGroups"), {id: id}, function(json){
                            utils.tips("上线成功");
                            grid.store.load({params: {start: 0, limit: pageSize}});
                        });
                    }},
                    '-',
                    {xtype: "button", text: "下线", icon: "static/libs/icons/lock_delete.png", width: 100, handler: function(){
                        var selections = grid.getSelectionModel().getSelections();
                        if(selections.length == 0){
                            utils.show_msg("请先选择需要下线的字典组");
                            return;
                        }

                        var id = selections[0].get("id");
                        for(var i=1; i<selections.length; ++i){
                            id += "`" + selections[i].get("id");
                        }
                        utils.http_request(utils.build_url("adminDictionary/updateDisableGroups"), {id: id}, function(json){
                            utils.tips("下线成功");
                            grid.store.load({params: {start: 0, limit: pageSize}});
                        });
                    }},
                    '-',
                    "组编码：", {id: "sel_group_code", xtype: "textfield", width: 100},
                    "组名称：", {id: "sel_group_name", xtype: "textfield", width: 100},
                    {xtype: "button", text: "筛选", icon: "static/libs/icons/zoom.png", width: 80, handler: function(){
                        grid.store.load({params: {start: 0, limit: pageSize}});
                    }}
                ],
                listeners: {
                    render: function(p){
                        grid.store.load({params: {start: 0, limit: pageSize}});
                    },
                    afteredit: function(e){
                        if(e.field == "group_code"){
                            utils.http_request(utils.build_url("adminDictionary/updateGroupCode"), {id: e.record.get("id"), value: e.value}, function(json){
                                grid.store.reload();
                            }, function(json){
                                utils.show_msg(json.msg);
                                grid.store.reload();
                            });
                        }
                        if(e.field == "group_name"){
                            utils.http_request(utils.build_url("adminDictionary/updateGroupName"), {id: e.record.get("id"), value: e.value}, function(json){
                                grid.store.reload();
                            }, function(json){
                                utils.show_msg(json.msg);
                                grid.store.reload();
                            });
                        }
                        if(e.field == "description"){
                            utils.http_request(utils.build_url("adminDictionary/updateGroupDescription"), {id: e.record.get("id"), value: e.value}, function(json){
                                grid.store.reload();
                            }, function(json){
                                utils.show_msg(json.msg);
                                grid.store.reload();
                            });
                        }
                        if(e.field == "sort"){
                            utils.http_request(utils.build_url("adminDictionary/updateGroupSort"), {id: e.record.get("id"), value: e.value}, function(json){
                                grid.store.reload();
                            }, function(json){
                                utils.show_msg(json.msg);
                                grid.store.reload();
                            });
                        }
                    },
                }
            });

            return grid;
        },

        createItemPanel: function(){
            var me = this;
            var store = new Ext.data.JsonStore({
                url: utils.build_url("adminDictionary/getItems"),
                fields: [
                    {name: "id"},
                    {name: "group_code"},
                    {name: "name"},
                    {name: "code"},
                    {name: "description"},
                    {name: "sort"},
                    {name: "create_time"},
                    {name: "status"},
                ],
                root: "data",
                totalProperty: "total_count",
                listeners: {
                    beforeload: function(s){
                        s.baseParams.group_code = grid.group_code;
                    }
                }
            });
            var sm = new Ext.grid.CheckboxSelectionModel();
            var pageSize = 50;
            var grid = new Ext.grid.EditorGridPanel({
                title: "字典项编辑",
                border:false,
                layout: "fit",
                sm: sm,
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
                    {header:"Code", dataIndex:"code", align:"center", width:10, editor: new Ext.form.TextField()},
                    {header:"Name", dataIndex:"name", align:"center", width:10, editor: new Ext.form.TextField()},
                    {header:"描述", dataIndex:"description", align:"center", width:10, editor: new Ext.form.TextField()},
                    {header:"排序权重", dataIndex:"sort", align:"center", width:10, editor: new Ext.form.NumberField()},
                    {header:"状态", dataIndex:"status", align:"center", width:10, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                        if(value == 1)
                            return "<b>上线</b>";
                        if(value == 0)
                            return "<font color='gray'>下线</font>";
                        return value;
                    }},
                    {header:"操作", dataIndex:"opt", align:"center", width:10, hidden : true, renderer : function(value, metaData, record, rowIndex, colIndex, store){
                        var delId = utils.createGridBtn({
                            text: "删除",
                            icon: "static/libs/icons/delete.png",
                            width: 60,
                            handler: function(){
                                utils.show_confirm("确认删除这个字典项?", function(){
                                    utils.http_request(utils.build_url("adminDictionary/deleteItem"), {id: record.get("id")}, function(json){
                                        utils.tips("删除字典项成功");
                                        grid.store.reload();
                                    });
                                });
                            }
                        });
                        return '<div style="width:70px;float:left;"><span id="' + delId + '" /></div>';
                    }},
                ],
                bbar: new Ext.PagingToolbar({
                    store : store,
                    pageSize : pageSize, 
                    displayInfo : true
                }),
                tbar: [
                    {xtype: "button", text: "添加字典项", width: 80, icon: "static/libs/icons/add.png", handler: function(){
                        if(grid.group_code == undefined){
                            utils.show_msg("请先选择字典组后再添加字典项");
                            return;
                        }

                        var win = new fw.FormWindowUi({
                            title: "添加字典项",
                            width: 500,
                            height: 220,
                            need_confirm: false,
                        });
                        win.addItem({
                            xtype: "textfield", fieldLabel: "Code", anchor: "95%", name: "code", allowBlank: false
                        });
                        win.addItem({
                            xtype: "textfield", fieldLabel: "Name", anchor: "95%", name: "name", allowBlank: false
                        });
                        win.addItem({
                            xtype: "textfield", fieldLabel: "描述", anchor: "95%", name: "description"
                        });
                        win.addItem({
                            xtype: "numberfield", fieldLabel: "排序权重", name: "sort", anchor: "95%"
                        });
                        win.onClickSubmit = function(){
                            win.submit(utils.build_url("adminDictionary/addItem"), {group_code: grid.group_code});
                        }
                        win.onSubmitSuccess = function(json){
                            utils.tips("添加字典项成功");
                            grid.store.load();
                            win.close();
                        }
                        win.show();
                    }},
                    '-',
                    {xtype: "button", text: "上线", width: 80, icon: "static/libs/icons/lock_add.png", handler: function(){
                        var selections = grid.getSelectionModel().getSelections();
                        if(selections.length == 0){
                            utils.show_msg("请先选择需要上线的字典项");
                            return;
                        }

                        var id = selections[0].get("id");
                        for(var i=1; i<selections.length; ++i){
                            id += "`" + selections[i].get("id");
                        }
                        utils.http_request(utils.build_url("adminDictionary/updateEnableItems"), {id: id}, function(json){
                            utils.tips("上线成功");
                            grid.store.reload();
                        });
                    }},
                    '-',
                    {xtype: "button", text: "下线", width: 80, icon: "static/libs/icons/lock_delete.png", handler: function(){
                        var selections = grid.getSelectionModel().getSelections();
                        if(selections.length == 0){
                            utils.show_msg("请先选择需要下线的字典项");
                            return;
                        }

                        var id = selections[0].get("id");
                        for(var i=1; i<selections.length; ++i){
                            id += "`" + selections[i].get("id");
                        }
                        utils.http_request(utils.build_url("adminDictionary/updateDisableItems"), {id: id}, function(json){
                            utils.tips("下线成功");
                            grid.store.reload();
                        });
                    }},
                ],
                listeners: {
                    afteredit: function(e){
                        if(e.field == "name"){
                            utils.http_request(utils.build_url("adminDictionary/updateItemName"), {id: e.record.get("id"), value: e.value}, function(json){
                                grid.store.reload();
                            }, function(json){
                                utils.show_msg(json.msg);
                                grid.store.reload();
                            });
                        }
                        if(e.field == "code"){
                            utils.http_request(utils.build_url("adminDictionary/updateItemCode"), {id: e.record.get("id"), value: e.value}, function(json){
                                grid.store.reload();
                            }, function(json){
                                utils.show_msg(json.msg);
                                grid.store.reload();
                            });
                        }
                        if(e.field == "description"){
                            utils.http_request(utils.build_url("adminDictionary/updateItemDescription"), {id: e.record.get("id"), value: e.value}, function(json){
                                grid.store.reload();
                            }, function(json){
                                utils.show_msg(json.msg);
                                grid.store.reload();
                            });
                        }
                        if(e.field == "sort"){
                            utils.http_request(utils.build_url("adminDictionary/updateItemSort"), {id: e.record.get("id"), value: e.value}, function(json){
                                grid.store.reload();
                            }, function(json){
                                utils.show_msg(json.msg);
                                grid.store.reload();
                            });
                        }
                    }
                }
            });
           

            return grid;
        }
    });

    var viewPort = new Ext.Viewport({
        layout: 'fit',
        items: [{
            xtype: 'panel',
            items: [new DictionaryPanel()],
            layout: 'fit',
            region: 'center'
        }]
    });

    
    exports.DictionaryPanel = DictionaryPanel;
});


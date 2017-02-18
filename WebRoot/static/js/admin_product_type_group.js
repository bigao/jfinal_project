define(function(require, exports, module) {
    var URLS = {
        GET: "adminProductTypeGroup/getList",//获取列表url
    };
   
    var utils = require('./utils.js');
    
    var createDataStore =  function() {
        return new Ext.data.JsonStore({
            autoDestroy: true,
        	autoLoad : true,
            url: URLS.GET,
            baseParams: {start:0, limit: 50},
            root: 'data',
            idProperty: 'product_type_group_id',
            totalProperty: 'total_count',
            fields:[ 
                {name : 'product_type_group_id'},
                {name: 'name'},
                {name: 'usable'},
                {name: 'weight'},
                {name: 'description'}
            ]
        });
    };

    Ext.QuickTips.init();
    Ext.form.Field.prototype.msgTarget='side';
    
    var myPanel = Ext.extend(Ext.grid.EditorGridPanel, {
        createColumn: function(me) {
            return [
                // new Ext.grid.RowNumberer,
                me.sm,
                {header: '一级分类ID', dataIndex: 'product_type_group_id', align: 'left', sortable: true, width: 100},
                {header: '名称', dataIndex: 'name', align: 'left', sortable: false, width: 100},
                {header: '是否可用', dataIndex: 'usable', align: 'left', sortable: false, width: 100, 
                	renderer: function(value){
                		if(value==1){
                			return '是';
                		}else{
                			return '否';
                		}
                	}
                },
                {header: '权重', dataIndex: 'weight', align: 'left', sortable: false, width: 100,editor: new Ext.form.NumberField()},
                {header: '一级分类描述', dataIndex: 'description', align: 'left', sortable: false, width: 100}
            ];
        },

        viewConfig : {
        	forceFit: true,
        },
        
        constructor: function() {
            var me = this;
            me.pageSize = 50; 
            me.store = createDataStore();
            me.sm = new Ext.grid.CheckboxSelectionModel();
            me.column = me.createColumn(me);
            myPanel.superclass.constructor.call(this, {
                id: "tab:admin:product_type_group_list",
                title: "商品一级分类管理",
                columns: me.column,
                layout: 'fit',
                loadMask: true,
                bbar: new Ext.PagingToolbar({store: this.store, pageSize: this.pageSize, displayInfo: true}),
                listeners:  {
                    render: function() {
                        me.store.load({params: {start:0, limit: this.pageSize}});
                    },
                  afteredit: function(e){
                  if(e.field == "weight"){
                      utils.http_request(utils.build_url("adminProductTypeGroup/update"), {product_type_group_id: e.record.get("product_type_group_id"), weight: e.value}, function(json){
                          me.store.reload();
                      }, function(json){
                          utils.show_msg(json.msg);
                          me.store.reload();
                      });
                  }
               },
              }
            });
        },
        
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

define(function(require, exports){
    var sm = require("navimng_brick/view/com/SelectionModelRectify.js")

    var SelectCardGridUi = Ext.extend(Ext.Panel, {
        constructor : function(config){
            config = config || {};

            this.grid1 = this.createGrid(config);
            this.btnPanel = this.createTransBtnPanel(config);
            this.grid2 = this.createGrid(config);
            Ext.apply(config, {
                border : false,
                autoDestroy : true,
                layout : "column",
            });

            SelectCardGridUi.superclass.constructor.call(this, config);

            this.add(new Ext.Panel({
                border : false,
                padding : 5,
                columnWidth : 0.4,
                height : config.height,
                items : [this.grid1]
            }));
            this.add(this.btnPanel);
            this.add(new Ext.Panel({
                border : false,
                padding : 5,
                columnWidth : 0.4,
                height : config.height,
                items : [this.grid2]
            }));
            this.doLayout();
        },

        createGrid : function(config){
            var grid = new Ext.grid.GridPanel({
                border : true,
                autoDestroy : true,
                loadMask : true,
                stripeRows : true,
                height : config.height - 10,
                layout : "fit",
                view : config.createView ? config.createView() : null,
                store : config.createStore(grid),
                sm : new sm.XRowSelectionModel(),
                columns : config.createColumns(grid)
            });

            return grid;
        },

        createTransBtnPanel : function(config){
            var me = this;
            return new Ext.Panel({
                border : false,
                layout : {
                    type : "vbox",
                    padding : 1,
                    pack : 'center',
                    align : "center",
                },
                columnWidth : 0.15,
                height : config.height,
                items : [
                    {xtype : "button", icon : "/_portal/img/icons/arrow_right.png", width : 60, handler : function(btn){
                        me.selectElements();
                    }},
                    {xtype : "button", icon : "/_portal/img/icons/arrow_left.png", width : 60, handler : function(btn){
                        me.unselectElements();
                    }}
                ]
            });
        },

        getGrid1 : function(){
            return this.grid1;
        },

        getGrid2 : function(){
            return this.grid2;
        },

        //该方法可供使用者覆盖, 以决定如何在两个gridpanel之间转换record
        //grid1 => grid2
        convert : function(records){
            return records;
        },

        //该方法可供使用者覆盖, 以决定如何在两个gridpanel之间转换record
        //grid2 => grid1
        unconvert : function(records){
            return records;
        },

        selectElements : function(){
            var rec_arr = this.grid1.getSelectionModel().getSelections();
            //转换成grid2的record
            var new_rec_arr = this.convert(rec_arr);
            //移动到grid2中
            this.grid1.store.remove(rec_arr);
            this.grid2.store.add(new_rec_arr);
        },

        unselectElements : function(){
            var rec_arr = this.grid2.getSelectionModel().getSelections();
            //转换成grid1的record
            var new_rec_arr = this.unconvert(rec_arr);
            //移动到grid1中
            this.grid1.store.add(new_rec_arr);
            this.grid2.store.remove(rec_arr);
        },

        getSelections : function(){
            return this.grid2.store.getRange();
        }
    });

    exports.SelectCardGridUi = SelectCardGridUi;
});
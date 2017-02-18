define(function(require, exports){
    var GridWinUi = Ext.extend(Ext.Window, {
        createStore : function(){
            //to be implemented
        },

        createColumns : function(){
            //to be implemented
        },

        onClickSubmit : function(){
            //to be implemented
        },

        onClickCancel : function(){
            this.close();
        },

        constructor : function(cfg){
            cfg = cfg || {};
            Ext.apply(cfg, {
                title: cfg.title || '', 
                layout: 'fit',
                autoScroll: false,
                style: 'padding:2px;',
                bodyStyle: 'padding:5px;',
                border: false,
                modal: true,
                frame : true,
                closable : cfg.closable == undefined ? true : cfg.closable,
                autoDestroy : cfg.autoDestroy == undefined ? true : cfg.autoDestroy,
                closeAction : cfg.closeAction || "close",
                resizable : cfg.resizable,
                width: cfg.width || 500,
                height: cfg.height || 400
            });

            GridWinUi.superclass.constructor.call(this, cfg);

            this.store = this.createStore();
            this.sm = cfg.sm;
            this.grid = new Ext.grid.GridPanel({
                autoDestroy : cfg.autoDestroy == undefined ? true : cfg.autoDestroy,
                layout : "fit",
                store : this.store,
                columns : this.createColumns(),
                autoScroll : true,
                loadMask : true,
                sm : cfg.sm,
                view : new Ext.grid.GridView({
                    forceFit: true,
                    enableRowBody: true
                }),
            });
            this.add(this.grid);

            var me = this;
            if(!cfg.noButton){
                this.addButton({text : "提交", scope : this}, function(btn){
                    //支持提交前的处理
                    if(me.beforeSubmit && !me.beforeSubmit()){
                        return;
                    }
                    me.onClickSubmit();
                });
                this.addButton({text : "取消", scope : this}, function(btn){
                    me.onClickCancel();
                });
            }

            this.doLayout();
        },
    });

    exports.GridWinUi = GridWinUi;
});
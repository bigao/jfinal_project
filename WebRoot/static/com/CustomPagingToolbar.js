define(function(require, exports){
    var CustomPagingToolbar = Ext.extend(Ext.PagingToolbar, {
        onChangePageSize : function(oldPageSize, newPageSize){
            //default event handler, nothing to do
        },

        constructor : function(cfg){
            cfg = cfg || {};
            Ext.apply(cfg, {
                displayInfo : true
            });
            CustomPagingToolbar.superclass.constructor.call(this, cfg);

            //生成“显示数量”的唯一键
            this._custom_page_size_id = Ext.id();

            var me = this;
            this.addItem('-');
            this.addItem('显示数量');
            this.addItem({
                id : me._custom_page_size_id,
                xtype : "textfield",
                value : this.pageSize
            });
            this.addItem({
                xtype : "button",
                text : "确认",
                handler : function(btn){
                    var _custom_pz_comp = Ext.getCmp(me._custom_page_size_id);
                    if(!_custom_pz_comp)
                        return;

                    var size = parseInt(_custom_pz_comp.getValue());
                    if(size <= 0)
                        size = 20;

                    //执行用户注册的响应时间
                    var onChangePageSizeEvent = cfg.onChangePageSize || me.onChangePageSize;
                    onChangePageSizeEvent(me.pageSize, size);

                    me.pageSize = size;
                    me.doLoad(me.cursor);
                }
            });
            this.doLayout();
        }
    });

    exports.CustomPagingToolbar = CustomPagingToolbar;
});
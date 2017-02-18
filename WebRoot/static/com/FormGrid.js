define(function(require, exports){
    var FormGridUi = Ext.extend(Ext.Panel, {
        constructor : function(config){
            config = config || {};

            if(config.createStore){
                this.store = config.createStore();
            }else{
                //this.store = this.createStore();
            }
            this.form = this.createForm(config);
            this.grid = this.createGrid(config);

            Ext.apply(config, {
                layout : "border",
                border : false,
                closable : config.closable === undefined ? true : config.closable,
                autoDestroy : config.autoDestroy === undefined ? true : config.autoDestroy,
                items : [this.form, this.grid]
            });

            FormGridUi.superclass.constructor.call(this, config);
        },

        createForm : function(config){
            var form = new Ext.form.FormPanel({
                region : "north",
                height : config.form_height || 200,
                fileUpload : config.fileUpload,
                labelWidth : config.labelWidth,
                tbar : config.form_tbar || [],
                bbar : config.form_bbar || []
            });
            return form;
        },

        submit : function(url, params){
            var form = this.form.getForm();
            if (!form.isValid()) { 
                Ext.Msg.alert("提示", "内容不合法或不完整，请正确输入");
                return;
            }

            var me = this;
            form.submit({
                url: url,
                clientValidation : true,
                params : params,
                method: 'POST',
                waitMsg: '正在上传...',
                success: function (form, action) {
                    me.onSubmitSuccess(action.result);
                },
                failure: function(form, action) {
                    switch (action.failureType) {
                        case Ext.form.Action.CLIENT_INVALID:
                            Ext.Msg.alert('提示', '请按条件输入数据');
                            break;
                        case Ext.form.Action.CONNECT_FAILURE:
                            Ext.Msg.alert('提示', '连接失败');
                            break;
                        case Ext.form.Action.SERVER_INVALID:
                            me.onSubmitFailed(action.result);
                    }
                }
            });
        },

        addItem : function(config){
            this.form.add(config);
            this.form.doLayout();
            return this;
        },
        
        reset : function(){
            this.form.getForm().reset();
        },

        onSubmitFailed : function(result){
            Ext.Msg.alert("提示", result.msg);
        },

        createGrid : function(config){
            var columns = null;
            if(config.createColumns) {
                columns = config.createColumns();
            } else {
                //columns = this.createColumns();
            }

            var grid = new Ext.grid.EditorGridPanel({
                region : "center",
                loadMask : true,
                stripeRows : true,
                autoDestroy : true,
                store : this.store,
                columns : columns,
                view : this.createView(),
                sm : config.sm,
                listeners : config.grid_listeners,
                tbar : config.grid_tbar
            });
            return grid;
        },

        //默认实现，允许覆盖
        createView : function(){
            return new Ext.grid.GridView({
                forceFit : true,
                enableBody : true
            });
        },

        //请实现这个方法
        onSubmitSuccess : function(result){
        },

    });

    exports.FormGridUi = FormGridUi;
});

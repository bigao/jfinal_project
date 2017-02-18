define(function(require, exports){
    var FormWindowUi = Ext.extend(Ext.Window, {
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
            //是否在点击提交时提示确定
            this.need_confirm = (cfg.need_confirm == undefined ? true : cfg.need_confirm);

            FormWindowUi.superclass.constructor.call(this, cfg);

            this.form = new Ext.form.FormPanel({
                autoScroll : true,
                fileUpload : cfg.fileUpload,
                labelWidth : cfg.labelWidth,
                padding: cfg.form_padding,
                labelSeparator : cfg.form_labelSeparator
            });
            this.add(this.form);

            var me = this;
            if(!cfg.noButton){
                var enableSubmitBtn = cfg.enableSubmitBtn;
                if(enableSubmitBtn == undefined) enableSubmitBtn = true;

                var enableCancelBtn = cfg.enableCancelBtn;
                if(enableCancelBtn == undefined) enableCancelBtn = true;

                if(enableSubmitBtn){
                    this.addButton({text : "提交", scope : this}, function(btn){
                        if(me.beforeSubmit && !me.beforeSubmit()){
                            return;
                        }
                        if(me.need_confirm){
                            Ext.Msg.confirm("提示", me.submitTip || "确认提交", function(msg){
                                if(msg == "yes"){
                                    me.onClickSubmit();
                                }
                            });
                        }else{
                            me.onClickSubmit();
                        }
                    });
                }

                if(enableCancelBtn){
                    this.addButton({text : "取消", scope : this}, function(btn){
                        me.onClickCancel();
                    });
                }
            }

            this.doLayout();
        },

        setSubmitTip : function(tip){
            this.submitTip = tip;
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
                waitMsg: '正在处理...',
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

        getValues: function(){
            return this.form.getForm().getValues();
        },

        onClickCancel : function(){
            this.close();
        },

        addItem : function(cfg){
            this.form.add(cfg);
            this.form.doLayout();
            return this;
        },
        
        reset : function(){
            this.form.getForm().reset();
        },

        //可选实现
        beforeSubmit : function(){
            return true;
        },

        //请实现这个方法
        onClickSubmit : function(){
            // implemented by others
        },

        //请实现这个方法
        onSubmitSuccess : function(result){
            Ext.Msg.alert("提示", "提交成功");
        },

        onSubmitFailed : function(result){
            Ext.Msg.alert("提示", result.msg);
        },

        findById : function(id){
            return this.form.findById(id);
        }
    });

    exports.FormWindowUi = FormWindowUi;
});

define(function(require, exports){
    var FilterComboBoxUi = Ext.extend(Ext.form.CompositeField, {
        constructor : function(config){
            config = config || {};
            var me = this;
            var combo = new Ext.form.ComboBox({
                width : config.combo_width,
                hiddenName : config.hiddenName,
                displayField : config.displayField,
                valueField : config.valueField,
                triggerAction : 'all',
                typeAhead : true,
                mode : config.mode || "remote",
                editable : config.editable === undefined ? false : true,
                allowBlank : config.allowBlank === undefined ? false : true,
                store : config.store,
                listeners : config.listeners
            });
            

            var txtfield = new Ext.form.TextField({
                width : config.txtfield_width,
                enableKeyEvents : true,
                emptyText: "模糊查询",
                listeners : {
                    keyup : function(tf, e){
                        var val = tf.getValue();
                        if(val.length == 0){
                            combo.store.clearFilter();
                            return;
                        }

                        if(config.filterBy){
                            combo.store.filterBy(config.filterBy);
                        }
                    }
                }
            });

            this.combo = combo;
            this.txtfield = txtfield;
            Ext.apply(config, {
                anchor : config.anchor || "95%",
                items : [this.combo, this.txtfield]
            });
            FilterComboBoxUi.superclass.constructor.call(this, config);
//            combo.store.on("load", function(store){
//                //执行数据过滤
//                var val = txtfield.getValue();
//                if(val.length > 0 && config.filterBy){
//                    combo.store.filterBy(config.filterBy);
//                }
//            });
        },

        getCombo : function(){
            return this.combo;
        },

        getTextField : function(){
            return this.txtfield;
        },

        setValue : function(val){
            this.combo.setValue(val);
        },

        getValue : function(val){
            return this.combo.getValue(val);
        },

        getFilterText : function(){
            return this.txtfield.getValue();
        }
    });

    exports.FilterComboBoxUi = FilterComboBoxUi;
});
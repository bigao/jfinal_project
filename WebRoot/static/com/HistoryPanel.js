define(function(require, exports){
    var utils = require("navimng_brick/view/utils.js");

    var HistoryPanel = Ext.extend(Ext.Panel, {
        //历史堆栈
        history : [],

        constructor : function(config){
            config = config || {};
            Ext.apply(config, {
                layout : "fit",
            });

            HistoryPanel.superclass.constructor.call(this, config);
        },

        refresh : function(p){
            this.removeAll(true);
            this.add(p);
            this.doLayout();
        },

        registGoBack : function(goback_func){
            this.history.push(goback_func);
        },

        goback : function(){
            if(this.history.length == 0){
                return;
            }
            var func = this.history.pop();
            var p = func();
            this.refresh(p);
        }
    });

    exports.HistoryPanel = HistoryPanel;
});
define(function(require, exports){
    var XWindow = Ext.extend(Ext.Window, {
        constructor: function(cfg){
            cfg = cfg || {};
            cfg.listeners = cfg.listeners || {};

            //如果有定义旧的show事件函数
            var old_show_func = cfg.listeners.show;
            cfg.listeners.show = function(p){
                var coord = p.getPosition(true);
                var x = coord[0];
                var y = coord[1];
                if(x < 0)
                    x = 10;
                if(y < 0)
                    y = 10;
                p.setPosition(x, y);

                if(old_show_func)
                    old_show_func(p);
            }

            XWindow.superclass.constructor.call(this, cfg);
        }
    });
    exports.XWindow = XWindow;
});


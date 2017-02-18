define(function(require, exports){
    var XCheckboxSelectionModel = Ext.extend(Ext.grid.CheckboxSelectionModel, {
        handleMouseDown: function(g, rowIndex, e){
            if (e.button !== 0 || this.isLocked()) {
                return;
            }
            var view = this.grid.getView();
            if (e.shiftKey && !this.singleSelect && this.last !== false) {
                var last = this.last;
                this.selectRange(last, rowIndex, e.ctrlKey);
                this.last = last; // reset the last     
                view.focusRow(rowIndex);
            }
            else {
                var isSelected = this.isSelected(rowIndex);
                if (isSelected) {
                    this.deselectRow(rowIndex);
                }
                else 
                    if (!isSelected || this.getCount() > 1) {
                        this.selectRow(rowIndex, true);
                        view.focusRow(rowIndex);
                    }
            }
        }
    });
    
    var XRowSelectionModel = Ext.extend(Ext.grid.RowSelectionModel, {
        handleMouseDown: function(g, rowIndex, e){
            if (e.button !== 0 || this.isLocked()) {
                return;
            }
            var view = this.grid.getView();
            if (e.shiftKey && !this.singleSelect && this.last !== false) {
                var last = this.last;
                this.selectRange(last, rowIndex, e.ctrlKey);
                this.last = last; // reset the last     
                view.focusRow(rowIndex);
            }
            else {
                var isSelected = this.isSelected(rowIndex);
                if (isSelected) {
                    this.deselectRow(rowIndex);
                }
                else 
                    if (!isSelected || this.getCount() > 1) {
                        this.selectRow(rowIndex, true);
                        view.focusRow(rowIndex);
                    }
            }
        }
    });

    exports.XCheckboxSelectionModel = XCheckboxSelectionModel;
    exports.XRowSelectionModel = XRowSelectionModel;
});
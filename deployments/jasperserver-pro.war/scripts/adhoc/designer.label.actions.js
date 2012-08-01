/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

/**
 * Select item header to be edited
 * @param element
 * @param type
 */
adhocDesigner.editDataHeader = function(element, type){
    var currentText = null;
    var dialogInput = null;
    var submitFunction = null;
    var submitBtn = null;
    var cancelBtn = null;
    var index = null;
    var edited = null;
    var dialog = $("editLabel");
    var width = 100; //hard code for now

    var postEdit = function() {
        adhocDesigner.initPreventBrowserSelection($("designer"))
    };

    this.initEnableBrowserSelection($("designer"));

    if(type === "title"){
        editor = new InPlaceEditor(element);

        editor.oldTitle = editor.value.strip();
        editor.makeEditable({
            'onMouseup': adhocDesigner.returnToNormalReportTitle,
            'onTab': adhocDesigner.returnToNormalReportTitle,
            'onEnter': adhocDesigner.returnToNormalReportTitle,
            'onEsc'  : adhocDesigner.returnToNormalReportTitle
        });

        jQuery('#mainTableContainer').scrollLeft(0);
        jQuery('#titleCaption > input').width(jQuery('#canvasTable').width());
    }else{
        if (dialog) {
            cancelBtn = dialog.down("button#cancelEditBtn");
            submitBtn = dialog.down("button#editLabelBtn");
            if (type === "legend") {
                var selectedLegend = designerBase.getSelectedObject();
                if (selectedLegend) {
                    index = selectedLegend.index;
                    currentText = selectedLegend.userName;

                    dialogInput = dialog.down("input#editLabelInput");
                    if (dialogInput) {
                        dialogInput.value = currentText.strip();
                        submitFunction = function() {
                            edited = dialogInput.value;
                            //in-case any html remove them
                            edited = edited.replace(/<\/?[^>]+(>|$)|["]/g, "");
                            localContext.updateLegendLabel(edited, index);
                        };
                    }
                }
            }else if(type === "column"){
                var selectedColumn = adhocDesigner.getSelectedColumnOrGroup();
                if(selectedColumn){
                    currentText = getInnerText(selectedColumn.header);
                    width = $(selectedColumn.header).getWidth();
                    index = selectedColumn.index;

                    dialogInput = dialog.down("input#editLabelInput");
                    if(dialogInput){
                        dialogInput.value = currentText.strip();
                        submitFunction = function() {
                            edited = dialogInput.value;
                            //in-case any html remove them
                            edited = edited.replace(/<\/?[^>]+(>|$)|["]/g, "");
                            localContext.updateColumnHeaderRequest(edited, index, width);
                        };
                    }

                }
            }else if(type === "tableGroup"){
                var selectedGroup = adhocDesigner.getSelectedColumnOrGroup();
                if(selectedGroup){
                    var groupIndex = selectedGroup.index;
                    currentText = selectedGroup.label;

                    dialogInput = dialog.down("input#editLabelInput");
                    if(dialogInput){
                        dialogInput.value = currentText.strip();
                        submitFunction = function() {
                            edited = dialogInput.value;
                            //in-case any html remove them
                            edited = edited.replace(/<\/?[^>]+(>|$)|["]/g, "");
                            localContext.updateGroupLabel(edited, groupIndex);
                        };
                    }
                }
            }
            //shared by all
            if (dialogInput) {
                $(cancelBtn).observe("click", function(evt) {
                    $(submitBtn).stopObserving('click');
                    postEdit();
                    dialogs.popup.hide(dialog);
                    Event.stop(evt);
                });

                $(submitBtn).observe("click", function(evt){
                    submitFunction();
                    postEdit();
                    $(submitBtn).stopObserving('click');
                    dialogs.popup.hide(dialog);
                    Event.stop(evt);
                });

                $(dialogInput).observe("key:enter", function(evt){
                    submitFunction();
                    postEdit();
                    $(submitBtn).stopObserving('click');
                    $(dialogInput).stopObserving('key:enter');
                    dialogs.popup.hide(dialog);
                    Event.stop(evt);
                });


                $(dialogInput).observe("keypress", function(evt){
                    evt = (evt) ? evt : window.event;
                    /**
                     * Stop special characters
                     * < : 60
                     * > : 62
                     * & : 38
                     * = : 61
                     */
                    if (type === "legend") {
                        if (evt.keyCode == 62 || evt.keyCode == 60 || evt.keyCode == 38 || evt.keyCode == 61 ||
                            evt.charCode == 62 || evt.charCode == 60 || evt.charCode == 38 || evt.charCode == 61) {
                            //                                console.log(String.fromCharCode(evt.charCode));
                            //                                console.log(evt.keyCode);
                            Event.stop(evt);
                        }
                    }
                });

                dialogs.popup.show(dialog);

                var DELAY_COMPONENT_AVALIABLE = 500;
                var focusDialog = function(){
                    dialogInput.focus();
                    dialogInput.select();
                };
                if (isIE8()){
                    setTimeout(focusDialog, DELAY_COMPONENT_AVALIABLE);
                }else{
                    focusDialog();
                }
            }
        }
    }
}
/**
 * Add label to deleted column
 */
adhocDesigner.addColumnLabel = function(){
    if(selObjects.length == 1){
        var selectedColumn = designerBase.getSelectedObject();
        var headerCell = selectedColumn.header;
        if(headerCell.hasClassName("deletedHeader")){
            adhocDesigner.editDataHeader(headerCell, "column");
        }
    }
}
/**
 * Delete column header
 */
adhocDesigner.deleteColumnLabel = function(){
    if(selObjects.length == 1){
        var selectedColumn = designerBase.getSelectedObject();
        var headerCell = selectedColumn.header;
        if(!headerCell.hasClassName("deletedHeader")){
            headerCell.addClassName("deletedHeader");
            headerCell.innerHTML = headerCell.readAttribute("data-fieldName");
        }
        //send delete request
        localContext.removeColumnHeaderRequest();
    }
}

adhocDesigner.selectAndEditLabel = function(index){
    var selectedObject = null;
    var overlayObject = $("legendOverlay_" + index);
    if(overlayObject){
        selectedObject = {
            id : overlayObject.identify(),
            legendName : overlayObject.readAttribute("data-legendName"),
            index : overlayObject.readAttribute("data-index"),
            defaultName : overlayObject.readAttribute("data-defaultName"),
            userName : overlayObject.readAttribute("data-userName")
        };

        //deselect all selected legend overlays
        designerBase.unSelectAll();
        localContext.deselectAllSelectedOverlays();
        designerBase.addToSelected(selectedObject);
        buttonManager.select(overlayObject);
        adhocDesigner.editLegendLabel();
    }
}

adhocDesigner.editLegendLabel = function(){
    if(selObjects.length == 1){
        var selectedMeasure = designerBase.getSelectedObject();
        var selectedMeasureDiv = $(selectedMeasure.id);
        if(selectedMeasureDiv){
            adhocDesigner.editDataHeader(selectedMeasureDiv, "legend");
        }
    }
}
/*
 * Used to edit column label
 */
adhocDesigner.editColumnLabel = function(){
    if(selObjects.length == 1){
        var selectedColumn = designerBase.getSelectedObject();
        var headerCell = selectedColumn.header;
        adhocDesigner.editDataHeader(headerCell, "column");
    }
}

adhocDesigner.adhocTitleEdit = function(evt){
    var element = evt.element();
    if ((element.id === 'titleCaption' || element.parentNode.parentNode.id == 'titleCaption') && !isNotNullORUndefined(editor)) {
        this.editDataHeader($('titleCaption'), "title");
        Event.stop(evt);
    }
}
/*
 * Used to revert from input to regular span
 */
adhocDesigner.returnToNormalReportTitle = function(evt) {
    if(editor){
        evt = (evt) ? evt : window.event;
        if(evt.keyCode == Event.KEY_ESC){
            editor.revertEdit();
            editor = null;
            adhocDesigner.initPreventBrowserSelection($("designer"));
        }else{
            editor.makeNonEditable(true);
            var title = editor.elem.innerHTML;
            if(editor.oldTitle != title) {
                adhocDesigner.updateReportTitle(title);
                adhocDesigner.initPreventBrowserSelection($("designer"));
            }
            editor = null;
        }
    }
}

adhocDesigner.addGroupLabel = function(){
    localContext.editGroupLabel();
}

adhocDesigner.deleteGroupLabel = function(){
    localContext.removeGroupLabel();
}

adhocDesigner.editGroupLabel = function(){
    localContext.editGroupLabel();
}
/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

///////////////////////////////////////////////////////////////
// Select file resource dialog (for security file and bundles)
///////////////////////////////////////////////////////////////
var SelectFileDialog = function(options) {
    this._dom = $('selectFile').cloneNode(true);

    this.selectedURI = null;

    this.selectedFileClickSelect = null;
    this.idSuffix = options.idSuffix;
    this.title = this._dom.select('div.title')[0];
    this.filePath = this._dom.select('#filePath')[0];
    this.selectBtn =  this._dom.select('#selectFileBtnSelect')[0];
    this.cancelBtn =  this._dom.select('#selectFileBtnCancel')[0];
    this.fromLocalRadio = this._dom.select("#fromLocalRadio")[0];
    this.fromRepoRadio =  this._dom.select("#fromRepoRadio")[0];
    this.fromLocalRadioLabel = this._dom.select("label[for='fromLocalRadio']")[0];
    this.fromRepoRadioLabel =  this._dom.select("label[for='fromRepoRadio']")[0];

    this.treeLocationId = 'addFileResourceTreeRepoLocation';
    this.treeDom = this._dom.select('#'+ this.treeLocationId)[0];
    this.treeDom.writeAttribute('id', this.treeLocationId + this.idSuffix);
    this.treeLocationId += this.idSuffix;
    
    //this._dom.writeAttribute('id', 'selectFile'  + this.idSuffix);    

    [this._dom, this.filePath,
     this.selectBtn, this.cancelBtn,
     this.fromLocalRadio, this.fromRepoRadio].each(function(element) {
        this._fixAttribute(element);
    }, this);

    [this.fromLocalRadioLabel, this.fromRepoRadioLabel].each(function(element) {
        this._fixAttribute(element, 'for');
    }, this);

    this.renderDialog();
};

SelectFileDialog.addMethod("_fixAttribute", function(element, attribute) {
    var attr = element.readAttribute(attribute ? attribute : 'id');
    element.writeAttribute(attribute ? attribute : 'id', attr + this.idSuffix);
});

// observe inputs and buttons
SelectFileDialog.addMethod("_dialogClickHandler", function(e) {
    var elem = e.element();

    if (matchAny(elem, ['button#selectFileBtnSelect' + this.idSuffix], true)) {
        e.stop();
        this.selectedFileClickSelect();
        return;
    } else if (matchAny(elem, ['button#selectFileBtnCancel' + this.idSuffix], true)) {
        e.stop();
        this.hide();
        return;
    } else if (matchAny(elem,["#fromLocalRadio" + this.idSuffix, "label[for='fromLocalRadio" + this.idSuffix +"'] > span"], true)) {
        domain.wizard.fromLocalHandler(this);
    } else if (matchAny(elem,["#fromRepoRadio" + this.idSuffix, "label[for='fromRepoRadio" + this.idSuffix +"'] > span"], true)) {
        domain.wizard.fromRepoHandler(this);
    }

    this.refreshSelectBtn();
});

SelectFileDialog.addMethod("_dialogTreeClickHandler", function(e) {
    domain.wizard.fromRepoHandler(this);
});

SelectFileDialog.addMethod("refreshSelectBtn", function() {

        function enableSelect(dialog) {
            if (dialog.selectBtn.disabled) {
                domain.enableButton(dialog.selectBtn,true);
            }
        }
        function disableSelect(dialog) {
            if (!dialog.selectBtn.disabled) {
                domain.enableButton(dialog.selectBtn,false);
            }
        }

    if (this.mode === 'local') {
        // handle 'from local'
        if (this.filePath.getValue().length > 0) {
            enableSelect(this);
        } else {
            disableSelect(this);
        }
    } else {
        // handle 'from repo'
        if (this.tree.getSelectedNode() && this.tree.getSelectedNode().param.type != this.tree.getSelectedNode().FOLDER_TYPE_NAME) {
            this.selectedURI = this.tree.getSelectedNode().param.uri;
            enableSelect(this);
        } else {
            disableSelect(this);
        }
    }
});

SelectFileDialog.addMethod("renderDialog", function() {
    document.body.insert(this._dom);
    this._dom.observe('click', this._dialogClickHandler.bindAsEventListener(this));
    this.filePath.observe('change', this.refreshSelectBtn.bindAsEventListener(this));
});

SelectFileDialog.addMethod("show", function() {
    this.refreshSelectBtn();
    dialogs.popup.show(this._dom, true);
});

SelectFileDialog.addMethod("hide", function() {
    dialogs.popup.hide(this._dom);
});

/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

var adhocSort = {
    TEMPLATE_ID: "sortDialog",
    SORT_FIELDS_LIST_TEMPLATE_ID: "list_fields_hideRoot_column_simple",
    SORT_FIELDS_ITEM_TEMPLATE_ID: "list_fields_hideRoot_column_simple:leaf",

    AVAILABLE_ID: "sortDialogAvailable",
    AVAILABLE_FIELDS_PROVIDER_ID : "availableFieldsTreeDataProvider",
    SORT_FIELDS_ID: "sortDialogSortFields",

    OK_PATTERN: "#sortDialogOk",
    CANCEL_PATTERN: "#sortDialogCancel",
    ADD_PATTERN: "#sortDialogAddToSort",
    TO_TOP_PATTERN: "#sortDialogToTop",
    TO_BOTTOM_PATTERN: "#sortDialogToBottom",
    UP_PATTERN: "#sortDialogUpward",
    DOWN_PATTERN: "#sortDialogDownward",
    REMOVE_PATTERN: "#sortDialogRemoveFromSort",
    BUTTON_PATTERN: "#sortDialogSortFields .icon.button",

    DROP_CLASS: "dragging",
    SORT_DRAG_CLASS: ".draggable",

    EVENT: {
        SORT: "sort:sort"
    },

    /**
     * This initializes all the events for the dialog.
     */
    initialize : function(){
        this.originalSortFields = [];
        this.preselectedFieldNames = null;

        this._dialog = $(this.TEMPLATE_ID);
        this._add = $$(this.ADD_PATTERN)[0];
        this._remove = $$(this.REMOVE_PATTERN)[0];
        this._ok = $$(this.OK_PATTERN)[0];
        this._cancel = $$(this.CANCEL_PATTERN)[0];

        this._toTop = $$(this.TO_TOP_PATTERN)[0];
        this._toBottom = $$(this.TO_BOTTOM_PATTERN)[0];
        this._up = $$(this.UP_PATTERN)[0];
        this._down = $$(this.DOWN_PATTERN)[0];

        this.tree = this.createAvailableFieldsTree();
        this.list = this.createSortFieldsList();

        this.actionHash = {
            '#sortDialogOk': function(event) {
                this.hideDialog();
            },
            '#sortDialogCancel': function(event) {
                this.fire(this.EVENT.SORT, {
                    fields: this.originalSortFields,
                    hide: true
                });
            },
            '#sortDialogAddToSort': function(event) {
                this._addToSort();
            },

            '#sortDialogRemoveFromSort': function(event) {
                this._removeFromSort();
            },

            '#sortDialogUpward': function(event) {
                this._oneStepMoveTo(true);
            },

            '#sortDialogDownward': function(event) {
                this._oneStepMoveTo(false);
            },

            '#sortDialogToTop': function(event) {
                this._moveTo(true);
            },

            '#sortDialogToBottom': function(event) {
                this._moveTo(false);
            },

            'li .icon.button': function(event) {
                this._toggleSortOrder(this.list.getItemByEvent(event));
            }

        };

        this.actionHash.getAction = function(element) {
            for (var id in this) {
                if (element.match(id) && id != "getAction") {
                    return this[id];
                }
            }

            return doNothing;
        };


        this.observe('sort:sort', function(event) {
            adhocDesigner.setSorting(event.memo.fields, function() {
                event.memo.hide && adhocSort.hideDialog();
            });
        });

        this._dialog.observe(isSupportsTouch() ? "touchend" : "mouseup", function(e) {
            var element = e.element();
            var btn = matchAny(element,[
                this.ADD_PATTERN, this.REMOVE_PATTERN, this.OK_PATTERN, this.CANCEL_PATTERN,
                this.BUTTON_PATTERN, this.UP_PATTERN, this.DOWN_PATTERN, this.TO_TOP_PATTERN,
                this.TO_BOTTOM_PATTERN
            ], true);

            if (btn) {
                this.actionHash.getAction(btn).bind(this)(e);
                //e.stop();
            }

        }.bindAsEventListener(this));
    },

    updateAndShowAvailableFieldsTree: function(uriList){
        var callback = function() {
            this.tree = this.createAvailableFieldsTree(uriList);
//            this.tree.showTreePrefetchNodes(uriList.join(",")); //Commented becouse of issue with custom fields
            this.tree.showTree(20);
        }.bind(this);

        designerBase.sendRequest("co_updateAvailableTree", [], callback, {'target':"ajaxbuffer", 'bPost' :true});
    },

    createAvailableFieldsTree: function(uriList){
        var tree = adhocDesigner.getAvailableFieldsTree(this.AVAILABLE_ID, adhocSort.AVAILABLE_FIELDS_PROVIDER_ID);
        tree.DEFAULT_TREE_CLASS_NAME = "responsive fields";
        tree.multiSelectEnabled = true;

        if (isIPad()) {
            var scrollElement = $(this.AVAILABLE_ID);
            new TouchController(scrollElement, scrollElement.up(1));
        }
        tree.observe('tree:loaded', function(event) {
            if (uriList && uriList.length > 0) {
                uriList.each(function(uri) {
                    tree.openAndSelectNode(uri);
                }.bind(this));
            }
            this._addSortFieldsToList();
            buttonManager.disable(this._add);
        }.bindAsEventListener(this));

        tree.observe('leaf:dblclick', function(event) {
            this._addToSort(event.memo.node);
        }.bindAsEventListener(this));

        var checkActionsHandler = this._refreshAddButton;

        tree.observe('leaf:selected', checkActionsHandler.bindAsEventListener(this));
        tree.observe('node:selected', checkActionsHandler.bindAsEventListener(this));
        tree.observe('leaf:unselected', checkActionsHandler.bindAsEventListener(this));
        tree.observe('node:unselected', checkActionsHandler.bindAsEventListener(this));

        Droppables.remove(tree.getId());
        Droppables.add(tree.getId(),{
            accept: [this.SORT_FIELDS_ID],
            hoverclass: layoutModule.DROP_TARGET_CLASS,
            onDrop: (function(dragged, dropped, event){
                dragged.items && this._removeFromSort();
            }).bind(this)
        });

        return tree;
    },

    createSortFieldsList: function(){
        var list = new dynamicList.List(this.SORT_FIELDS_ID, {
            listTemplateDomId: this.SORT_FIELDS_LIST_TEMPLATE_ID,
            itemTemplateDomId: this.SORT_FIELDS_ITEM_TEMPLATE_ID,
            excludeFromSelectionTriggers: [this.BUTTON_PATTERN],
            dragPattern:  isIPad() ? undefined : this.SORT_DRAG_CLASS,
            multiSelect: true,
            selectOnMousedown: !isIPad(),
            comparator: function (item1, item2) {
                var order1 = item1.getValue().order;
                var order2 = item2.getValue().order;

                return order1 > order2 ? 1 : (order1 < order2 ? -1 : 0);
            }
        });

        list.observe('item:selected', function(event) {
            list.getSelectedItems().length > 0 && buttonManager.enable(this._remove);
            this._refreshMoveButtons();
        }.bindAsEventListener(this));

        list.observe('item:unselected', function(event) {
            list.getSelectedItems().length == 0 && buttonManager.disable(this._remove);
            this._refreshMoveButtons();
        }.bindAsEventListener(this));

        list.observe('item:dblclick', function(event) {
            this._removeFromSort(event.memo.item);
        }.bindAsEventListener(this));

        Droppables.add($(this.SORT_FIELDS_ID), {
            accept: [this.AVAILABLE_ID],
            hoverclass: layoutModule.DROP_TARGET_CLASS,
            onDrop: (function(dragged, dropped, event){
                dragged.node && this._addToSort();
            }).bind(this)
        });

        return list;
    },

    createSortFieldItem: function(field){
        var item = new dynamicList.ListItem({
            label: field.label,
            value: field
        });

        item.refreshStyle = function() {
            dynamicList.ListItem.prototype.refreshStyle.call(this);
            var isAsc = this.getValue().isAsc;

            if(isAsc) {
                this._getElement().addClassName(layoutModule.ASCENDING_CLASS);
                this._getElement().removeClassName(layoutModule.DESCENDING_CLASS);
            } else {
                this._getElement().addClassName(layoutModule.DESCENDING_CLASS);
                this._getElement().removeClassName(layoutModule.ASCENDING_CLASS);
            }
        };

        return item;
    },

    recreateSortFieldsScroll: function(){
        if (isIPad()) {
            var scrollElement = $(this.SORT_FIELDS_ID);
            return new TouchController(scrollElement, scrollElement.up(1));
        }
        return null;
    },

    getSortFields: function(){
        return this.list.getItems().collect(function(item) {
            var field = item.getValue();
            return field.toData();
        });
    },

    _isOriginalField: function(fieldName){
        return  this.originalSortFields.detect(function(field) {
                return field.name == fieldName;
            }.bind(this));
    },
    /**
     * Returns new array, which contain all items from originalSortFields array and new fields from preselected array.
     * @param preselected - strings array with preselected field names
     */
    _getMergedPreselectedWithOriginalFields: function(preselected) {
        var result = this.originalSortFields ? this.originalSortFields.slice(0) : [];
        var that = this;
        jQuery(preselected).each(function() {
            var thisString = this.toString();
            if (!that._isOriginalField(thisString)) {
                result.push({
                    name: thisString,
                    isAsc: true
                });
            }
        });
        return result;
    },

    _addSortFieldsToList: function(){
        var fields = this._getMergedPreselectedWithOriginalFields(this.preselectedFieldNames);
        var nodes = [];
        var selectedItemsArray = [];
        var items = [];
        var that = this;
        jQuery(fields).each(function(index){
            var node = that.tree.findNodeById(this.name);
            var item =  new adhocSort.Field(node, this.isAsc, index).item;
            nodes.push(node);
            if(that.preselectedFieldNames && jQuery.inArray(this.name, that.preselectedFieldNames) > -1){
                selectedItemsArray.push(item);
            }
            items.push(item);
        });

        this.list.setItems(items);

        jQuery(nodes).each(function() {
            this.refreshStyle();
        });
        this.list.show();
        this.recreateSortFieldsScroll();

        jQuery(selectedItemsArray).each(function(){
            this.select();
        });
        if (fields && fields.length !== (this.originalSortFields ? this.originalSortFields.length : 0)) {
            this.fire(this.EVENT.SORT, {
                fields: this.getSortFields(),
                hide: false
            });
        }
    },

    launchDialog : function(fieldName) {
        dialogs.popup.show(this._dialog);
        this.list.setItems([]);
        this.list.show();
        [this._add, this._remove, this._up, this._down, this._toTop, this._toBottom].each(function(btn) {
            buttonManager.disable(btn);
        });
        this.originalSortFields = localContext.state.sortFields || [];
        var uriList = this.originalSortFields.collect(
            function(field) {
                return adhocSort.Util.fieldNameToUriList(field.name);
            }).flatten();
        if (jQuery.isArray(fieldName)) {
            // extension for case if multiple items are selected
            this.preselectedFieldNames = fieldName;
            for(var i=0; i < fieldName.length; i++){
                uriList = uriList.concat(adhocSort.Util.fieldNameToUriList(fieldName[i]));
            }
        } else {
            this.preselectedFieldNames = fieldName ? [fieldName] : null;
            fieldName && (uriList = uriList.concat(adhocSort.Util.fieldNameToUriList(fieldName)));
        }
        this.updateAndShowAvailableFieldsTree(uriList);
    },

    hideDialog : function(){
        dialogs.popup.hide(this._dialog);
    },

    stopObserving : function(eventName, handler){ this._dialog.stopObserving(eventName, handler); },
    observe : function(event, handler){ this._dialog.observe(event, handler); },
    fire : function(eventName, data){ this._dialog.fire(eventName, data); },

    _isOnlyFieldsSelected: function(){
        return this.tree.getSelectedNode() && !this.tree.selectedNodes.detect(function(node) {
                return node.isParent() || node.param.id === designerBase.SPACER_NAME;
        });
    },

    _getOnlyChildren: function(nodes){
        var result = [];

        nodes.each(function(node) {
            if (node.isParent()) {
                result = result.concat(this._getOnlyChildren(node.childs))
            } else {
                result.push(node);
            }
        }.bind(this));

        return result;
    },

    _toggleSortOrder: function(item){
        item.getValue().isAsc = !item.getValue().isAsc;
        item.refresh();

        this.fire(this.EVENT.SORT, {
            fields: this.getSortFields(),
            hide: false
        });
    },

    _addToSort: function(node){
        if (!this._isOnlyFieldsSelected()) {
            return;
        }
        var nodes = this._getOnlyChildren(node ? [node] : this.tree.selectedNodes);

        var currentItems = this.list.getItems();

        var items = nodes.collect(function(node, index) {
            return new adhocSort.Field(node, true, currentItems.length + index).item;
        }.bind(this));

        this.list.addItems(items);

        nodes.invoke('refreshStyle');
        nodes.invoke('deselect');

        this.list.refresh();

        this.fire(this.EVENT.SORT, {
            fields: this.getSortFields(),
            hide: false
        });

        this._refreshAddButton();
        this._refreshMoveButtons();
    },

    _removeFromSort: function(item){
        var items = item ? [item] : this.list.getSelectedItems();
        var tree = this.tree;
        this.list.removeItems(items);

        items.each(function(item) {
            var field = item.getValue();
            tree._deselectAllNodes();
            field.node.hidden = false;
            field.node.refreshStyle();
            field.node.select();
        });

        this.fire(this.EVENT.SORT, {
            fields: this.getSortFields(),
            hide: false
        });

        this._refreshMoveButtons();
    },

    _oneStepMoveTo: function(up) {
        var allItems = this.list.getItems();
        var selectedItems = this.list.getSelectedItems();

        if (!up) {
            allItems = allItems.clone().reverse();
        }
        var direction = up ? -1 : 1;

        var prevItem = null;
        allItems.each(function(item) {
            var selectedItem = selectedItems.detect(function(selectedItem) { return selectedItem == item; });
            if (selectedItem && prevItem) {
                prevItem.getValue().order -= direction;
                selectedItem.getValue().order += direction;
            } else {
                prevItem = item;
            }
        });

        this._resort();
    },

    _moveTo: function(up) {
        var allItems = this.list.getItems();
        var selectedItems = this.list.getSelectedItems();
        var unselectedItems = allItems.findAll(function(item) { return !selectedItems.include(item); });

        if (!up) {
            selectedItems = selectedItems.clone().reverse();
            unselectedItems = unselectedItems.clone().reverse();
        }

        var direction = up ? 1 : -1;
        var order = up ? 0 : allItems.length;

        var changeOrder = function(item) {
            item.getValue().order = order;
            order += direction;
        };
        selectedItems.each(changeOrder);
        unselectedItems.each(changeOrder);

        this._resort();
    },

    _resort: function() {
        this.list.sort();
        this.list.show();
        this._refreshMoveButtons();
        
        this.fire(this.EVENT.SORT, {
            fields: this.getSortFields(),
            hide: false
        });
    },

    _refreshMoveButtons: function(){
        var items = this.list.getItems();
        var selectedItems = this.list.getSelectedItems();
        var baseCase = items.length > 1 && selectedItems.length > 0;
        var allowUp = (baseCase && !(selectedItems.length == 1 && selectedItems[0].first));
        var allowDown = (baseCase && !(selectedItems.length == 1 && selectedItems[0].last));

        [this._toTop, this._up].each(function(btn) {
            (allowUp ? buttonManager.enable : buttonManager.disable)(btn);
        });
        [this._toBottom, this._down].each(function(btn) {
            (allowDown ? buttonManager.enable : buttonManager.disable)(btn);
        });
    },

    _refreshAddButton: function() {
        (this._isOnlyFieldsSelected() ? buttonManager.enable : buttonManager.disable)(this._add);
    }
};

adhocSort.Util = {
    fieldNameToUri: function(name) {
        return "/" + name;//.split(".").join("/");
    },
    fieldNameToUriList: function(name) {
        var nameSeparator = ".";
        var nameParts = name.split(nameSeparator);
        var result = nameParts.slice(0, nameParts.length - 1).collect(function(part, index) {
            return "/" + nameParts.slice(0, index + 1).join("/");
        });

        result.length > 0 && result.push(result.last() + "/" + name);
        result.push("/" + name);

        return result;
    },
    uriToFiledName: function(uri) {
        var parts = uri.split("/");
        return parts[parts.length - 1];
//        return uri.replace("/", "");//.replace("/", ".").substring(1);
    }
};

adhocSort.Field = function(node, isAsc, order) {
    this.name = adhocSort.Util.uriToFiledName(node.param.uri);
    this.label = node.name.escapeHTML();
    this.isAsc = !!isAsc;

    this.order = order || 0;

    this.node = node;
    this.item = adhocSort.createSortFieldItem(this);

    this.node && (this.node.hidden = true);
    //    this.node && this.node.refreshStyle();
};

adhocSort.Field.addMethod("toData", function() {
    return {
        name: this.name,
        isAsc: this.isAsc
    };
});

adhocSort.Field.addMethod("toJSON", function() {
    return Object.toJSON(this.toData());
});

/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

//////////////////////////
// Node extensions
//////////////////////////

// Node with one additional state:
// it could be hidden without removing from DOM
domain.ItemNode = function(options) {
    dynamicTree.TreeNode.call(this, options);

    this.Types = {
        Folder : new dynamicTree.TreeNode.Type('ItemGroupType'),
        Leaf : new dynamicTree.TreeNode.Type('ItemType')
    };

    this.nodeHeaderTemplateDomId = "list_responsive_collapsible_fields:fields";
    this._hidden = false;
    this.disabled = false;
};

domain.ItemNode.prototype = deepClone(dynamicTree.TreeNode.prototype);


domain.ItemNode.addMethod('hide', function(hideChildren) {
    if (!!hideChildren && this.hasChilds()) {
        for (var i = 0; i < this.getChildCount(); i++) {
            this.childs[i].hide(true);
        }
    }

    var disabledChildren = this.childs.findAll(function(child) {return child.disabled}).length;
    var hiddenChildren = this.childs.findAll(function(child) {return child.isHidden()}).length;
    var visibleChildren = this.childs.length - hiddenChildren;

    if (!this.disabled && visibleChildren == 0) {
        this._hidden = true;
        this.deselect();
        this.refreshStyle();
    } else if (this.hasChilds() && disabledChildren > 0 && disabledChildren == visibleChildren) {
        this.deselect();
        this.disable(domain.getMessage(domain.disabledFolderTooltip));
    }
});

domain.ItemNode.addMethod('show', function() {
    this._hidden = false;
    if (this._getElement()) {
        this.refreshStyle(this._getElement());
    }
});

domain.ItemNode.addMethod('disable', function(tooltip) {
    if (tooltip) this.tooltip = tooltip;
    this.disabled = true;
    if (this._getElement()) {
        this.refreshStyle(this._getElement());
    }
});

domain.ItemNode.addMethod('enable', function(tooltip) {
    if (tooltip) this.tooltip = tooltip;
    this.disabled = false;
    if (this._getElement()) {
        this.refreshStyle(this._getElement());
    }
});

domain.ItemNode.addMethod('refreshStyle', function(element) {
    if (!element) {
        element = this._getElement();
        if (!element) {
            return;
        }
    }

    dynamicTree.TreeNode.prototype.refreshStyle.call(this, element);

    if(this.isHidden()) {
        element.addClassName(layoutModule.HIDDEN_CLASS);
    } else {
        element.removeClassName(layoutModule.HIDDEN_CLASS);
    }

    // Check is item is disabled
    var button = element.select('p').first();
    if (button) {
        this.tooltip ? button.title = this.tooltip : button.title = '';
        if (this.disabled) {
            buttonManager.disable(button);
            buttonManager.disable(element);
        } else {
            buttonManager.enable(button);
            buttonManager.enable(element);
        }
    }
});

domain.ItemNode.addMethod('isHidden', function() {
    return this._hidden;
});

domain.ItemNode.addMethod('toJSON', function() {

    var nodeModel = "{";

    nodeModel += [
        'id:' + Object.toJSON(this.param.id),
        'label:' + Object.toJSON(this.name),
        'type:' + Object.toJSON(this.param.type)
    ].join(',');

    if (this.param.extra) {
        nodeModel += ',';
        nodeModel += [
            'labelId:' + (this.param.extra.labelId ? Object.toJSON(this.param.extra.labelId) : '""'),
            'descr:' + Object.toJSON(this.param.extra.descr),
            'descrId:' + (this.param.extra.descrId ? Object.toJSON( this.param.extra.descrId) : '""'),
            'dataType:' + (this.param.extra.dataType ? Object.toJSON(this.param.extra.dataType) : '""'),
            'resourceId:' + Object.toJSON(this.param.extra.resourceId)
        ].join(',');
    }

    if (this.isParent()) {
        var children = '';

        this.childs.each(function(child) {
            if (!child.isHidden()) {
                if (children) {
                    children += ',';
                }

                children += Object.toJSON(child);
            }
        });

        nodeModel += ',children:[' + children + ']';
    }

    return nodeModel + '}';
});

domain.ItemNode.addMethod('hasVisibleChilds', function() {
    return this.hasChilds() && !!this.childs.find(function(child) {
        return !child.isHidden();
    });
});

domain.ItemNode.addMethod('hasEnabledChilds', function() {
    return this.hasChilds() && !!this.childs.find(function(child) {
        return !child.disabled;
    });
});


domain.ItemNode.addMethod('removeChilds', function() {
    this.hasChilds() && this.childs.each(function(node) {
        this.removeChild(node);
    }.bind(this))
});

//CopyMove controller for data chooser fields page
domain.FieldsCopyMoveController = function() {
    domain.NodeCopyMoveController(this);
};

domain.FieldsCopyMoveController.prototype = deepClone(domain.NodeCopyMoveController.prototype);

domain.FieldsCopyMoveController.addMethod('_buildMetanode', function(node) {
    var metanode = deepClone(node.param);
    metanode.label = node.name;
    metanode.order = node.orderNumber;
    metanode.tooltip = node.tooltip;

    return metanode;
});

// Node which has two columns
// and second column is editable
domain.TwoColumnNode = function(options) {
    dynamicTree.TreeNode.call(this, options);

    this.Types = {
        Folder : new dynamicTree.TreeNode.Type('ItemGroupType',  {}),
        Leaf : new dynamicTree.TreeNode.Type('ItemType',  {})
    };

    this.nodeHeaderTemplateDomId = "list_responsive:twoColumn";
};

domain.TwoColumnNode.prototype = deepClone(dynamicTree.TreeNode.prototype);

domain.TwoColumnNode.addMethod('_createNode', function() {
    var id = this.id;
    var tree = dynamicTree.trees[this.getTreeId()];

    var templH = this._getHeaderTemplateElement();
    templH.id = this.NODE_ID_PREFIX + id;
    this.refreshStyle(templH);

    // DOM element link on this tree node
    templH.treeNode = this;

    var wrapper = templH.childElements()[0];
    if (this.tooltip) {
        wrapper.title = this.tooltip;
    }

    var img = wrapper.childElements()[0];
    img.id = this.HANDLER_ID_PREFIX + id;

    var columnOne = wrapper.childElements()[1];
    var origLabel =
            this.param.extra && this.param.extra.label
                    ? this.param.extra.label
                    : this.name;
    columnOne.insert(origLabel);

    var columnTwo = wrapper.childElements()[2];
    columnTwo.insert(this.name);

    this._element = templH;
});

domain.TwoColumnNode.addMethod('_getTitle', function() {
    var titleHolder = this._getElement().childElements()[0].childElements()[2];
    titleHolder.cleanWhitespace();

    if (titleHolder.childNodes.length == 0) {
        titleHolder.appendChild(document.createTextNode(""));
    }

    return  titleHolder.childNodes[0];
});

domain.TwoColumnNode.addMethod('toJSON', function() {

    var nodeModel = "{";

    nodeModel += [
        'id:' + Object.toJSON(this.param.id),
        'label:' + Object.toJSON(this.name),
        'type:' + Object.toJSON(this.param.type),
        'order:' + Object.toJSON(this.orderNumber.toString()),
        'labelId:' + (this.param.extra.labelId ? Object.toJSON(this.param.extra.labelId) : '""'),
        'dataType:' + Object.toJSON(this.param.extra.dataType),
        'resourceId:' + Object.toJSON(this.param.extra.resourceId)
    ].join(',');

    if (this.isParent()) {
        var children = '';

        this.childs.each(function(child) {
            if (children) {
                children += ',';
            }

            children += Object.toJSON(child);
        });

        nodeModel += ',children:[' + children + ']';
    }

    return nodeModel + '}';
});

domain.TwoColumnNode.addMethod('expandAllChilds', function() {
    var tree = dynamicTree.trees[this.getTreeId()];

    if (this.isParent() && !this.isOpen()) {
        tree.writeStates(this.id, dynamicTree.TreeNode.State.OPEN);
        this.refreshNode();
    }

    if (this.hasChilds()) {
        this.childs.each(function(child) {
            child.expandAllChilds();
        })
    }
}),

//Node for domain designer
domain.TablesNode = function(options) {
    dynamicTree.TreeNode.call(this, options);

    this.Types = {
        Folder : new dynamicTree.TreeNode.Type('level'),
        Leaf : new dynamicTree.TreeNode.Type('item')
    };

    this.nodeHeaderTemplateDomId = 'list_responsive_collapsible_type_tables:tables';
};

domain.TablesNode.prototype = deepClone(domain.ItemNode.prototype);

domain.TablesNode.addMethod('toJSON', function() {
    var nodeModel = [];
    nodeModel.push('{');
    nodeModel.push('id:' + Object.toJSON(this.param.id));
    nodeModel.push(',label:' + Object.toJSON(this.name));
    nodeModel.push(',type:' + Object.toJSON(this.param.type));

    var extra = this.param.extra;

    extra.originalId && nodeModel.push(',originalId:' + Object.toJSON(extra.originalId));
    extra.datasourceId && nodeModel.push(',datasourceId:' + Object.toJSON(extra.datasourceId));
    extra.repoId && nodeModel.push(',repoId:' + Object.toJSON(extra.repoId));
    extra.itemId && nodeModel.push(',itemId:' + Object.toJSON(extra.itemId));
    extra.dataSource && nodeModel.push(',dataSource:' + Object.toJSON(extra.dataSource));
    extra.table && nodeModel.push(',table:' + Object.toJSON(extra.table));

    if (this.isParent()) {
        //extra.query && nodeModel.push(',query:' + Object.toJSON(extra.query.replace(/"/g,"\\\"")));
        extra.query && nodeModel.push(',query:' + Object.toJSON(extra.query));
        extra.dataSetType && nodeModel.push(',dataSetType:' + Object.toJSON(extra.dataSetType));
    } else {
        //extra.expression && nodeModel.push(',expression:' + Object.toJSON(extra.expression.replace(/"/g,"\\\"")));
        extra.expression && nodeModel.push(',expression:' + Object.toJSON(extra.expression));
        extra.islandId && nodeModel.push(',islandId:' + Object.toJSON(extra.islandId));
        extra.isConstant && nodeModel.push(',isConstant:' + Object.toJSON(extra.isConstant));
        extra.JavaType && nodeModel.push(',JavaType:' + Object.toJSON(extra.JavaType));
        extra.JdbcType && nodeModel.push(',JdbcType:' + Object.toJSON(extra.JdbcType));
    }

    if (this.isParent()) {
        var children = '';

        this.childs.each(function(child) {
            if (!child.isHidden()) {
                if (children) {
                    children += ',';
                }

                children += Object.toJSON(child);
            }
        });

        nodeModel.push(',children:[' + children + ']');
    }

    nodeModel.push('}');

    return nodeModel.join('');
});

domain.TablesNode.addVar('CONSTANT_TABLE_ID', "constant_fields_level");
domain.TablesNode.addVar('CROSSTABLES_FIELDS_TABLE_ID', "crossTablesFieldsLevel");
domain.TablesNode.addVar('INVALID_NODE_CLASS', "invalid");
domain.TablesNode.addVar('DATA_ISLAND_CLASS', "dataIsland");
domain.TablesNode.addVar('DERIVED_TABLE_CLASS', "table derived");
domain.TablesNode.addVar('CONSTANT_TABLE_CLASS', "table constant");
domain.TablesNode.addVar('CALCULATED_FIELD_CLASS', "field calculated");

domain.TablesNode.addMethod('refreshStyle', function(element) {
    if (!element) {
        element = this._getElement();
        if (!element) {
            return;
        }
    }

    domain.ItemNode.prototype.refreshStyle.call(this, element);

    // Check item for validity
    if (this.param.extra && this.param.extra.isInvalid === 'true') {
        element.addClassName(this.INVALID_NODE_CLASS);
    } else {
        element.removeClassName(this.INVALID_NODE_CLASS);
    }

    // Check if this is calc field
    if (this.param.extra && this.param.extra.expression) {
        element.addClassName(this.CALCULATED_FIELD_CLASS);
    }

    // Check if this is derived table
    if (this.param.extra && this.param.extra.query) {
        element.addClassName(this.DERIVED_TABLE_CLASS);
    }

    // Check if this is constant table
    if (this.param.id === this.CONSTANT_TABLE_ID) {
        element.addClassName(this.CONSTANT_TABLE_CLASS);
    }

    // Check if this is data island
    if (this.param.extra && this.param.extra.isIsland) {
        element.addClassName(this.DATA_ISLAND_CLASS);
    }
});

domain.TablesNode.addMethod('edit', function(event) {
    if (event && event.type !== 'dblclick') return;
    domain.ItemNode.prototype.edit.call(this, event);
});

// Node for domain designer tables view:
// fields should not respond on any events
domain.TablesCustomNode = function(options) {
    domain.TablesNode.call(this, options);

    this.nodeHeaderTemplateDomId =
            options.param.type === this.Types.Folder.name
                    ? 'list_responsive_collapsible_type_tables:tables'
                    : 'list_responsive_collapsible_type_tables:fields'
};

domain.TablesCustomNode.prototype = deepClone(domain.TablesNode.prototype);

//Copy Move controller for domain desiger tables
domain.TablesCopyMoveController = function() {
    domain.NodeCopyMoveController(this);
};

domain.TablesCopyMoveController.prototype = deepClone(domain.NodeCopyMoveController.prototype);

domain.TablesCopyMoveController.addMethod('_buildMetanode', function(node) {
    var metanode = {
        id: node.param.id,
        label: node.name,
        type: node.param.type,
        uri: node.param.uri
    };

    if (node.param.extra) {
        metanode.extra = {
            originalId: node.param.extra.originalId,
            table: node.param.extra.table,
            itemId: node.param.extra.itemId,
            datasourceId: node.param.extra.datasourceId,
            repoId: node.param.extra.repoId,
            dataSource: node.param.extra.dataSource,
            dataSetType: node.param.extra.dataSetType,
            query: node.param.extra.query
        };

        if (node.param.extra.expression) {
            metanode.extra.expression = node.param.extra.expression;
        }

        if (!node.isParent()) {
            metanode.extra.JavaType = node.param.extra.JavaType;
            metanode.extra.JdbcType = node.param.extra.JdbcType;
            metanode.extra.sourceItem = node.parent.param.extra.originalId;
        }
    }

    return metanode;
});

domain.TablesCopyMoveController.addMethod('_handleDuplicatedNode', function (node, existingParent) {
    if (node.isParent()) {
        var suffix = 1;
        var newId = node.param.extra.datasourceId + '.' + node.param.extra.itemId + suffix;
        var tree = dynamicTree.trees[existingParent.getTreeId()];
        while (tree.findNodeChildByMetaName(existingParent, newId)) {
            suffix++;
            newId = node.param.extra.datasourceId + '.' + node.param.extra.itemId + suffix;
        }

        node.param.id = newId;
        node.param.extra.itemId += suffix;
        node.name = node.param.extra.itemId;
        node.param.extra.originalId = node.param.extra.itemId;
        //TODO handle node.uri?

        existingParent.addChild(node);
        node.isloaded = true;

        if (node.hasChilds()) {
            node.childs.each(function(child) {
                this._handleDuplicatedNode(child, node);
            }.bind(this));
        }

        return newId;
    } else {
        node.param.id = node.parent.param.id + '.' + node.param.extra.itemId;
        node.param.extra.originalId = node.parent.param.extra.originalId + '.' + node.param.extra.itemId;
        //TODO handle node.uri?
    }
});

domain.DerivedTablesNode = function(options) {
    domain.TablesNode.call(this, options);

    if (options.param.type === this.Types.Folder.name) {
        if (options.param.extra && options.param.extra.query) {
            this.isSelectable = true;
        }
    }
};

domain.DerivedTablesNode.prototype = deepClone(domain.TablesNode.prototype);

// List for domain designer joins
domain.JoinsList = function(id, options) {
    dynamicList.List.call(this, id, options);
};

domain.JoinsList.prototype = deepClone(dynamicList.List.prototype);

domain.JoinsList.addMethod('_changeHandler', function(event) {
    var item = this.getItemByEvent(event);
    if (!item) {
        return;
    }

    if (item._respondOnItemEvents && !event.isInvoked) {
        this.fire('item:change', { targetEvent: event, item: item });
    }

    event.isInvoked = true;
});

domain.JoinsList.addMethod('_initEvents', function() {
    dynamicList.List.prototype._initEvents.call(this);

    var container = this._getElement();
    container.stopObserving('change').observe('change', this._changeHandler.bindAsEventListener(this));
});

// List items for domain designer joins
domain.JoinsListItem = function(options) {
    dynamicList.ListItem.call(this, options);

    this._hidden = false;
};

domain.JoinsListItem.prototype = deepClone(dynamicList.ListItem.prototype);

domain.JoinsListItem.addMethod('hide', function(hide) {
    this._hidden = !!hide;
    this.refreshStyle();
});

domain.JoinsListItem.addMethod('refreshStyle', function() {
    dynamicList.ListItem.prototype.refreshStyle.call(this);
    if (this._getElement()) {
        this._hidden
                ? this._getElement().addClassName(layoutModule.HIDDEN_CLASS)
                : this._getElement().removeClassName(layoutModule.HIDDEN_CLASS);
    }
});

domain.JoinsListItem.addMethod('processTemplate', function(element) {
    var div = element.childElements()[0]; //div
    div.cleanWhitespace();

    var columnOne = div.childElements()[1]; //column one
    var columnTwo = div.childElements()[2]; //column two
    var columnThree = div.childElements()[3]; //column three
    var select = columnThree.childElements()[0]; //select
    var options = select.childElements(); //options

    columnOne.update(this._value.left.table.label + ':' + this._value.left.label);
    columnTwo.update(this._value.right.table.label + ':' + this._value.right.label);
    options.each(function (option) {
        option.selected = (option.value === this._value.type);
    }.bind(this));

    return element;
});

domain.JoinsListItem.addMethod('setJoinType', function(type) {
    this.getValue().type = type;
    var element = this._getElement();
    if (element) {
        var select = element.childElements()[0].childElements()[3].childElements()[0];
        $(select).value = type;
    }
});

domain.JoinsListItem.addMethod('toJSON', function() {
    return Object.toJSON({
        left: this._value.left.id,
        right: this._value.right.id,
        type: this._value.type
    });
});

//Domain designer display node
domain.DisplayNode = function(options) {
    domain.ItemNode.call(this, options);

    this.Types = {
        Folder : new dynamicTree.TreeNode.Type('ItemGroupType'),
        Leaf : new dynamicTree.TreeNode.Type('ItemType')
    };

    this.nodeHeaderTemplateDomId = 'list_responsive_collapsible_type_sets:sets';
    //TODO: modify backend so error will be passed through extra.isInvalid field
    //if (options.fontColor === 'red') {
    //    this.params.extra.isInvalid = 'true';
    //}
};

domain.DisplayNode.prototype = deepClone(domain.ItemNode.prototype);

domain.DisplayNode.addMethod('toJSON', function() {
    var nodeModel = [];
    nodeModel.push('{');
    nodeModel.push('id:' + Object.toJSON(this.param.id));
    nodeModel.push(',label:' + Object.toJSON(this.name));
    nodeModel.push(',type:' + Object.toJSON(this.param.type));

    var extra = this.param.extra;

    extra.itemId && nodeModel.push(',itemId:' + Object.toJSON(extra.itemId));
    extra.descr && nodeModel.push(',descr:' + Object.toJSON(extra.descr));

    nodeModel.push(',labelId:');
    nodeModel.push(extra.labelId ? Object.toJSON(extra.labelId) : '""');
    nodeModel.push(',descrId:');
    nodeModel.push(extra.descrId ? Object.toJSON(extra.descrId) : '""');
    nodeModel.push(',resourceId:');
    nodeModel.push(extra.resourceId ? Object.toJSON(extra.resourceId) : '""');

    if (this.isParent()) {
        //For now nothing
    } else {
        extra.dataType && nodeModel.push(',dataType:' + Object.toJSON(extra.dataType));
        extra.dimensionOrMeasure && nodeModel.push(',dimensionOrMeasure:' + Object.toJSON(extra.dimensionOrMeasure));
        extra.defaultMask && nodeModel.push(',defaultMask:' + Object.toJSON(extra.defaultMask));
        extra.defaultAgg && nodeModel.push(',defaultAgg:' + Object.toJSON(extra.defaultAgg));
    }

    if (this.isParent()) {
        var children = '';

        this.childs.each(function(child) {
            if (!child.isHidden()) {
                if (children) {
                    children += ',';
                }

                children += Object.toJSON(child);
            }
        });

        nodeModel.push(',children:[' + children + ']');
    }

    nodeModel.push('}');

    return nodeModel.join('');
});

domain.DisplayNode.addVar('INVALID_NODE_CLASS', "invalid");

domain.DisplayNode.addMethod('refreshStyle', function(element) {
    if (!element) {
        element = this._getElement();
        if (!element) {
            return;
        }
    }

    domain.ItemNode.prototype.refreshStyle.call(this, element);

    if (this.param.extra && this.param.extra.isInvalid === 'true') {
        element.addClassName(this.INVALID_NODE_CLASS);
    } else {
        element.removeClassName(this.INVALID_NODE_CLASS);
    }
});

//////////////////////////
// Tree utils
//////////////////////////

domain.genericTreeParams = {
    rootUri: "/",
    showRoot: false,
    nodeClass: domain.ItemNode,
    treeClassName: "",
    multiSelectEnabled: true
};

// Creates all trees in domain designer and data chooser
domain.createItemsTree = function(treeParams) {
    treeParams = Object.extend(deepClone(domain.genericTreeParams), treeParams);
    return new dynamicTree.TreeSupport(treeParams.treeId, treeParams);
};



////////////////////////////////////////////
// Common dialogs for Designer and Chooser
////////////////////////////////////////////

///////////////////////////////////
// Confirm dialog
///////////////////////////////////

domain.confirmDialog = {
    MODE_OK_CANCEL: 'okCancel',
    MODE_YES_NO: 'yesNo',
    _CONFIRM_DIALOG_DOM_ID: 'standardConfirm',
    _CONFIRM_DIALOG_BODY_DOM_PATTERN: '#standardConfirm > .content > .body',
    _CONFIRM_DIALOG_OK_BUTTON_ID: '#confirmYes',
    _CONFIRM_DIALOG_CANCEL_BUTTON_ID: '#confirmNo',
    _CONFIRM_DIALOG_OK_PATTERN: '#confirmYes > span',
    _CONFIRM_DIALOG_CANCEL_PATTERN: '#confirmNo > span',
    _yesMessageHolder: null,
    _noMessageHolder: null,
    _dialog: null,
    _onOk: null,
    _onCancel: null,
    _customEventHandler: null,
    _templateDomId: null,
    _visible: false,

    ////////////////////////
    // Public
    ////////////////////////

    init: function() {
        domain.confirmDialog._init.bind(domain.confirmDialog)();
    },

    show: function(templateDomId, onOk, onCancel, customEventHandler, mode) {
        domain.confirmDialog._show.bind(domain.confirmDialog, templateDomId, onOk, onCancel, customEventHandler, mode)();
    },

    hideForDetails: function() {
        dialogs.popup.hide(domain.confirmDialog._dialog);
    },

    showFromDetails: function() {
        dialogs.popup.show(domain.confirmDialog._dialog, true);
    },

    visible: function() {
        return domain.confirmDialog._visible;
    },

    ////////////////////////
    // Private
    ////////////////////////

    _init: function() {
        this._dialog = $(this._CONFIRM_DIALOG_DOM_ID);
        this._yesMessageHolder = $$(this._CONFIRM_DIALOG_OK_PATTERN).first(),
        this._noMessageHolder = $$(this._CONFIRM_DIALOG_CANCEL_PATTERN).first(),

        domain.registerClickHandlers([this._clickEventHandler.bind(this)]);
    },

    _show: function(templateDomId, onOk, onCancel, customEventHandler, mode) {
        this._onOk = onOk;
        this._onCancel = onCancel;
        this._customEventHandler = customEventHandler;
        this._templateDomId = templateDomId;

        if (mode && mode == this.MODE_YES_NO) {
            this._yesMessageHolder.update(domain.getMessage('yes'));
            this._noMessageHolder.update(domain.getMessage('no'));
        } else {
            this._yesMessageHolder.update(domain.getMessage('ok'));
            this._noMessageHolder.update(domain.getMessage('cancel'));
        }

        $(this._templateDomId).removeClassName(layoutModule.HIDDEN_CLASS);

        dialogs.popup.show(this._dialog, true);
        this._visible = true;
    },

    _hide: function(callback) {
        $(this._templateDomId).addClassName(layoutModule.HIDDEN_CLASS);
        dialogs.popup.hide(this._dialog);
        this._visible = false;
        callback && callback();
    },

    _clickEventHandler: function(element) {
        if (domain.elementClicked(element, this._CONFIRM_DIALOG_OK_BUTTON_ID)) {
            this._hide(this._onOk);
            return true;
        } else if (domain.elementClicked(element, this._CONFIRM_DIALOG_CANCEL_BUTTON_ID)) {
            this._hide(this._onCancel);
            return true;
        } else if (this._customEventHandler) {
            return this._customEventHandler(element);
        }
    }
};

///////////////////////////////////
// Details dialog
///////////////////////////////////
domain.detailsDialog = {
    _DETAIL_DIALOG_DOM_ID: 'detail',
    _DETAIL_DIALOG_CLOSE_BUTTON_ID: '#close',
    _DETAIL_DIALOG_LIST_DOM_ID: 'detailsList',
    _DETAIL_DIALOG_TEXT_DOM_ID: 'detailsText',
    _LIST_TEMPLATE: 'defaultListTemplate',
    _LIST_ITEM_TEMPLATE: 'dynamicListItemTemplate',
    _dialog: null,
    _showConfirmAfterClose: false,
    _list: null,
    _listItems: null,

    ////////////////////////
    // Public
    ////////////////////////

    init: function() {
        domain.detailsDialog._init.bind(domain.detailsDialog)();
    },

    show: function(messageObj) {
        domain.detailsDialog._show.bind(domain.detailsDialog, messageObj)();
    },

    ////////////////////////
    // Private
    ////////////////////////

    _init: function() {
        this._dialog = $(this._DETAIL_DIALOG_DOM_ID);
        domain.registerClickHandlers([this._clickEventHandler.bind(this)]);
    },

    _show: function(messageObj) {
        if (domain.confirmDialog.visible()) {
            domain.confirmDialog.hideForDetails();
            this._showConfirmAfterClose = true;
        } else {
            this._showConfirmAfterClose = false;
        }

        this._createMessage(messageObj);
        dialogs.popup.show(this._dialog, true);
        $(this._DETAIL_DIALOG_LIST_DOM_ID).parentNode.scrollTop = 0;
    },

    _createMessage: function(messageObj) {
        if (typeof(messageObj) === 'string') {
            $(this._DETAIL_DIALOG_LIST_DOM_ID).addClassName(layoutModule.HIDDEN_CLASS);
            $(this._DETAIL_DIALOG_TEXT_DOM_ID).removeClassName(layoutModule.HIDDEN_CLASS).update(messageObj);
        } else {
            $(this._DETAIL_DIALOG_TEXT_DOM_ID).addClassName(layoutModule.HIDDEN_CLASS);
            $(this._DETAIL_DIALOG_LIST_DOM_ID).removeClassName(layoutModule.HIDDEN_CLASS);

            if (this._items) {
                this._list.removeItems(this._items);
                this._items = null;
                this._list = null;
            }

            this._items = messageObj.collect(function(listItem) {
                return new dynamicList.ListItem({
                    label: listItem
                });
            });

            this._list = new dynamicList.List(this._DETAIL_DIALOG_LIST_DOM_ID, {
                listTemplateDomId: this._LIST_TEMPLATE,
                itemTemplateDomId: this._LIST_ITEM_TEMPLATE,
                items: this._items
            });

            this._list.show();
        }
    },

    _close: function() {
        dialogs.popup.hide(this._dialog);
        if (this._showConfirmAfterClose) {
            domain.confirmDialog.showFromDetails();
        }
    },

    _clickEventHandler: function(element) {
        if (domain.elementClicked(element, this._DETAIL_DIALOG_CLOSE_BUTTON_ID)) {
            this._close();
            return true;
        }
    }
};

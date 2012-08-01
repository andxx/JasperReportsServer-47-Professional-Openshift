/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

//////////////////////////
// Domain Designer Tables
//////////////////////////
dd.tables = {
    PAGE: 'tables',
    TREE_TEMPLATE_DOM_ID: 'list_responsive_collapsible_type_tables',
    SOURCE_TABLES_DOM_ID: 'sourceTablesTree',
    DESTINATION_TABLES_DOM_ID: 'destinationTablesTree',
    SOURCE_TABLES_COLUMN_DOM_ID: 'sourceTablesColumn',
    DESTINATION_TABLES_COLUMN_DOM_ID: 'destTablesColumn',
    SOURCE_TABLES_TREE_PROVIDER: 'choiceTreeDataProvider',
    DESTINATION_TABLES_TREE_PROVIDER: 'selectedMetaDataTreeDataProvider',
    DATA_SOURCE_LABEL_DOM_ID: 'dataSource',
    MOVE_BUTTON_IDS: ['left', 'right', 'toLeft'],
    MANAGE_DATA_SOURCE_DIALOG_ID: "manageDataSource",
    nodeCopyMoveController: new domain.TablesCopyMoveController(),
    organizationId: null,
    publicFolderUri: null,
    sourceTablesTree: null,
    destinationTablesTree: null,
    dataSource: null,
    dataSourceSelectedProperties: null,
    usedTablesByItemId: null,
    joins: null,
    askForSchemas: null,

    getValidationPostData: function() {
        return {selectedModel: this.getSelectedModel(), page: this.PAGE};
    },

    getSelectedModel: function() {
        var tree = this.destinationTablesTree;

        if (!tree || !tree.getRootNode() || !tree.getRootNode().childs) {
            return '[]';
        }
        
        var childNodes = this.destinationTablesTree.getRootNode().childs;

        return Object.toJSON(childNodes.findAll(function(node) {
                    return !node.isHidden();
                }))
    },

    fillForm: function() {
        $('selectedModel').writeAttribute('value', this.getSelectedModel());
        $('autoGenerateJoins').writeAttribute('value', (!!$F('inspectAndJoin')).toString());
        $('datasources').writeAttribute('value', [this.dataSource].toJSON());
        $('unsavedChangesPresent').writeAttribute('value', dd.isUnsavedChangesPresent().toString());
    },
    
    initFromOptions: function(options) {
        this.organizationId = options.organizationId;
        this.publicFolderUri = options.publicFolderUri;

        this.dataSource = options.dataSourcesList.first();
        this.dataSourceSelectedProperties = options.datasourcesProperties;
        this.usedTablesByItemId = options.usedTablesByItemId;
        this.joins = options.jsonJoins;
        this.askForSchemas = options.askForSchemas;
    },

    init: function(options) {
        this.initFromOptions(options);

        dd.calcFieldsAndFiltersValidator.init(dd.validateForCalcFields.bind(dd),
                dd.getTablesUsedForFilters.bind(dd, this.usedTablesByItemId[this.dataSource.name]));

        domain.resetTreeSelectionHandler.init(
                (this.MOVE_BUTTON_IDS.concat([this.SOURCE_TABLES_COLUMN_DOM_ID, this.DESTINATION_TABLES_COLUMN_DOM_ID,
                    this.SOURCE_TABLES_DOM_ID, this.DESTINATION_TABLES_DOM_ID,
                    this.MANAGE_DATA_SOURCE_DIALOG_ID])).collect(function(elem) {return '#' + elem}),
                function() {return [this.sourceTablesTree, this.destinationTablesTree]}.bind(this),
                this.updateButtonsState.bind(this));
        
        domain.registerClickHandlers([
            this.selectDataSourceClickEventHandler.bind(this),
            this.moveButtonsClickEventHandler.bind(this)
        ]);

        this.manageDataSourceDialog.init({
                    dataSourceUri: this.dataSource.uri,
                    organizationId: this.organizationId,
                    publicFolderUri: this.publicFolderUri,
                    callback: this.setDataSource.bind(this),
                    selectSchema: this.selectSchema.bind(this),
                    getSchemas: this.checkForSchemas.bind(this),
                    hasSchemas: this.hasSchemas
                });
        this.selectSchemasDialog.init(
                    this.findInvalidFields.bind(this),
                    this.fixSchemaPrefixesValidator.validate);
        this.autoGenerateJoinsValidator.init(this.joins);
        this.invalidSelectedTablesValidator.init(
                    this.findInvalidFields.bind(this),
                    this.removeInvalidFields.bind(this));
        this.fixSchemaPrefixesValidator.init(this.fixSchemaPrefixes.bind(this));

        this.initTrees();
        this.destinationTablesTree.showTree(1, this.initDataSource.bind(this), domain.treeErrorHandler);
        this.updateButtonsState();
    },

    initTrees: function() {
        this.sourceTablesTree = domain.createItemsTree({
            handleNodeOnDblclick: false,
            treeId: this.SOURCE_TABLES_DOM_ID,
            providerId: this.SOURCE_TABLES_TREE_PROVIDER,
            templateDomId: this.TREE_TEMPLATE_DOM_ID,
            dragPattern: dd.TREE_DRAG_PATTERN,
            nodeClass: domain.TablesCustomNode,
            selectOnMousedown: true
        });

        this.destinationTablesTree = domain.createItemsTree({
            handleNodeOnDblclick: false,
            treeId: this.DESTINATION_TABLES_DOM_ID,
            providerId: this.DESTINATION_TABLES_TREE_PROVIDER,
            templateDomId: this.TREE_TEMPLATE_DOM_ID,
            dragPattern: dd.TREE_DRAG_PATTERN,
            nodeClass: domain.TablesCustomNode,
            selectOnMousedown: true
        });

        for (var eventName in this.treeEventFactory) {
            [this.sourceTablesTree, this.destinationTablesTree]
                    .invoke('observe', eventName, this.treeEventFactory[eventName].bindAsEventListener(this));
        }

        this.initDragAndDrop();
    },

    initDragAndDrop: function() {
       var dropAreas = [
           this.SOURCE_TABLES_DOM_ID,
           this.SOURCE_TABLES_COLUMN_DOM_ID,
           this.DESTINATION_TABLES_DOM_ID,
           this.DESTINATION_TABLES_COLUMN_DOM_ID];

       var onDrop = function(dragged, dropped, event) {
           var node = dragged.node;
           if (!node) {
               return;
           }

           var sourceTree = dynamicTree.trees[node.getTreeId()];
           var destTree = matchAny(dropped, ['#' + this.SOURCE_TABLES_COLUMN_DOM_ID], true)
                   ? this.sourceTablesTree
                   : this.destinationTablesTree;

           if (sourceTree === destTree) {
               return;
           }

           this.moveNodes(sourceTree.selectedNodes, destTree.getRootNode());
       }.bind(this);

       dropAreas.each(function(dropArea) {
           Droppables.remove(dropArea);
           Droppables.add(dropArea,{
               accept: ['draggable', 'wrap'],
               onDrop: onDrop
           });
       });
    },

    //First initialization of datasource
    initDataSource: function() {
        this.updateDataSourceLabel(this.dataSource.name);

        var schemaSelectCallback = function(selectedProperties) {
            var props = {
                dataSource: this.dataSource,
                selectedProperties: selectedProperties,
                presentationSelected: dd.presentationSelected,
                reloadBoth:false
            };

            this.setDataSourceOrReloadTree(props);
        };

        if (this.askForSchemas) {
            this.selectSchema({
                dataSource: this.dataSource,
                initialChange: true,
                callback: schemaSelectCallback.bind(this)});
        } else {
            schemaSelectCallback.bind(this)(this.dataSourceSelectedProperties);
        }
    },

    setDataSourceOrReloadTree: function(params) {
        var callback = function() {
            this.invalidSelectedTablesValidator.validate(this.updateButtonsState.bind(this));
        };

        if (!params.presentationSelected || this.askForSchemas) {
            this.setDataSource(params.dataSource, params.selectedProperties);
        } else {
            this.dataSource = params.dataSource;
            this.dataSourceSelectedProperties = params.selectedProperties;

            params.reloadBoth
                    ? this.reloadBothTrees(null)
                    : this.reloadTree(this.sourceTablesTree, callback.bind(this));
        }
    },
    //End first initialization of datasource

    updateDataSourceLabel: function(label) {
        $(this.DATA_SOURCE_LABEL_DOM_ID).update(label);
    },

    hasSchemas: function(properties, name) {
        //Catalogs now are not supported so only check for schemas
        return properties && properties[name] && properties[name].schemas && properties[name].schemas.first();
    },

    reloadBothTrees: function(callback) {
        var destTreeLoadCallback = function() {
            this.invalidSelectedTablesValidator.validate(callback);
        };

        this.reloadTree(this.sourceTablesTree, null);
        this.reloadTree(this.destinationTablesTree, destTreeLoadCallback.bind(this));
    },

    reloadTree: function(tree, callback) {
        var loadCallback = function() {
            dd.hasSchemas = this.hasSchemas(
                        this.dataSourceSelectedProperties,
                        this.dataSource.name);

            this.updateDataSourceLabel(this.dataSource.name);
            this.updateButtonsState();
            callback && callback();
        };

        tree.showTree(1, loadCallback.bind(this), domain.treeErrorHandler);
    },

    selectSchema: function(props) {
        var selectedProperties = null;

        var checkForSchemasCallback = function(dataSourceProperties) {
            //call handler for dataSourceProperties
            props.handleDsProps && props.handleDsProps(dataSourceProperties);

            if (this.hasSchemas(dataSourceProperties, props.dataSource.name)) {
                //Only schemas are supported now so take only schemas
                var schemasList = dataSourceProperties[props.dataSource.name].schemas;

                props.hideDialog && props.hideDialog();
                this.selectSchemasDialog.show({
                    schemasList: schemasList,
                    selectedSchemas: props.selectedSchemas,
                    standalone: props.initialChange,
                    dataSource: props.dataSource,
                    callback: selectSchemaCallback.bind(this)
                });
            } else {
                selectedProperties = dataSourceProperties;
                props.callback && props.callback(selectedProperties);
            }
        };

        var selectSchemaCallback = function(selectedProps) {
            //Dialog returns raw list so build selectedProperties manually
            selectedProperties = {};
            selectedProperties[props.dataSource.name] = {};
            selectedProperties[props.dataSource.name].schemas = selectedProps;
            selectedProperties[props.dataSource.name].catalogs = [];

            props.showDialog && props.showDialog();

            props.callback && props.callback(selectedProperties);
        };

        if (props.dsProps) {
            checkForSchemasCallback.bind(this)(props.dsProps);
        } else {
            this.checkForSchemas(props.dataSource, checkForSchemasCallback.bind(this));
        }
    },

    findInvalidFields: function() {
        var invalidFields = [];
        this.destinationTablesTree.getRootNode().childs.each(function(table) {
            if (table.isHidden()) {
                return;
            }

            var invalidFieldsInTable = table.childs.findAll(function(field) {
                return field.param.extra.isInvalid === 'true';
            });

            invalidFields = invalidFields.concat(invalidFieldsInTable);
        });

        return invalidFields;
    },

    removeInvalidFields: function(fields) {
        if (!fields || !fields.first()) {
            return;
        }

        //firstly remove all invalid fields
        fields.each(function(field) {
            field.parent.removeChild(field);
        });

        //secondly - update validity for all non empty tables and remove empty tables
        this.destinationTablesTree.getRootNode().childs.collect(function(table) {
            return table;
        }).each(function(table) {
            if (table.childs.first()) {
                delete table.param.extra.isInvalid;
                table.refreshStyle();
            } else {
                table.parent.removeChild(table);
            }
        });

        this.updateButtonsState();
    },

    ////////////////////////////////////////////////////
    // Form submits for domain designer business logic
    ////////////////////////////////////////////////////
    fixSchemaPrefixes: function(dataSource, selectedSchemasList) {
        var params = {
            flowExecutionKey: dd.flowExecutionKey,
            flowId: dd.FLOW_ID,
            eventId: 'initAction',
            selectedSchemas: selectedSchemasList.join(',')
        };

        this.dataSource.id = dataSource.id;
        this.dataSource.uri = dataSource.uri;
        domain.submitForm(dd.formDomId, params, this.fillForm.bind(this));
    },

    /////////////////////////////////////////
    // AJAX calls for tables business logic
    /////////////////////////////////////////
    deleteCalcFields: function(calcFieldIds, callback) {
        var urlData = {
            eventId: 'deleteCalculatedField',
            flowExecutionKey: dd.flowExecutionKey
        };

        var postData = {
            fieldsToDelete: Object.toJSON(calcFieldIds)
        };

        domain.sendAjaxRequest(urlData, postData, callback);
    },

    checkForSchemas: function(dataSource, callback) {
        var urlData = {
            flowExecutionKey: dd.flowExecutionKey,
            eventId: 'checkForSchemas'
        };

        var postData = {
            selectedDatasources: [dataSource].toJSON()
        };

        var checkCallback = function(result) {
            callback && callback(result ? result.first() : {});
        };

        domain.sendAjaxRequest(urlData, postData, checkCallback.bind(this));
    },

    setDataSource: function(dataSource, dataSourceSelectedProperties) {
        var urlData = {
            flowExecutionKey: dd.flowExecutionKey,
            eventId: 'setDatasources'
        };

        var postData = {
            datasources: Object.toJSON([dataSource]),
            datasourcesProperties: Object.toJSON(dataSourceSelectedProperties)
        };

        //Actually we never will have case then datasource
        //will be added because only one datasource is supported now
        var replaced = true;
    
        var callback = function() {
            this.dataSource = dataSource;
            this.dataSourceSelectedProperties = dataSourceSelectedProperties;

            this.pickDataSource(replaced);
        };

        domain.sendAjaxRequest(urlData, postData, callback.bind(this));
    },

    pickDataSource: function(replaced) {
        var urlData = {
            flowExecutionKey: dd.flowExecutionKey,
            eventId: 'pickDatasource'
        };

        var tree = this.destinationTablesTree;
        var selectedModel = '[]';
        if (tree && tree.getRootNode()) {
            selectedModel =
                    tree.getRootNode().childs.findAll(function(node) {
                            return !node.isHidden();
                    }).toJSON();
        }

        var postData = {
            selectedDatasource: this.dataSource.name,
            selectedModel: selectedModel,
            replaced: replaced,
            added: !replaced,
            page: this.PAGE
        };

        var callback = function() {
            this.reloadBothTrees(this.updateButtonsState.bind(this));
        };

        domain.sendAjaxRequest(urlData, postData, callback.bind(this));
    },

    // ---- Tree event handling: START ---
    moveNodes: function(nodes, rootNode) {
        if (!nodes || !nodes.first() || !rootNode) {
            return;
        }

        var sourceTree = dynamicTree.trees[nodes.first().getTreeId()];

        if (sourceTree == this.sourceTablesTree) {
            this.moveNodesFromSourceTree(nodes, rootNode);
        } else {
            this.moveNodesFromDestTree(nodes, rootNode);
        }

        dd.setUnsavedChangesPresent(true);
    },

    moveNodesInternal: function(nodes, rootNode) {
        if (!nodes || !nodes.first() || !rootNode) {
            return;
        }
    
        var destTree = dynamicTree.trees[rootNode.getTreeId()];
        destTree._getElement().parentNode.scrollTop = 0;

        var copies = this.nodeCopyMoveController.move(nodes, rootNode);
        destTree.resortSubtree(destTree.getRootNode());
        destTree.renderTree();
        
        copies.each(function(node) {
            destTree.addNodeToSelected(node);
            node.refreshStyle();
        });
        copies.first()._getElement().focus();

        this.updateButtonsState();
    },

    moveNodesFromSourceTree: function(nodes, rootNode) {
        var sourceTree = dynamicTree.trees[nodes.first().getTreeId()];

        //if node is loaded - add it to loadedNodes array
        //else - to notLoadedNodes
        var notLoadedNodes = nodes.findAll(function(node) {
            return !node.isloaded || !node.childs || !node.childs.first();
        });

        var callback = function(parentNodeIds, ns) {
            if (parentNodeIds && ns) {
                sourceTree.setMultipleNodesChilden(parentNodeIds, ns);
            }
            this.moveNodesInternal(nodes, rootNode);
            sessionManager.resetSession(dd.flowExecutionKey);
        };

        if (notLoadedNodes && notLoadedNodes.first()) {
            sourceTree.getTreeMultipleNodesChildren(notLoadedNodes, callback.bind(this), domain.treeErrorHandler);
        } else {
            callback.bind(this)();
        }
    },

    moveNodesFromDestTree: function(nodes, rootNode) {
        var callback = function(involvedFieldsIds, involvedFieldsExpressionIds) {
            if (involvedFieldsExpressionIds && involvedFieldsExpressionIds.length > 0) {
                this.deleteCalcFields(involvedFieldsExpressionIds);
            }

            var splittedNodes = this.findNodesToDeleteAndNodesToRestore(nodes);
            splittedNodes.nodesToDelete.each(function(node) {
                //Remove node because it is invalid at whole
                //so we do not need to keep it
                node.parent.removeChild(node);
            });
            this.moveNodesInternal(splittedNodes.nodesToRestore, rootNode);
        };

        dd.calcFieldsAndFiltersValidator.validate(nodes, true, callback.bind(this));
    },

    findNodesToDeleteAndNodesToRestore: function(nodes) {
        var selectedProperties = this.dataSourceSelectedProperties;
        var dataSource = this.dataSource;

        var schemas = [];
        if (this.hasSchemas(selectedProperties, dataSource.name)) {
            //At current implementation only schema are supported so only they could be present
            schemas = selectedProperties[dataSource.name].schemas;
        }

        var nodesToDelete = [];
        var nodesToRestore = [];
    
        nodes.each(function(node) {
            // when node has a schema it's 'table' param looks like <schemaName>.<tableName>
            // when it hasn't schema it looks like just <tableName>
            var schemaOfnode = null;
            var t = node.param.extra.table.split(".");
            if (t.length >= 2) {
                schemaOfnode = t[0];
            }

            var isNodeSchemaPresentInSchemas = schemaOfnode && schemas.find(function(schemaName) {
                return schemaName === schemaOfnode;
            });

            if (node.param.extra.isInvalid) {
                //Node is invalid. find all corrupted fields which
                //makes node invalid
                var corruptedFields = node.childs.findAll(function(child) {
                    return child.param.extra.isInvalid;
                });

                //if all fields are invalid - just needs to delete node
                //else - remove all invalif fields and resore node
                if (corruptedFields.length == node.childs.length) {
                    nodesToDelete.push(node);
                } else {
                    //remove all corrupted fields before adding to restore array
                    corruptedFields.each(function(corruptedField) {
                        node.removeChild(corruptedField);
                    });

                    nodesToRestore.push(node);
                }
            } else if (schemas.length > 0 && schemaOfnode) {
                //schemas present - check that schema name present in schemas list
                isNodeSchemaPresentInSchemas ? nodesToRestore.push(node) : nodesToDelete.push(node);
            } else if (!schemas.first() && !schemaOfnode) {
                //schemas not prsent
                nodesToRestore.push(node);
            } else {
                //in all other cases suppose that node is invalid
                //e.g. schemas present but schema prefix is not defined
                //or schema prefix is defined but there is no schemas
                nodesToDelete.push(node);
            }
        });

        return {
            nodesToDelete: nodesToDelete,
            nodesToRestore: nodesToRestore
        }
    },

    nodeDblClick: function(event) {
        var node = event.memo.node;

        if (node) {
            var sourceTree = dynamicTree.trees[node.getTreeId()];
            var destTree = (sourceTree == this.sourceTablesTree) ?
                    this.destinationTablesTree : this.sourceTablesTree;

            if (sourceTree && destTree) {
                sourceTree._deselectAllNodes();
                node.select();

                this.moveNodes(sourceTree.selectedNodes, destTree.getRootNode());
            }
        }

        Event.stop(event);
    },
    // ---- Tree event handling: END ---

    // ---- Move buttons event and status handling: START ---
    moveButtonsClickEventHandler: function(element) {
        var eventHandled = false;
        this.moveButtonsClickEventMap.each(function(pair) {
            if (domain.elementClicked(element, pair.key)) {
                var sourceTree = dynamicTree.trees[pair.value.sourceTree];
                var destTree = dynamicTree.trees[pair.value.destTree];

                var nodes = pair.value.moveAll
                        ? sourceTree.getRootNode().childs.findAll(function(table) {
                            return !table.isHidden();
                          })
                        : sourceTree.selectedNodes;
                this.moveNodes(nodes, destTree.getRootNode());

                eventHandled = true;
                throw $break;
            }
        }.bind(this));
        
        return eventHandled;
    },

    updateButtonsState: function() {
        var destTree = this.destinationTablesTree;
        var srcTree = this.sourceTablesTree;

        var destTreeHasVisibleNodes = destTree && destTree.getRootNode() && destTree.getRootNode().hasVisibleChilds();
        var sourceTreeHasVisibleNodes = srcTree && srcTree.getRootNode() && srcTree.getRootNode().hasVisibleChilds();
        var destTreeHasSelectedNodes =  destTreeHasVisibleNodes && destTree.selectedNodes.length > 0;
        var sourceTreeHasSelectedNodes = sourceTreeHasVisibleNodes && srcTree.selectedNodes.length > 0;

        var params = {
            'destTreeHasSelectedNodes': destTreeHasSelectedNodes,
            'sourceTreeHasSelectedNodes': sourceTreeHasSelectedNodes,
            'destTreeHasVisibleNodes': destTreeHasVisibleNodes,
            'sourceTreeHasVisibleNodes': sourceTreeHasVisibleNodes
        };

        for (var button in this.moveButtonsUpdateStatusEventFactory) {
            var enable = this.moveButtonsUpdateStatusEventFactory[button](params);
            domain.enableButton(button, enable);
        }
    },
    // ---- Move buttons event and status handling: END ---

    // ---- Select data source event handling: START ---
    selectDataSourceClickEventHandler: function(element) {
        if (domain.elementClicked(element, '#' + this.DATA_SOURCE_LABEL_DOM_ID)) {
            this.manageDataSourceDialog.show(
                this.dataSource,
                this.dataSourceSelectedProperties);
            return true;
        }
    }
    // ---- Select data source event handling: END ---
};

// Short name for dd.tables
var dd_tables = dd.tables;

////////////////////////////////////////////////
// Factories
///////////////////////////////////////////////

dd_tables.treeEventFactory = {
    'node:dblclick': dd_tables.nodeDblClick,

    'node:mouseup': function(event) {
        this.updateButtonsState();
        Event.stop(event);
    }
};

dd_tables.moveButtonsUpdateStatusEventFactory = {
    'left' : function(params) {
        return params.destTreeHasSelectedNodes
    },

    'right': function(params) {
        return params.sourceTreeHasSelectedNodes
    },

    'toLeft': function(params) {
        return params.destTreeHasVisibleNodes
    }
};

dd_tables.moveButtonsClickEventMap = $H({
    '#left' : {
        sourceTree: dd_tables.DESTINATION_TABLES_DOM_ID,
        destTree: dd_tables.SOURCE_TABLES_DOM_ID
    },

    '#right': {
        sourceTree: dd_tables.SOURCE_TABLES_DOM_ID,
        destTree: dd_tables.DESTINATION_TABLES_DOM_ID
    },

    '#toLeft': {
        moveAll: true,
        sourceTree: dd_tables.DESTINATION_TABLES_DOM_ID,
        destTree: dd_tables.SOURCE_TABLES_DOM_ID
    }
});

///////////////////////////
// Entry point 
///////////////////////////

document.observe('dom:loaded', dd.initialize.bind(dd));

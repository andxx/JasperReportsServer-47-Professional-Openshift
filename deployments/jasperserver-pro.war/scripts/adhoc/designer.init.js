/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

adhocDesigner.layoutManagerProperties = {
    table : function() {
        return {
            axes : [
                { name : 'column', elementId : 'olap_columns'},
                { name : 'group', elementId : 'olap_rows'}
            ],
            common : {
                mode : 'table',
                id : adhocDesigner.DISPLAY_MANAGER_ID
            }
        }
    },
    crosstab : function(isOlap) {
        return {
            axes : [
                { name : 'column', elementId : 'olap_columns'},
                { name : 'row', elementId : 'olap_rows', isDependent: !!isOlap}
            ],
            common : {
                mode : 'crosstab',
                id : adhocDesigner.DISPLAY_MANAGER_ID,
                measuresGroupId : 'Measures',
                isOlapMode : !!isOlap
            }
        };
    },
    olap_crosstab : function() {
        return adhocDesigner.layoutManagerProperties.crosstab(true);
    },
    chart : function() {
        return {
            axes : [
                { name : 'measures', elementId : 'olap_columns'},
                { name : 'group', elementId : 'olap_rows'}
            ],
            common : {
                mode : 'chart',
                id : adhocDesigner.DISPLAY_MANAGER_ID
            }
        };
    }
};
adhocDesigner.initTitle = function() {
    if (!_.isBlank(saveLabel)) {
        adhocDesigner.ui.header_title.html(saveLabel);
    }
};

adhocDesigner.initLayoutManager = function(mode){
    var props = adhocDesigner.layoutManagerProperties[mode]();
    adhocDesigner.ui.display_manager = new LayoutManager(props.axes, props.common);
    adhocDesigner.observeDisplayManagerEvents();
};

adhocDesigner.initDialogs = function(){
	  adhocCalculatedFields.initialize();
    adhocDesigner.currentWorksheet.defferedCallback.done(function(state) {
        adhocControls.initialize.call(adhocControls, state);
    });
    isDesignView && adhocReentrance.initialize();
    adhocSort.initialize();
};

adhocDesigner.initFieldsPanel = function(onInit){
    if (!isDesignView) {
        return;
    }
    var it = adhocDesigner;
    if(onInit) {
        Event.observe($('availableFieldsMutton'), 'mouseover', function(evt) {
            actionModel.showDynamicMenu("availableFieldsMenu", evt, null, null, localContext.state.actionmodel);

            $("menu").clonePosition($('availableFieldsMutton'), {"setWidth" : false, "setHeight": false, "offsetTop" : 5});

            Event.stop(evt);

            Event.observe($('menu'), 'mouseleave', function() {
                this.showButtonMenuMouseOut($('menu'));
            }.bind(this));
        }.bind(adhocDesigner));
    }
    
    var k;
    var trees = {
		dimensions: {
			name: 'dimensionsTree',
			className: 'dimension',
			domId: it.DIMENSIONS_TREE_DOM_ID,
			providerId: it.DIMENSIONS_TREE_PROVIDER_ID
		},
		measures: {
			name: 'measuresTree',
			className: 'measure',
			domId: it.MEASURES_TREE_DOM_ID,
			providerId: it.MEASURES_TREE_PROVIDER_ID
		}
	}    
    
	for(k in trees){
		var tree = $(trees[k].domId);
	    if (tree) {
	        var children = tree.childElements();
	        children.each(function(object){object.remove();});
	    }
        it[trees[k].name] = it.getAvailableFieldsTree(trees[k].domId,trees[k].providerId);
	    /*
	     * Tree customizations
	     */
        var nodeUri = new JSCookie(it._cookieName).value;
        it._availableTreeLastOpened = nodeUri && nodeUri.length > 0 ? nodeUri : "/";
        it[trees[k].name].DEFAULT_TREE_CLASS_NAME = "responsive fields";
        it[trees[k].name].multiSelectEnabled = true;
        it[trees[k].name].dragClasses = trees[k].className;
        it[trees[k].name].multiSelectEnabled = (localContext.isOlapMode && localContext.isOlapMode()) ? false : true;
        it[trees[k].name].setDragStartState = function(tree) {
			return function(node, draggable, event){
				adhocDesigner.setDragStartState(tree, node, draggable, event);	
				selectionCategory.area = designerBase.AVAILABLE_FIELDS_AREA;
				localContext.canAddFilter && localContext.canAddFilter(node) && draggable.element.addClassName("supportsFilter");
			}
	    }(it[trees[k].name]);
	    
	    it[trees[k].name].showTree(it._AVAILABLE_TREE_DEPTH);

        if(isIPad()){
            tree = document.getElementById(trees[k].domId);
            new TouchController(tree, tree.parentNode,{scrollbars:true});
        }
	}
    it.observeTreeEvents(it['dimensionsTree'],it['measuresTree']);
    it.observeTreeEvents(it['measuresTree'],it['dimensionsTree']);
};

adhocDesigner.initFiltersPanel = function(onInit){
    if(onInit) {
    	Event.observe($('filterPanelMutton'), 'mouseover', function(evt){
            var offset = $('filterPanelMutton').cumulativeOffset();
            var offsetScroll = $('filterPanelMutton').cumulativeScrollOffset();
            var topOffset = offset["top"] - offsetScroll["top"];
            var coordinates = {"menuTop": topOffset + 5};
            actionModel.showDynamicMenu("filterPanelMenu", evt, toolbarButtonModule.TOOLBAR_MENU_CLASS, coordinates,
                localContext.state.actionmodel);
            Event.stop(evt);
            Event.observe($('menu'), 'mouseleave', function() {
                this.showButtonMenuMouseOut($('menu'));
            }.bind(this));
        }.bind(this));

        adHocFilterModule.resetFilterPanel();
    }
    
    evaluateScript('calendar');
    adHocFilterModule.initialize();
};

adhocDesigner.initDroppables = function(){
    var drops = {
        'filter-container': function(){
            var errorMessages = [];
            adHocFilterModule.canShowFilterOption(errorMessages) ? adHocFilterModule.addFilterPods(false) : dialogs.systemConfirm.show(errorMessages.join(' '), 5000);
        },
        'mainTableContainer': function(){
            switch(localContext.getMode()) {
                case 'table':
                    AdHocTable.addFieldAsColumn(true);
                    break;
                case 'chart':
                    AdHocChart.addFieldAsMeasure(true);
            }
        },
        'canvasTableFrame': function(){
            (localContext.getMode() == 'table') && AdHocTable.addFieldAsColumn(true);
        }
    };

    for (var myId in drops) {
        Droppables.remove(myId);
        if(document.getElementById(myId)) {
            Droppables.add(myId, {
                accept: ['draggable', 'wrap'], // mode == 'crosstab' ? ['supportsFilter'] :
                hoverclass: 'dropTarget',
                onDrop: function(myId){
                    return function(){
                        this[myId]();
                    }.bind(drops);
                }(myId)
            });
        }
    }
};

////////////////////////////////////////////////
//Helpers
////////////////////////////////////////////////
adhocDesigner.getAvailableFieldsTree = function(id, providerId){
    function AvailableTreeNode(options) {
        dynamicTree.TreeNode.call(this, options);

        this.Types = {
            Folder : new dynamicTree.TreeNode.Type('ItemGroupType')
        };
        this.nodeHeaderTemplateDomId = "list_responsive_collapsible_folders:folders";
    }

    AvailableTreeNode.prototype = deepClone(dynamicTree.TreeNode.prototype);

    AvailableTreeNode.addMethod('refreshStyle', function(element) {
        element = element || this._getElement();
        if(element) {
            dynamicTree.TreeNode.prototype.refreshStyle.call(this, element);
            var field = adhocDesigner.findFieldByName(this.param.id);
            (field && field.formulaRef) ? element.addClassName('calculatedField'):element.removeClassName('calculatedField');
        }
    });

    return new dynamicTree.TreeSupport(id, {
        providerId: providerId,
        rootUri: '/',
        showRoot: false,
        resetStatesOnShow: false,
        nodeClass: AvailableTreeNode,
        templateDomId: "list_responsive_collapsible_folders",
        dragPattern: isIPad() ? undefined : '.draggable',
        treeErrorHandlerFn: doNothing,
        selectOnMousedown: !isIPad(),
        regionID: id ? id : designerBase.AVAILABLE_FIELDS_AREA
    });
};





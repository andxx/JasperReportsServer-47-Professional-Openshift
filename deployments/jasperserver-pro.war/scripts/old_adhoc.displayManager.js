/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

var DisplayManager = function(options) {
    // Init constants
    var DM_ID = options.displayManagerElementId || 'displayManagerPanel';
    var COLUMN_AXIS_ID = options.columnsElementId || 'olap_columns';
    var ROW_AXIS_ID = options.rowsElementId || 'olap_rows';
    var DM_ITEM_PATTERNS = ['li.level.button', 'li.member.button'];
    var DM_AXIS_LIST_PATTERN = 'ul.tokens.sortable';
    var MEASURE_GROUP_DEFAULT_ID = adhocDesigner.MEASURES;

    // Init variables
    var displayManagerElement = $(DM_ID);
    var columnsElement = $(COLUMN_AXIS_ID);
    var rowsElement = $(ROW_AXIS_ID);
    var axes = null;
    var uniqueIdentifiersMap = $H({});
    var displayManagerHandlersMap = null;
    // After merge with CrossTab Display Manager has two modes: olap and crosstab
    var isOlapMode = (options.mode === designerBase.OLAP_CROSSTAB);

    /**
     * Display Manager initialization
     */
    (function initDisplayManager() {
        initAxesModel();
        render();
        initDragDropActions();
        registerEventHandlers();
    })();

    /**
     * Initialize rows and column model from JSON state objects.
     */
    function initAxesModel() {
        var columns = new DisplayManagerList(toAxisModel(options.columnGroups), canHoldIdentical());
        var rows = new DisplayManagerList(toAxisModel(options.rowGroups), canHoldIdentical());

        // Axes related structured data.
        axes = $H();
        axes.set(ROW_AXIS_ID, {
            model : rows,
            element : rowsElement,
            name : 'row',
            opposite : columns
        });
        axes.set(COLUMN_AXIS_ID, {
            model : columns,
            element : columnsElement,
            updateHandler : handleGroupMove,
            name : 'column',
            opposite : rows
        });

        if(!localContext.hasMeasures) jQuery('#nothingToDisplay p.message').html(localContext.missingMeasureMessage);
        if(localContext.hasMeasures && localContext.measures.length == localContext.fieldsInUse.length) jQuery('#nothingToDisplay p.message').html(localContext.missingDimensionMessage);
        if(localContext.fieldsInUse.length == 0) jQuery('#nothingToDisplay p.message').html(localContext.missingDimensionMeasureMessage);   
    }

    /**
     * Re-initialize DM state from external JSON model;
     */
    function initializeFromState(options) {
        reInitialize(new DisplayManagerList(toAxisModel(options.rows), canHoldIdentical()),
                new DisplayManagerList(toAxisModel(options.columns), canHoldIdentical()));
    }

    /**
     * Re-initializes DM state from the given row/column model objects. If model objects are not given,
     * simply make re-initialization of the given state.
     * @param rowsModel
     * @param columnsModel
     */
    function reInitialize(rowsModel, columnsModel) {
        // update axes meta info appropriately
        if (rowsModel && columnsModel) {
            axes.get(COLUMN_AXIS_ID).model = axes.get(ROW_AXIS_ID).opposite = columnsModel;
            axes.get(ROW_AXIS_ID).model = axes.get(COLUMN_AXIS_ID).opposite = rowsModel;
        }
        render();
        // Re-init DnD
        initDragDropActions();
    }

    /**
     * Render model state
     */
    function render() {
        axes.each(function(pair) {
            var axis = pair.value;
            clearAxisLayout(axis.element);
            renderAxisLayout(axis);
        });
        adjustAlternatingAndRowDisabling();
        
        if(!localContext.hasMeasures) jQuery('#nothingToDisplay p.message').html(localContext.missingMeasureMessage);
        if(localContext.hasMeasures && localContext.measures.length == localContext.fieldsInUse.length) jQuery('#nothingToDisplay p.message').html(localContext.missingDimensionMessage);
        if(localContext.fieldsInUse.length == 0) jQuery('#nothingToDisplay p.message').html(localContext.missingDimensionMeasureMessage);
        
        jQuery('#designer').trigger('layout_update');       
    }

    /////////////////////////////////
    //  DM Interface Methods
    /////////////////////////////////
    function addLevelToColumn(node) {
        addLevelOrDimension(COLUMN_AXIS_ID, node);
    }

    /**
     * @deprecated
     */
    function removeLevelFromColumn(levelId, groupId) {
        removeLevel(COLUMN_AXIS_ID, levelId, groupId);
    }

    function removeLevelFromColumnByIndex(levelIndex, groupId) {
        removeLevelByIndex(COLUMN_AXIS_ID, levelIndex, groupId);
    }

    function addLevelToRow(node) {
        addLevelOrDimension(ROW_AXIS_ID, node);
    }

    /**
     * @depricated
     */
    function removeLevelFromRow(levelId, groupId) {
        removeLevel(ROW_AXIS_ID, levelId, groupId);
    }

    function removeLevelFromRowByIndex(levelIndex, groupId) {
        removeLevelByIndex(ROW_AXIS_ID, levelIndex, groupId);
    }

    /**
     * Get all levels for Dimension with given id.
     * Perform search in a given axis if specified, in other case make search in both axes.
     *
     * @param groupId
     * @param axisId
     */
    function getLevelsFromDimension(groupId, axisId) {
        // Search group in the given axis, if axis is not given then perform search in columns and rows.
        var group = (axisId) ?
                axes.get(axisId).model.getLevelGroup(groupId) :
                (columns().getLevelGroup(groupId) || rows().getLevelGroup(groupId));

        return group && group._getLevels().map(function(level){return level.name;});
    }

    /**
     * Returns array for group ids in the given axis.
     *
     * @param axisId
     */
    function getDimensions(axisId) {
        return axes.get(axisId).model.getLevelGroups().map(function(group){return group.getId();});
    }

    /**
     * Returns number of dimensions in the given axis
     *
     * @param axisId
     */
    function getDimensionsCount(axisId) {
        return axes.get(axisId).model.length();
    }

    /**
     * Pivot axes.
     */
    function pivot() {
        // Swap axes
        reInitialize(columns(), rows());
    }

    ///////////////////////////////////
    //  Events & DnD initialization
    ///////////////////////////////////

    displayManagerHandlersMap = {
        "addLevel" : function(level) {
            if (level.isMeasure) {
                displayManagerElement.fire("dm:addMeasureTo" + level.axisName, {
                    dimension : level.groupId,
                    level : level.name,
                    index : level.groupPos,
                    measureIndex : level.levelPos
                });
            } else {
                displayManagerElement.fire(decideAddEventName(level.axisName, level.groupExists), {
                    //fix for bug 23370, encode each fieldname on client and decode on server
                    dimension : escape(level.groupId),
                    level : level.name,
                    index : level.groupPos
                });
            }
        },
        "addMeasures" : function(levelIds, levelMeta) {
            displayManagerElement.fire("dm:addMeasureTo" + levelMeta.axisName, {
                dimension : levelMeta.groupId,
                level : levelIds.join(','), // Add comma-separated list of measure ids
                index : levelMeta.groupPos,
                measureIndex : levelMeta.levelPos
            });
        },
        "addDimension" : function(dimensionIds, groupMeta) {
            displayManagerElement.fire("dm:addLevelTo" + groupMeta.axisName + "WithDimension", {
                //fix for bug 23370, encode each fieldname on client and decode on server
                dimension : dimensionIds.first() ? dimensionIds.map(function(dimension){
                    return escape(dimension)
                }).join(",") : escape(groupMeta.groupId),
                level : null,
                index : groupMeta.groupPos
            });
        },
        "moveDimension" : function(axis, moveGroup, pos) {
            displayManagerElement.fire('dm:moveDimension', {
                dimension : moveGroup.getId(),
                axis : axis.name,
                index : pos
            });
        },
        "reorderMeasure" : function(from, to) {
            if (Object.isNumber(from) && Object.isNumber(to)) {
                displayManagerElement.fire('dm:moveMeasure', {from : from, to : to});
            }
        },
        "removeLevel" : function(level, pos, axisName) {
            if (level.isMeasure) {
                displayManagerElement.fire('dm:removeMeasure', { index :  pos});
            } else {
                displayManagerElement.fire('dm:removeFrom' + axisName, { level : level.name, dimension : level.groupId });
            }
        }
    };

    function fireDisplayManagerEvent(eventName) {
        // Prevent firing event when given argument null
        if (arguments.length === 2 && arguments[1] === null) return;
        displayManagerHandlersMap[eventName].apply(null, $A(arguments).slice(1));
    }

    function initDragDropActions() {
            columnsElement && initAxisDragDrop(columnsElement);
            rowsElement && initAxisDragDrop(rowsElement);
            initMeasuresDragDrop();
    }

    function initAxisDragDrop(element) {
        createSortable(element);
    }

    function initMeasuresDragDrop() {
        var measuresGroup = DisplayManagerRenderer.getLevelGroup(columnsElement, MEASURE_GROUP_DEFAULT_ID) ||
                DisplayManagerRenderer.getLevelGroup(rowsElement, MEASURE_GROUP_DEFAULT_ID);
        if (!measuresGroup) return;
        createMeasuresSortable(measuresGroup.select('ul')[0]);
    }

    function createMeasuresSortable(measuresList) {
        // Remove Sortable if measures group is empty
        if (measuresList.select('li').length === 0) {
            Sortable.destroy(measuresList);
            return;
        }
        Sortable.create(measuresList, {
            constraint: false,
            overlap: 'horizontal',
            onEmptyHover: onEmptyHover,
            onHover: onHoverMeasures,
            handles: measuresList.select('li > a.wrap'),
            delay: (isIE() ? 200 : 0),
            onUpdate: handleMeasuresReorder
        });

        measuresList.select('li > a.wrap').each(function (el) {
            el.stopObserving('touchstart', fireContextMenu);
            el.observe('touchstart', fireContextMenu);
        });
    }

    function createSortable(element) {
        Sortable.create(element, {
            delay: (isIE() ? 200 : 0),
            constraint: false,
            overlap: 'horizontal',
            containment: [COLUMN_AXIS_ID, ROW_AXIS_ID],//.concat($('measuresTree').select('ul')),
            onHover: onHover,
            dropOnEmpty: true,
            onDrop : function(draggable) { addItemOnDrop(draggable, element); }
        });
        // Anyway, remove newly create observers for axis.
        Draggables.removeObserver(element);

        var updateHandler = axes.get(element.id).updateHandler;
        if (Object.isFunction(updateHandler)) {
            Draggables.addObserver(new AxisDragObserver(element, updateHandler));
        }

        element.select('li.dimension').each(function (el) {
            el.stopObserving('touchend', fireContextMenu);
            el.observe('touchend', fireContextMenu);
        });
    }

    function fireContextMenu(event){
        var element = event.element();
        if(DisplayManager.clicked && (DisplayManager.clicked == element.identify()) && (event.timeStamp - DisplayManager.clicktime < 700)) {
            var axisElement = element.up('ul.sortable');
            var axis = axes.get(axisElement.id);

            axis.contextMenu = true;
            document.fire(layoutModule.ELEMENT_CONTEXTMENU, {targetEvent: event, node: element});
            DisplayManager.clicked = undefined;
            return;
        }
        DisplayManager.clicked = element.identify();
        DisplayManager.clicktime = event.timeStamp;

    }

    function addItemOnDrop(dragElement, drop) {
        actionModel.hideMenu();
        var node = dragElement.node;
        if (!node) return;
        var pos = dragElement.previousSiblings().length;
        var nodes = dragElement.nodes || [node];

        addLevelOrDimension(drop.id, nodes, pos);
    }

    //////////////////////////////////
    //  Events Registration
    //////////////////////////////////
    function registerEventHandlers() {
        // Observe context menu invocations
        document.observe(layoutModule.ELEMENT_CONTEXTMENU, contextMenuHandler);

        actionModel.hideMenu();

        // Handle events for both axes - column and row.
        axes.each(function(pair) {
            var axis = pair.value;

            // Observe clicks on levels
            axis.element && axis.element.observe(isIPad() ? 'touchend' : 'click', function(event) {
                if(axis.contextMenu) {
                    axis.contextMenu = false;
                    return;
                    event.stop();
                }

                // Perform check whether click was done on remove symbol
                if (event.element().match('span.remove')) {
                    var levelAndGroup = getLevelAndGroupByElement(event.element());
                    removeLevel(axis.element.id, levelAndGroup.levelId, levelAndGroup.groupId);
                }
            });

        });
    }

    //////////////////////////////////
    //  Events Handling
    //////////////////////////////////

    function contextMenuHandler (event) {
        var matched = null;
        var node = event.memo.node;

        matched = matchAny(node, DM_ITEM_PATTERNS, true);
        if (matched) {
            var axisId = matchMeOrUp(matched, DM_AXIS_LIST_PATTERN).identify();
            var axis = axes.get(axisId);
            // Find group and level.
            var levelAndGroup = getLevelAndGroupByElement(event.memo.targetEvent.element());
            // Stop handling if clicked not on level
            if (!levelAndGroup) return;
            Event.stop(event);

            var group = axis.model.getLevelGroup(levelAndGroup.groupId);
            var level = group.get(levelAndGroup.levelId);

            var levelMeta = {
                axis : axis.name,
                axisId : axisId,
                level : level.name,
                dimension : level.groupId,
                isMeasure : !!level.isMeasure,
                index : axis.model.getLevelGroupPos(levelAndGroup.groupId),
                allLevels : group._getLevels().map(function(level) {
                    return level.name;
                })
            };
            levelMeta.levelIndex = levelMeta.allLevels.indexOf(levelMeta.level);

            displayManagerElement.fire('dm:contextMenu', Object.extend(event.memo, {
                levelMeta: levelMeta
            }));
        }
    }

    /**
     * Add level or all levels in dimension depending on node type
     *
     * @param axisId Axis to add item/s
     * @param nodes Array of Tree nodes or single node, possibly with sub-nodes
     * @param position Insertion position
     */
    function addLevelOrDimension(axisId, nodes, position) {
        var level, levels, groupMeta = null, addedLevels = [];
        nodes = Object.isArray(nodes) ? nodes : [nodes];

        if (isOlapMode) {
            // We doesn't support multiselect for OLAP, so pick first selected node
            levels = toLeavesArray(nodes[0]);
        } else {
            levels = nodes.inject([], function(levels, node) {
                return levels.concat(toLeavesArray(node));
            });
        }

        // If we are adding single level
        if (levels.length === 1) {
            level = addLevel(axisId, levels[0], position);
            fireDisplayManagerEvent("addLevel", level);
        } else {
            levels.each(function(levelNode) {
                level = addLevel(axisId, levelNode, position);
                if (!level) return;
                if (!groupMeta) {
                    groupMeta = level;
                }
                if (!level.groupExists)  {
                    position++;
                }
                addedLevels.push(level);
            });
            if (addedLevels.length === 0) {
                return;
            }
            if (isOlapMode) {
                fireDisplayManagerEvent("addDimension", [], groupMeta);
            } else {
                var levelNames = levels.map(function(l) {return l.param.id;});
                fireDisplayManagerEvent(groupMeta.isMeasure ? "addMeasures" : "addDimension", levelNames, groupMeta);
            }
        }
        // Render only if level was really added to model
        if (level) render();
    }

    /**
     * Add level to appropriate axis (row/column).
     * @param axisId Row/column axis id.
     * @param node External tree representation of level.
     * @param position Level insertion position.
     *
     * @return Level object with add operation meta info.
     */
    function addLevel(axisId, node, position) {
        // Convert from node to level;
        var level = nodeToLevel(node);
        // Do not add level if it already in DM
        if (isOlapMode && levelExists(level.name, level.groupId)) {
            return null;
        }
        // Adjust axis where to drop level if its group already exists
        if (isOlapMode || level.isMeasure) {
            axisId = findGroupAxis(level.groupId, axisId) || axisId;
        }

        var axis = axes.get(axisId);
        var axisModel = axis.model;
        var numberOfGroups = axisModel.length();
        // Add new group to the end of list if position not defined
        if (!Object.isNumber(position)) {
            position = numberOfGroups;
        }
        // Add level to DM model.
        var result = axisModel.addLevel(level, position);
        // Extend level object with add result meta data
        Object.extend(level, {
            groupExists : result.groupExists,
            groupPos : result.groupPos,
            levelPos : result.levelPos,
            axisName : axis.name.capitalize()
        });
        return level;
    }

    /**
     * Remove level from appropriate axis (row/column), re-render UI and fire event.
     * @param axisId Row/column axis id.
     * @param levelId Dimension level id.
     * @param groupId Dimension id.
     */
    function removeLevel(axisId, levelId, groupId) {
        var axis = axes.get(axisId);
        var level = axis.model.getLevel(levelId, groupId);
        // Remove level from model
        var removeMeta = axis.model.removeLevel(level);
        // If this is measure, we should additionally make it sortable
        fireDisplayManagerEvent("removeLevel", level, removeMeta.pos, axis.name.capitalize());
        render();
    }

    /**
     * Removes level by index from appropriate axis (row/column), re-render UI and fire event.
     * @param axisId Row/column axis id.
     * @param levelIndex Dimension level index.
     * @param groupId Dimension id.
     */
    function removeLevelByIndex(axisId, levelIndex, groupId) {
        var axis = axes.get(axisId);
        var level = axis.model.getLevelByIndex(levelIndex, groupId);
        // Remove level from model
        var removeMeta = axis.model.removeLevel(level);
        // If this is measure, we should additionally make it sortable
        fireDisplayManagerEvent("removeLevel", level, removeMeta.pos, axis.name.capitalize());
        render();
    }

    // Axis update Handler
    function handleGroupMove(draggable, isReorder) {
        var axisElement = draggable.element.up('ul');
        var axis = axes.get(axisElement.id);
        var groupId = draggable.element.groupId;
        // Find position of element has been dragged
        var pos = axisElement.select('li.draggable').findPosition(function(group) {
            return group.groupId === groupId;
        });

        var source = isReorder ? axis.model : axis.opposite;
        // Do not allow move items from columns if it will become empty after it.
        if (axisElement.id == ROW_AXIS_ID && isOlapMode && source.length() == 1) {
            reInitialize();
            return;
        }

        var moveGroup = source.removeGroup(groupId);
        if (!moveGroup) {
            throw "Some group move error";
        }
        axis.model.insertGroup(moveGroup, pos);

        // fire moveDimension event
        fireDisplayManagerEvent("moveDimension", axis, moveGroup, pos);
        render();
    }

    function handleMeasuresReorder(list, draggable) {
        var measureId = draggable.element.levelId;
        // find Measure Group
        var axisElement = list.up('.tokens.sortable');

        if(!axisElement) return;

        var axis = axes.get(axisElement.readAttribute('id'));
        var group = axis.model.getLevelGroup(MEASURE_GROUP_DEFAULT_ID);
        // Find new position of level with given levelId in measure group
        var newPosition = list.select('li').findPosition(function(measure) {
            return measure.levelId === measureId;
        });
        // Remove measure with given levelId from model
        var removeMeta = group.remove(measureId);
        // Add this measure to the new found position
        group.insert(removeMeta.level, newPosition);

        fireDisplayManagerEvent("reorderMeasure", removeMeta.pos, newPosition);
    }

    ////////////////////////////////
    // Util functions
    ////////////////////////////////

    /** Columns getter **/
    function columns() {
        return axes.get(COLUMN_AXIS_ID).model;
    }

    /** Rows getter */
    function rows() {
        return axes.get(ROW_AXIS_ID).model;
    }

    function canHoldIdentical() {
        return !isOlapMode;
    }
    /**
     * Remove all elements and destroy droppables.
     * @param axisElement
     */
    function clearAxisLayout(axisElement) {
        Droppables.remove(axisElement);
        axisElement.update('');
    }

    /**
     * Render axis layout
     *
     * @param axis axis metadata object containing axis model, element and other related data.
     */
    function renderAxisLayout(axis) {
        axis.model.getLevelGroups().each(function(group, groupPos) {
            group._getLevels().each(function(level, levelPos) {
                DisplayManagerRenderer.insertLevelIntoList(axis.element, level, levelPos, groupPos);
            });
        });
    }

    /**
     * Check whether level with given id in group exists
     *
     * @param levelId
     * @param groupId
     */
    function levelExists(levelId, groupId) {
        return !!(columns().findLevelByName(levelId, groupId) || rows().findLevelByName(levelId, groupId));
    }

    /**
     * Recursively traverse tree and retrieve all leaves.
     *
     * @param node initial parent node.
     * @param arr array where to put found leaves.
     */
    function toLeavesArray(node, arr) {
        var array = arr || [];
        if (!node.childs || node.childs.length === 0) {
            array.push(node);
            return  array;
        }
        for (var i = 0; i < node.childs.length; i++) {
            toLeavesArray(node.childs[i], array);
        }
        return array;
    }

    /**
     * Search for axis where group with given id could be.
     * If axisId param is present, then make search in that axis first.
     *
     * @param groupId
     */
    function findGroupAxis(groupId, axisId) {
        // Select suggested axis for search
        var axis = axes.get(axisId);
        // Determine opposite axis element id
        var oppositeAxisId = (axisId === COLUMN_AXIS_ID) ? ROW_AXIS_ID : COLUMN_AXIS_ID;

        // Make search first of all in proposed (or default) axis
        return axis.model.getLevelGroup(groupId) ? axis.element.id :
                // And if nothing found there, then trying to search in opposite axis
                (axis.opposite.getLevelGroup(groupId) ? oppositeAxisId : null);
    }

    /**
     * Retrieve level and group objects by given element inside level LI tag.
     *
     * @param element Some element inside LI representing level.
     */
    function getLevelAndGroupByElement(element) {
        var levelElement = element.up('li');
        var groupElement = levelElement.up('li');
        return (levelElement && groupElement) ? {
            levelId : levelElement.levelId,
            groupId : groupElement.groupId
        } : null;
    }

    /**
     * Performs conversion from tree node to level.
     *
     * @param node Tree node.
     */
    function nodeToLevel(node) {
        var levelInfo = node.param.extra;
        return {
            id : createUniqueId(levelInfo.id, levelInfo.dimensionId), // Only for internal usage
            name : levelInfo.id,
            groupId : levelInfo.dimensionId,
            label : node.name,
            // TODO Do we need visible param?
            visible : true,
            depth : levelInfo.depth,
            isMeasure : levelInfo.isMeasure
        };
    }

    /**
     * Create add event name that should be fired.
     *
     * @param axisName
     * @param groupExists
     */
    function decideAddEventName(axisName, groupExists) {
        var prefix = !groupExists ? "Level" : "";
        var suffix = !groupExists ? "WithDimension" : "";
        return "dm:add#{prefix}To#{axis}#{suffix}".
                interpolate({prefix : prefix, axis : axisName, suffix : suffix});
    }

    /**
     * Converts external DM axis state representation to LevelGroup array.
     *
     * @param json
     */
    function toAxisModel(json) {
        var groups = [];
        for (var groupIndex = 0; groupIndex < json.length; groupIndex++) {
            var jsonGroup = json[groupIndex];
            var groupId = jsonGroup.name;
            var group = new LevelGroup(groupId);
            // Collect all levels from group.
            for (var levelIndex = 0; levelIndex < jsonGroup.levels.length; levelIndex++) {
                var jsonLevel = jsonGroup.levels[levelIndex];
                // Skip level if it's invisible or is a second or next recursive level
                if (!jsonLevel.visible || jsonLevel.recursiveLevelNumber > 0) continue;

                if (jsonLevel.members && jsonLevel.members.length > 0) {
                    for (var memberIndex = 0; memberIndex < jsonLevel.members.length; memberIndex++) {
                        var jsonMember = jsonLevel.members[memberIndex];
                        // Skip All Spacers
                        if (jsonMember.isSpacer === true) continue;
                        var label = (jsonMember.fieldDisplay ? jsonMember.fieldDisplay : jsonMember.name) +
                            (jsonMember.aggregateColumnName && jsonMember['function'] !== "Sum" ?
                                " (#{aggregation})".interpolate({aggregation : jsonMember.functionOrDefault}) : "");
                        group.add({
                            id : createUniqueId(jsonMember.name, groupId), // Used only for internal usage
                            name : jsonMember.name, // Name is used for interaction with external subsystems
                            groupId : groupId,
                            label : label,
                            depth : memberIndex,
                            isMeasure : true
                        });
                    }
                } else {
                    group.add({
                        id : createUniqueId(jsonLevel.name, groupId), // Used only for internal usage
                        name : jsonLevel.name, // Name is used for interaction with external subsystems
                        groupId : groupId,
                        label : jsonLevel.display ? jsonLevel.display : jsonLevel.name,
                        depth : jsonLevel.depth
                    });
                }
            }
            groups.push(group);
        }
        return groups;
    }

    function createUniqueId(name, groupId) {
        var levelIdMap = uniqueIdentifiersMap.get(groupId);
        if (!Object.isHash(levelIdMap)) {
            levelIdMap = $H({});
            uniqueIdentifiersMap.set(groupId, levelIdMap);
        }
        var index = levelIdMap.get(name);
        levelIdMap.set(name, Object.isNumber(index) ? ++index : (index = 0));
        return name + "_" + index;
    }

    function isRowDisabled() {
        // Check Row axis disable state depending on presence of levels in column and crosstab mode
        return (columns().length() === 0) && isOlapMode;
    }

    function adjustAlternatingAndRowDisabling() {
        // Update row axis disabling
        DisplayManagerRenderer.updateAxisDisabling($('rows'), isRowDisabled());
        DisplayManagerRenderer.updateAlternating([columnsElement, rowsElement]);
    }

    ////////////////////////////////////
    // DnD Core Event Handlers
    ////////////////////////////////////
    function onEmptyHover(element, dropon, overlap){
    	if(!Element.isParent(dropon, element)) {
            if((axes.get('olap_columns').model.length() == 0 && dropon.id == 'olap_columns') || (axes.get('olap_rows').model.length() == 0 && dropon.id == 'olap_rows')){
                Sortable.onEmptyHover(element, dropon, overlap);
            }
        }
    }

    function onHoverMeasures(element, dropon, overlap) {
        if (Element.isParent(dropon, element) || element.hasClassName("dialog")) return;
        
        if(element.id.indexOf(adhocDesigner.MEASURES) === 0) {
        	Sortable.onHover(element, dropon, overlap);
        }
    }
    
    function onHover(element, dropon, overlap) {
        // TODO: Remove this HACK for handling Dialog class checking!
        if (Element.isParent(dropon, element) || element.hasClassName("dialog")) return;

        if (overlap > 0.33 && overlap < 0.66 && Sortable.options(dropon).tree) {
            return;
        } else if (overlap > 0.5) {
            Sortable.mark(dropon, 'before');
            if (dropon.previousSibling != element) {
                element.style.visibility = "hidden"; // fix gecko rendering
                dropon.parentNode.insertBefore(element, dropon);
                Sortable.options(dropon.parentNode).onChange(element);
            }
        } else {
            Sortable.mark(dropon, 'after');
            var nextElement = dropon.nextSibling || null;
            if (nextElement != element) {
                element.style.visibility = "hidden"; // fix gecko rendering
                dropon.parentNode.insertBefore(element, nextElement);
                Sortable.options(dropon.parentNode).onChange(element);
            }
        }
    }

    return {
        addLevelToColumn : addLevelToColumn,
        removeLevelFromColumn : removeLevelFromColumn,
        removeLevelFromColumnByIndex : removeLevelFromColumnByIndex,
        addLevelToRow : addLevelToRow,
        removeLevelFromRow : removeLevelFromRow,
        removeLevelFromRowByIndex : removeLevelFromRowByIndex,
        getLevelsFromDimension : getLevelsFromDimension,
        getDimensions : getDimensions,
        getDimensionsCount : getDimensionsCount,
        reInitialize : initializeFromState,
        pivot : pivot,
        contextMenuHandler : contextMenuHandler
    };
};

///////////////////////////////////
//  Display Manager Drag Observer
///////////////////////////////////
var AxisDragObserver = Class.create({
    initialize: function(element, observer) {
        this.element = $(element);
        this.observer = observer;
        this.axes = ['olap_rows', 'olap_columns'];
    },

    onStart: function(eventName, draggable) {
        this.axis = this.getAxis(draggable);
        if(isIE()) {
            this.changedElement = draggable.element;
            if (this.changedElement) {
                this.changedElement.setStyle({ display: "inline-block" });
                this.changedElement.hasClassName('measure') && this.changedElement.setStyle({ padding: "0px" });
            }
        }
    },

    onEnd: function(eventName, draggable) {
        // If move started not from axis, but from tree, for example
        if (!this.axis) return;

        // Return, if drop place is not an axis.
        var destinationAxis = this.getAxis(draggable);
        if (!destinationAxis || !this.axes.include(destinationAxis.id)) return;

        Sortable.unmark();
        var isReorder = this.axis.id === destinationAxis.id;
        this.observer(draggable, isReorder);
        if (isIE() && this.changedElement) {
            this.changedElement.style.removeAttribute("display");
            this.changedElement.style.removeAttribute("padding");
        }
    },

    getAxis : function(draggable) {
        return draggable.element.up('ul');
    }
});

var SortableObserver = Class.create({
  initialize: function(element, observer) {
    this.element   = $(element);
    this.observer  = observer;
    this.lastValue = Sortable.serialize(this.element);
  },

  onStart: function() {
    this.lastValue = Sortable.serialize(this.element);
  },

  onEnd: function(eventName, draggable) {
    Sortable.unmark();
    if(this.lastValue != Sortable.serialize(this.element))
      this.observer(this.element, draggable);
  }
});

////////////////////////////////////
//  Display Manager DOM Renderer
////////////////////////////////////
var DisplayManagerRenderer = {
    DOUBLE_QUOTES : /"/g,
    findListItemWithGivenProperty : function(parentEl, key, value) {
        return parentEl.select('li').find(function(li) {
            return li[key] === value;
        });
    },

    getLevelGroup : function(list, groupId) {
        return this.findListItemWithGivenProperty(list, 'groupId', groupId);
    },

    createLevel : function(id, title, name, isMeasure) {
        // TODO : move markup to jsp
        var levelClass = isMeasure ? "member" : "level";
        var zindex = isMeasure ? "style='z-index: 800;'" : "";
        var s = "<li class='" + levelClass + " button' " + zindex +" >";
        s += "<a href='#' class='wrap' title=\""+ title.escapeHTML().replace(this.DOUBLE_QUOTES, '&quot;') +"\">" + name.escapeHTML() + "</a>";
        s += "<span class='icon remove'></span></li>";

        // Create DOM Element
        var level = (new Element("DIV")).update(s).children[0];
        level.levelId = id;

        return level;
    },

    createLevelGroup : function(id, title, name, isMeasure, level) {
        // TODO : move markup to jsp
        var liClass = isMeasure ? 'measure' : 'dimension';
        var ulClass = isMeasure ? 'members' : 'levels';
        var group = "<li class=\""+ liClass +" draggable\">" +
                (isMeasure ? "<span class='handle'>&nbsp;</span>" : "") +
                "<span class='title'>" + title.escapeHTML() + "</span>" +
                "<ul class=\""+ ulClass + "\"></ul>" +
                "</li>";

        // Create DOM Element
        group = $((new Element("DIV")).update(group).children[0]);
        group.groupId = id;
        // Update group with given level if exists
        if (level) group.select('ul')[0].update(level);
        return group;
    },

    insertLevelIntoGroup : function(group, levelElement, pos) {
        this.insertElementOnPosition(group.select('ul')[0], levelElement, pos);
        return group;
    },

    insertLevelIntoList : function(list, level, levelPos, groupPos) {
        list = $(list);
        var groupId = level.groupId;
        var group = this.getLevelGroup(list, groupId);
        var levelElement = this.createLevel(level.id, level.label, level.label, level.isMeasure);
        if (!group) {
            group = this.createLevelGroup(groupId, groupId, groupId,
                    level.isMeasure, levelElement);
            this.insertElementOnPosition(list, group, groupPos);
            this.generateIndexes(list.select('li.draggable'), list.id);
        }
        this.insertLevelIntoGroup(group, levelElement, levelPos);
        // TODO: add i18n support
        this.generateIndexes(group.select('li'), level.groupId.strip().replace(/[\s_]+/g, '-'));
        return levelElement;
    },

    generateIndexes : function(elements, groupId) {
        elements.each(function(element, index) {
            element.writeAttribute('id', groupId + '_' + index);
        });
    },

    updateAlternating : function(axes) {
        axes.each(function(axis) {
            $(axis).select('li.draggable').each(function(group, index) {
                var isOdd = (index % 2 !== 0);
                group[isOdd ? 'addClassName' : 'removeClassName']('odd');
            });
        });
    },

    removeLevelFromList : function(list, levelId, groupId) {
        list = $(list);
        var group = this.getLevelGroup(list, groupId);
        var levelToRemove = this.findListItemWithGivenProperty(group, 'levelId', levelId);
        levelToRemove && levelToRemove.remove();
        if (group.select('li').length === 0) {
            var parent = group.up();
            group.remove();

            // Fix for bug http://bugzilla.jaspersoft.com/show_bug.cgi?id=23093
            if (isWebKitEngine()) {
                var position = parent.getStyle("position");
                parent.setStyle({ "position": null });
                setTimeout(function() {
                    parent.setStyle({ "position": position });
                }, 500);
            }
        }
        return group;
    },

    insertElementOnPosition : function(parent, el, pos) {
        var children = parent.immediateDescendants();
        if (children.length === 0) {
            parent.update(el);
        } else {
        	if(pos > children.length) pos = children.length; 
        	var ch = (pos === 0) ? children[0] : children[pos-1];
        	if(ch){
                (pos === 0) ? ch.insert({before : el}) : ch.insert({after : el});	
        	}
        }
    },

    updateAxisDisabling : function(axis, isDisabled) {
        $(axis)[isDisabled ? 'addClassName' : 'removeClassName'](layoutModule.DISABLED_CLASS);
    }

};

/**
 * Abstraction over object that should control
 * state of the list with levels and measures
 */
var DisplayManagerList = function() {
    var levelGroups = arguments && Object.isArray(arguments[0]) ? arguments[0] : [];
    var canHoldIdentical = arguments[1] || false;

    /**
     * Retrieve all level groups.
     */
    function getLevelGroups() {
        return levelGroups;
    }

    /**
     * Retrieve LevelGroup by a given groupId.
     *
     * @param groupId
     */
    function getLevelGroup(groupId) {
        return levelGroups.find(function(group) {
            return group.getId() === groupId;
        });
    }

    /**
     * Returns position of group with given id.
     *
     * @param groupId
     */
    function getLevelGroupPos(groupId) {
        return levelGroups.findPosition(function(group) {
            return group.getId() === groupId;
        });
    }

    /**
     * Retrieve level by a given levelId and groupId.
     *
     * @param levelId
     * @param groupId
     * @deprecated
     */
    function getLevel(levelId, groupId) {
        var group = getLevelGroup(groupId);
        return group && group.get(levelId);
    }

    /**
     * Retrieves level by a given index and groupId.
     *
     * @param levelIndex
     * @param groupId
     */
    function getLevelByIndex(levelIndex, groupId) {
        var group = getLevelGroup(groupId);
        return group && group.getByIndex(levelIndex);
    }

    /**
     * Add level to the appropriate LevelGroup
     *
     * @param level Level to add. Should contain groupId, where to put it.
     * @param pos Group position
     */
    function addLevel(level, pos) {
        var groupId = level.groupId;
        var group = (canHoldIdentical && !level.isMeasure) ? null : getLevelGroup(groupId);
        var groupExists = !!group;
        if (!groupExists) {
            group = new LevelGroup(groupId);
            insertGroup(group, pos);
        }
        var levelPos = group.add(level);
        return {
            levelPos : levelPos,
            groupPos : pos,
            groupExists : groupExists
        };
    }

    /**
     * Remove level from the appropriate LevelGroup in the list
     *
     * @param level Level to delete. Should contain groupId where it belongs to.
     * @return Remove meta information (level and its position)
     */
    function removeLevel(level) {
        var groupId = (arguments.length === 2) ? arguments[0] : level.groupId;
        var levelId = (arguments.length === 2) ? arguments[1] : level.id;
        var group = getLevelGroup(groupId);
        if (!group) return null;
        var removeMeta = group.remove(levelId);
        if (group.length() === 0) {
            removeGroup(group.getId());
        }
        return removeMeta;
    }

    /**
     * Insert group into given position.
     *
     * @param group Group to insert.
     * @param pos Position where to insert new group.
     */
    function insertGroup(group, pos) {
        if (Object.isNumber(pos)) {
            levelGroups.splice(pos, 0, group);
        } else {
            levelGroups.push(group);
        }
    }
    /**
     * Remove LevelGroup from the Display Manager List.
     *
     * @param groupId
     */
    function removeGroup(groupId) {
        var pos = findGroupIndex(groupId);
        return (pos !== null) ? levelGroups.splice(pos, 1)[0] : null;
    }

    function length() {
        return levelGroups.length;
    }

    /**
     * Find level by the external name.
     *
     * @param levelName
     * @param groupId
     */
    function findLevelByName(levelName, groupId) {
        var group = getLevelGroup(groupId);
        return group && group.find(function(l) {
            return l.name === levelName;
        });
    }

    // Helper functions
    /**
     * Searches for group index by a given groupId.
     *
     * @param groupId
     */
    function findGroupIndex(groupId) {
        return levelGroups.findPosition(function(g) {
            return g.getId() === groupId;
        });
    }

    return {
        getLevelGroups : getLevelGroups,
        getLevelGroup : getLevelGroup,
        getLevelGroupPos : getLevelGroupPos,
        getLevel : getLevel,
        getLevelByIndex : getLevelByIndex,
        addLevel : addLevel,
        insertGroup : insertGroup,
        removeLevel : removeLevel,
        removeGroup : removeGroup,
        findLevelByName : findLevelByName,
        length : length
    };

};

/**
 * List that contains levels from the same dimension
 */
var LevelGroup = function(groupId) {
    // Array of Levels
    var levels = [];

    /**
     * Get Level Group identifier.
     */
    function getId() {
        return groupId;
    }

    /**
     * Retrieve level with a given id.
     *
     * @param id Identifier of the level.
     */
    function get(id) {
        return Object.isNumber(id) ? getByIndex(id) : findLevelByCriteria(function(l) {
            return l.id === id;
        });
    }

    /**
     * Returns levels array.
     *
     * Caution: This method should be used <b>only</b> in tests!
     */
    function _getLevels() {
        return levels;
    }

    /**
     * Retrieve level by given index.
     *
     * @param index Index of the level.
     */
    function getByIndex(index) {
        return index < levels.length ? levels[index] : undefined;
    }

    /**
     * Add level to the end.
     *
     * @param level Level to add
     */
    function add(level) {
        // Find position where to insert
        var pos = levels.findPosition(function(l) {
            return l.depth >= level.depth;
        });
        // If position not found
        if (pos === null) {
            // Push to end of array
            levels.push(level);
            pos = levels.length - 1;
        } else {
            // Insert before found element
            levels.splice(pos, 0, level);
        }
        return pos;
    }

    /**
     * Insert level into a given position.
     *
     * @param level Level to insert.
     * @param pos Position where to insert new level.
     */
    function insert(level, pos) {
        if (Object.isNumber(pos)) {
            levels.splice(pos, 0, level);
        } else {
            levels.push(level);
        }
    }

    /**
     * Remove level from the group
     *
     * @param levelId Level identifier
     */
    function remove(levelId) {
        var pos = Object.isNumber(levelId) ? levelId : findLevelPos(levelId);
        var level = removeAt(pos);
        return {
            level : level,
            pos : pos
        };
    }

    /**
     * Remove level at the given position.
     *
     * @param pos Position to remove level.
     */
    function removeAt(pos) {
        var level = levels[pos];
        levels.splice(pos, 1);
        return level;
    }

    /**
     * Returns the number of levels in the group.
     */
    function length()  {
        return levels.length;
    }

    /**
     * Searches position of the given level.
     *
     * @param levelId Level identifier
     */
    function findLevelPos(levelId) {
        return levels.findPosition(function(l) {
            return l.id === levelId;
        });
    }

    //////////////////
    //  Helpers
    //////////////////

    /**
     * Search for level by the given criteria function.
     *
     * @param criteriaFunction
     */
    function findLevelByCriteria(criteriaFunction) {
        return Object.isFunction(criteriaFunction) ? levels.find(criteriaFunction) : undefined;
    }

    return {
        getId : getId,
        _getLevels : _getLevels,
        get : get,
        getByIndex : getByIndex,
        add : add,
        insert : insert,
        remove : remove,
        length : length,
        find : findLevelByCriteria
    };
};

////////////////////////////////////
// Prototype Extensions
////////////////////////////////////

(function() {
    /**
     * Search position of the element in Array. Returns null if pos wasn't found.
     *
     * @param iterator
     * @param context
     */
    function findPosition(iterator, context) {
        var pos = null;
        this.each(function(value, index) {
            if (iterator.call(context, value, index)) {
                pos = index;
                throw $break;
            }
        });
        return pos;
    }

    Object.extend(Array.prototype, {
        findPosition : findPosition
    });
})();

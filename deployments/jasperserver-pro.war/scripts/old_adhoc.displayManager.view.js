/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

var DisplayLayoutView = Backbone.View.extend({
    DM_ITEM_PATTERNS : ['li.level.button', 'li.member.button'],
    DM_AXIS_LIST_PATTERN : 'ul.tokens.sortable',
    axes : {},
    isOlapMode : true,

    initialize : function(options) {
        if (!options) return this;

        // Constants initialization
        this.MEASURE_GROUP_DEFAULT_ID = options.measuresGroupId || this.MEASURE_GROUP_DEFAULT_ID;

        this.setAxes(options.axes);
        this.render();
        this.initializeListeners();
    },

    setAxes : function(axes) {
        var ids = _(axes).keys(), axesParams = [];
        _.each(axes, function(axis) {
            axesParams.push({
                collection : new Axis(this.toAxisModel(axis.model), {name : axis.name}),
                isDependent : axis.isDependent,
                measuresGroupId : this.MEASURE_GROUP_DEFAULT_ID,
                isOlapMode : this.isOlapMode
            });
        }, this);
        _.each(axesParams, function(param, index) {
            param.el = jQuery("#" + ids[index]).get(0);
            param.opposite = axesParams[(index + 1) % axesParams.length].collection;
            this.axes[ids[index]] = new AxisView(param);
        }, this);
    },

    render : function() {
        _.each(this.axes, function(axis) {
            axis.render();
        });
        Draggables.removeObserver(this.el);
        Draggables.addObserver(new AxisDragObserver1(this.el, _.bind(this.handleGroupMove, this)));
    },

    getDimensions : function(axisId) {
        return this.axes[axisId].collection.pluck('groupId');
    },

    getDimensionsCount : function(axisId) {
        return this.axes[axisId].collection.size();
    },

    getLevelsFromDimension : function(groupId, axisId) {
        // Search group in the given axis, if axis is not given then perform search in columns and rows.
        var group = (axisId) ?
                this.axes[axisId].collection.getLevelGroup(groupId) :
                _.any(this.axes, function(axis) { return axis.collection.getLevelGroup(groupId) });

        return group && group.levels.pluck('name');
    },

    initializeListeners : function() {
        document.observe(layoutModule.ELEMENT_CONTEXTMENU, _.bind(this.contextMenuHandler, this));
        // Attach Axis event handlers
        _.each(this.axes, function(axis) {
            _.each(this.actionHandlersMap, function(value, id) {
                axis.bind(id, this.actionHandlersMap[id], this);
            }, this);
        }, this);
    },

    actionHandlersMap : {
        "addLevel" : function(group, axis, options) {
            $(this.el).fire(this.decideAddEventName(axis.name.capitalize(), options.groupExists), {
                dimension : group.groupId,
                level : options.level.get('name'),
                index : axis.getGroupPos(group.groupId)
            });
        },
        "addMeasure" : function(group, axis, options) {
            $(this.el).fire("dm:addMeasureTo" + axis.name.capitalize(), {
                dimension : group.groupId,
                level : options.level.get('name'),
                index : axis.getGroupPos(group.groupId),
                measureIndex : group.findPos(options.level.id)
            });
        },
        "addMeasures" : function(levelIds, levelMeta) {
            $(this.el).fire("dm:addMeasureTo" + levelMeta.axisName, {
                dimension : levelMeta.groupId,
                level : levelIds.join(','), // Add comma-separated list of measure ids
                index : levelMeta.groupPos,
                measureIndex : levelMeta.levelPos
            });
        },
        "addDimension" : function(dimensionIds, groupMeta) {
            $(this.el).fire("dm:addLevelTo" + groupMeta.axisName + "WithDimension", {
                dimension : dimensionIds.first() ? dimensionIds.join(",") : groupMeta.groupId,
                level : null,
                index : groupMeta.groupPos
            });
        },
        "moveDimension" : function(axis, moveGroup, pos) {
            $(this.el).fire('dm:moveDimension', {
                dimension : moveGroup.groupId,
                axis : axis.name,
                index : pos
            });
        },
        "reorderMeasure" : function(group, options) {
            $(this.el).fire('dm:moveMeasure', options);
        },
        "removeLevel" : function(level, axis) {
            $(this.el).fire('dm:removeFrom' + axis.name.capitalize(),
                { level : level.get('name'), dimension : level.get('groupId') });
        },
        "removeMeasure" : function(level, axis, options) {
            $(this.el).fire('dm:removeMeasure', { index :  options.pos});
        }
    },

    contextMenuHandler : function(event) {
        // TODO: jQuery!
        var matched = matchAny(event.memo.node, this.DM_ITEM_PATTERNS, true);

        if (!matched) return;
        // TODO: jQuery!
        var axisId = matchMeOrUp(matched, this.DM_AXIS_LIST_PATTERN).identify();
        var axis = this.axes[axisId].collection;
        var level = jQuery(matched).data('level');

        if (!level) return;

        Event.stop(event);

        var group = axis.getLevelGroup(level.groupId);
        $(this.el).fire('dm:contextMenu', Object.extend(event.memo, {
            levelMeta: {
                axis : axis.name,
                axisId : axisId,
                level : level.name,
                levelIndex : group.levels.indexOf(group.getLevel(level.id)),
                dimension : level.groupId,
                isMeasure : level.isMeasure,
                index : axis.indexOf(group),
                allLevels : group.levels.pluck('name')
            }
        }));
    },

    handleGroupMove : function(draggable, isReorder) {
        var axisElement = jQuery(draggable.element).parents('ul'),
        dragEl = jQuery(draggable.element),
        axis = this.axes[axisElement.attr('id')],
        groupId = dragEl.data('groupId'),
        pos = dragEl.prevAll().length,
        source = axis[isReorder ? 'collection' : 'opposite'],
        moveGroup = source.getLevelGroup(groupId);

        // Do not allow move items from columns if it will become empty after it.
        if (axis.isDependent && source.length == 1) {
            this.render();
            return;
        }

        source.removeGroup(groupId);
        axis.collection.insertGroup(moveGroup, pos, {silent : true});

        // fire moveDimension event
        this.actionHandlersMap["moveDimension"].call(this, axis.collection, moveGroup, pos);
    },

    /////////////////////////////
    // Helper Methods
    /////////////////////////////
    decideAddEventName : function(axisName, groupExists) {
        var prefix = !groupExists ? "Level" : "";
        var suffix = !groupExists ? "WithDimension" : "";
        return "dm:add" + prefix + "To" + axisName + suffix;
    },

    toAxisModel : function(json) {
        var groups = [];
        for (var groupIndex = 0; groupIndex < json.length; groupIndex++) {
            var jsonGroup = json[groupIndex],
            groupId = jsonGroup.name,
            group = new Group({groupId : groupId});

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

                        group.add({
                            id : _.uniqueId(jsonMember.name + "_"),
                            // Name is used for interaction with external subsystems
                            name : jsonMember.name,
                            groupId : groupId,
                            label : jsonMember.fieldDisplay ? jsonMember.fieldDisplay : jsonMember.name,
                            depth : memberIndex,
                            isMeasure : true
                        });
                    }
                } else {
                    group.add({
                        id : _.uniqueId(jsonLevel.name + "_"),
                        // Name is used for interaction with external subsystems
                        name : jsonLevel.name,
                        groupId : groupId,
                        label : jsonLevel.display ? jsonLevel.display : jsonLevel.name,
                        depth : jsonLevel.depth,
                        isMeasure : false
                    });
                }
            }
            groups.push(group);
        }
        return groups;
    }
});

var AxisView = Backbone.View.extend({
    levelTmpl : _.template("<li class='<%=levelClass%> button' style='<%=zindex%>' >" +
        "<a href='#' class='wrap' title=\"<%- title%>\"><%- name%></a>" +
        "<span class='icon remove'></span></li>"),

    groupTmpl : _.template("<li class=\"<%=liClass%> draggable\">" +
        "<%=measureHandle%>" +
        "<span class='title'><%-title%></span>" +
        "<ul class=\"<%=ulClass%>\"></ul>" +
        "</li>"),

    events : {
        'click span.remove' : "removeLevel"
    },

    initialize : function(options) {
        if (!this.collection) {
            this.collection = new Axis();
        }
        this.opposite = options ? options.opposite : null;
        this.measuresGroupId = options && options.measuresGroupId;
        this.name = options && options.name;
        this.isDependent = options ? !!options.isDependent : false;
        this.isOlapMode = options ? options.isOlapMode : false;

        _.bindAll(this, 'removeLevel', 'onDrop', 'reorderMeasures');

        this.initializeListeners();
    },

    render : function() {
        jQuery(this.el).html("");
        this.collection.each(function(group, groupPos) {
            group.levels.each(function(level, levelPos) {
                this.insertLevelIntoList(this.el, level.toJSON(), levelPos, groupPos);
            }, this);
        }, this);
        this.createSortable();
        this.createMeasuresSortable();
        this.updateAxisDisabling(this.isDisabled());
    },

    initializeListeners : function() {
        this.collection.bind('all', function(eventName) {
            var h = this.actionHandlersMap[eventName], args = Array.prototype.slice.call(arguments, 1);
            h ? h.apply(this, args) : this.trigger.apply(this, arguments);
            this.render();
        }, this);
    },

    actionHandlersMap : {
        // TODO: re-implement using more general approach like was done for Level add
        'remove' : function(group, axis, options) {
            var level = options.args[0];
            this.trigger(level.get('isMeasure') ? 'removeMeasure' : 'removeLevel', level, axis, options);
        }
    },

    //////////////////////////////
    // Event Handlers
    //////////////////////////////
    /**
     * Add level or all levels in dimension depending on node type
     *
     * @param nodes Array of Tree nodes or single node, possibly with sub-nodes
     * @param position Insertion position
     */
    addLevelOrDimension : function(nodes, position) {
        var levels;
        nodes = _.isArray(nodes) ? nodes : [nodes];

        if (this.isOlapMode) {
            // We doesn't support multiselect for OLAP, so pick first selected node
            levels = this.toLeavesArray(nodes[0]);
        } else {
            levels = _.inject(nodes, function(levels, node) {
                return levels.concat(this.toLeavesArray(node));
            }, [], this);
        }

        // If we are adding single level
        if (levels.length === 1) {
            this.addLevel(levels[0], position);
        } else {
            this.addLevels(levels, position);
        }
    },

    addLevel : function(node, position) {
        var axis = this.collection, level = this.nodeToLevel(node);
        // Adjust axis where to drop level if its group already exists
        if (this.isOlapMode || level.isMeasure) {
            axis = (this.collection.getLevelGroup(level.groupId) && this.collection) ||
                (this.opposite.getLevelGroup(level.groupId) && this.opposite) || this.collection;
        }

        // Do not add level if it already in DM
        if (this.isOlapMode && this.levelExists(level.name, level.groupId, axis)) {
            return null;
        }

        // Add new group to the end of list if position not defined
        if (!_.isNumber(position) || position > axis.size()) {
            position = axis.size();
        }
        axis.addLevel(level, position);
    },

    addLevels : function(levelNodes, dropPos) {
        _.each(levelNodes, function(levelNode) {
            this.addLevel(levelNode, dropPos);
        }, this);
    },

    removeLevel : function(e) {
        var level = jQuery(e.target).parent('li').data('level');
        this.collection.removeLevel(level);
    },

    onDrop : function(draggable) {
        var node = draggable.node;

        actionModel.hideMenu();

        if (!node) return;

        var pos = jQuery(draggable).prevAll().length;
        var nodes = draggable.nodes || [node];

        window.console && console.log(this.el.id + "pos : " + pos);
        this.addLevelOrDimension(nodes, pos);
    },

    reorderMeasures : function(list, draggable) {
        var measureEl = jQuery(draggable.element),
        measure = measureEl.data('level'),
        group = this.collection.getLevelGroup(measure.groupId),
        newPosition = measureEl.prevAll().length;

        group.reorder(measure.id, newPosition);
    },

    /////////////////////////////
    // Drag'n'Drop
    /////////////////////////////
    createSortable : function() {
        var element = this.el;
        Sortable.create(element, {
            delay: (isIE() ? 200 : 0),
            constraint: false,
            overlap: 'horizontal',
            containment: ['olap_columns', 'olap_rows'],
//            onHover: this.onHover,
            dropOnEmpty: true,
            onDrop : this.onDrop
        });
        // Anyway, remove newly create observers for axis.
        Draggables.removeObserver(element);
    },

    createMeasuresSortable : function() {
        var measureGroup = jQuery(this.getGroupElement(this.el, this.measuresGroupId));
        if (measureGroup.length === 0) return;

        measureGroup = measureGroup.find('ul').first();
        // Remove Sortable if measures group is empty
        if (measureGroup.find('li').length === 0) {
            Sortable.destroy(measureGroup[0]);
            return;
        }
        Sortable.create(measureGroup[0], {
            delay: (isIE() ? 200 : 0),
            constraint: false,
            overlap: 'horizontal',
//            onHover: onHoverMeasures,
//            onEmptyHover: onEmptyHover,
//            handles: measureGroup.find('li > div.wrap').toArray(),
            onUpdate: this.reorderMeasures
        });
    },

    /////////////////////////////
    // DOM
    /////////////////////////////
    createLevel : function(level) {
        var type, levelEl = jQuery(this.levelTmpl({
            levelClass : (type = level.isMeasure ? "member" : "level"),
            zindex : "z-index: 800;",
            title : level.label,
            name : level.label
        })).attr('id', _.uniqueId(type + '_'));
        levelEl.data('level', level);
        return levelEl[0];
    },

    createLevelGroup : function(id, title, name, isMeasure) {
        var groupEl = jQuery(this.groupTmpl({
            liClass : isMeasure ? 'measure' : 'dimension',
            ulClass : isMeasure ? 'members' : 'levels',
            measureHandle : isMeasure ? "<span class='handle'>&nbsp;</span>" : "",
            title: title
        })).attr('id', _.uniqueId('group_'));
        groupEl.data('groupId', id);
        return groupEl[0];
    },

    insertLevelIntoList : function(axis, level, levelPos, groupPos) {
        var groupId = level.groupId;
        var group = this.getGroupElement(axis, groupId);
        var levelEl = this.createLevel(level);
        if (!group) {
            group = this.createLevelGroup(groupId, groupId, groupId, level.isMeasure);
            this.insertElementAt(axis, group, groupPos);
        }
        this.insertElementAt(jQuery('ul', group), levelEl, levelPos);
        return levelEl;
    },

    getGroupElement : function(axis, groupId) {
        return jQuery(axis).children('li').filter(function() {
            return jQuery(this).data('groupId') === groupId;
        }).get(0) || null;
    },

    insertElementAt : function(p, el, pos) {
        var parent = jQuery(p), element = jQuery(el),
            children = parent.children(), isFirst = (pos === 0);
        if (children.length === 0) {
            parent.append(element);
        } else {
        	element[isFirst ? 'insertBefore' : 'insertAfter'](children.get(isFirst ? 0 : pos-1));
        }
    },

    updateAxisDisabling : function(isDisabled) {
        jQuery(this.el).parents('.axis')[isDisabled ? 'addClass' : 'removeClass'](layoutModule.DISABLED_CLASS);
    },

    ///////////////////////
    //  Helper Methods
    ///////////////////////
    isDisabled : function() {
        // Check axis disable state depending on presence of levels in column and crosstab mode
        return this.isDependent && this.opposite.length === 0
    },

    levelExists : function(levelId, groupId, axis) {
        return !!axis.findLevel(groupId, function(l) {
            return l.get('name') === levelId;
        });
    },

    nodeToLevel : function(node) {
        var levelInfo = node.param.extra;
        return {
            id : _.uniqueId(levelInfo.id + '_'), // Only for internal usage
            name : levelInfo.id,
            groupId : levelInfo.dimensionId,
            label : node.name,
            // TODO Do we need visible param?
            visible : true,
            depth : levelInfo.depth,
            isMeasure : levelInfo.isMeasure
        };
    },

    /**
     * Recursively traverse tree and retrieve all leaves.
     * @param node initial parent node.
     * @param arr array where to put found leaves.
     */
    toLeavesArray : function(node, arr) {
        var array = arr || [];
        if (!node.childs || node.childs.length === 0) {
            array.push(node);
            return  array;
        }
        for (var i = 0; i < node.childs.length; i++) {
            this.toLeavesArray(node.childs[i], array);
        }
        return array;
    }

});

var AxisDragObserver1 = Class.create({
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
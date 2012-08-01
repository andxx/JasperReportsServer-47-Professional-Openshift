/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */
(function($, P, exports) {
    var modeExtensionMap = null;

    var lm = LayoutManager = function(state, options){
        this.init(state, options);
    };

    ////////////////////////////
    // Instance methods
    ////////////////////////////
    LayoutManager.fn = LayoutManager.prototype = {
        axes : {},
        template : null,

        /**
         * Initialize Layout Manager with axes metadata and current state.
         * @param state Array of axes each containing axis data itself
         *              with proper axis meta-information:
         *              <p>
         *              <code>[
         *                  {
         *                      data : {},
         *                      name : "column",
         *                      element : $('axis DOM Element'),
         *                      isDependent : true,
         *                      ...
         *                      other options
         *                  },
         *                  ...,
         *                  {}
         *              ]</code>
         * @param properties Additional Layout Manager options, like: default measure group id, layout manager mode, OLAP mode, etc
         */
        init : function(state, properties) {
            this.initProperties(properties);
            if (!this.initialized) {
                return;
            }
            this.initModeSpecificBehavior(this.mode);
            this.initAxes(state);
            this.initEventListeners();
        },

        initProperties : function(props) {
            this.measuresGroupId = props.measuresGroupId;
            this.isOlapMode = !!props.isOlapMode;
            this.mode = props.mode;
            this.element = $('#' + props.id);
            this.initialized = !!this.element[0];
        },

        initModeSpecificBehavior : function(mode) {
            _.extend(this, modeExtensionMap[mode]);
        },

        initAxes : function(axes) {
            _.each(axes, function(axis) {
                // Clone given axis and add derived props
                var a = _.clone(axis);
                a.element = $('#' + a.elementId);
                // add modified axis to map
                this.axes[a.elementId] = a;
                this.setData(a, a.data || []);
            }, this);
        },

        //////////////////////////
        // Rendering
        //////////////////////////
        getTemplate : function() {
            if (this.template === null) {
                lm.changeTemplateSettings(function() {
                    this.template = _.template($("#" + this.mode + "LayoutManagerTemplate").html());
                }, this);
            }
            return this.template;
        },

        render : function(state, isReRender) {
            if (!this.initialized) {
                return;
            }
            _.each(this.axes, function(axis) {
                if (!isReRender) {
                    this.setData(axis, this.normalizeModel(state[axis.name]));
                }
                $(axis.element).html((this.getTemplate())(axis));
                this.createSortable(axis.element[0]);
                this.createMeasuresSortable(axis.element[0]);
            }, this);
            // Reinitialize Drag observer used for moving items between axes
            Draggables.removeObserver(this.element[0]);
            Draggables.addObserver(new LayoutManagerDragObserver(this.element[0], this.onMove));
        },

        setData : function(axis, newData) {
            axis.data = newData;
            this.updateAxesDataCache && this.updateAxesDataCache();
        },

        ///////////////////////////
        // Event Handling
        ///////////////////////////
        initEventListeners : function() {
            // Bind all event handlers to current object.
            _.bindAll(this, "onContextMenu", "onRemove", "onAdd", "onMove", "onMeasureReorder");

            // TODO: jQuery!
            // We should stop observing onContextMenu old handler
            document.stopObserving(layoutModule.ELEMENT_CONTEXTMENU, lm.onContextMenu || $.noop);
            document.observe(layoutModule.ELEMENT_CONTEXTMENU, this.onContextMenu);
            lm.onContextMenu = this.onContextMenu;

            var clickEvent = isSupportsTouch()?'touchend':'mouseup';
            $(this.element).undelegate('span.remove', clickEvent);
            $(this.element).delegate('span.remove', clickEvent, this.onRemove);
        },

        onContextMenu : function(event) {
            var that = this,
                levelEl = $(event.memo.node).closest('li.button'),
                // TODO: unify table and crosstab classnames
                isMeasure = levelEl.hasClass('meazure') || levelEl.hasClass('member'),
                dimensionEl = levelEl.closest(isMeasure ? 'li.measure' : 'li.dimension');

            if (!levelEl) return;

            var axisId = $(levelEl).closest('ul.sortable').attr('id'),
                axis = this.axes[axisId];

            if (!axis) return;

            Event.stop(event);

            this.element.trigger('lm:contextMenu', _.extend(event.memo, {
                extra : {
                    axis : axis.name,
                    axisId : axisId,
                    name : levelEl.attr(this.nameAttr),
                    dimension : levelEl.attr('data-dimension'),
                    level : levelEl.attr('data-level'),
                    index : levelEl.index(),
                    groupIndex : dimensionEl.index(),
                    isMeasure : isMeasure,
                    allLevels : levelEl.siblings().andSelf().map(function() {
                        return $(this).attr(that.nameAttr);
                    }).get()
                }
            }));
        },

        onRemove : function(e) {
            var item = $(e.target).closest('li'),
                pos = item.index(),
                axis = this.axes[item.closest('ul.sortable').attr('id')],
                dim = item.attr('data-dimension');
            this.element.trigger('lm:removeItem', {axis : axis.name, index : pos,
                item : {level : item.attr('data-level'), dimension : dim, isMeasure : this.measuresGroupId === dim}});
        },

        onAdd : function(draggable) {
            var node = draggable.node,
                pos = $(draggable).index(),
                nodes = draggable.nodes || [node],
                axis = this.axes[$(draggable).closest('ul').attr('id')],
                validator = this[axis.name].validateAdd,
                level, levels,
                errors = [];

            if (!node) return;

            levels = this.filter(nodes, axis);
            // Validate item add to appropriate axis
            if (validator && !validator.call(this, levels, errors)) {
                !_.isEmpty(errors) && dialogs.systemConfirm.show(errors.join('</br>'), 5000);
                this.render(this.axes, true);
                return;
            }

            if (_.isEmpty(levels)) {
                return;
            } else if (levels.length === 1) {
                level = levels[0];
                var extra = level.param.extra || level.param; // Make this code compatible with Set adding
                this.element.trigger('lm:addItem', {axis : axis.name, dimension : extra.dimensionId, level : extra.id, index : pos});
            } else {
                this.element.trigger('lm:addItems', {axis : axis.name, levels : _.pluck(levels, 'param' ), index : pos});
            }
        },

        onMove : function(draggable, isReorder, sourceId, destId, from, to) {
            var dragEl = $(draggable.element),
                source = this.axes[sourceId],
                dest = this.axes[destId],
                validator = this[dest.name].validateMove,
                errors = [];

            // Prevent unnecessary actions if nothing changed
            if (isReorder && from === to) {
                return;
            }

            if (!isReorder && validator && !validator.call(this, source, dest, dragEl, errors)) {
                !_.isEmpty(errors) && dialogs.systemConfirm.show(errors.join('</br>'), 5000);
                this.render(this.axes, true);
                return;
            }

            this.element.trigger('lm:' + (isReorder ? 'moveItem' : 'switchItem'),
                {axis : dest.name, item : dragEl.attr(this.moveAttr), from : from, to : to});
        },

        onMeasureReorder : function(list, draggable) {
            var measureEl = $(draggable.element);
            this.element.trigger('lm:measureReorder', {measure : measureEl.attr('data-level'), to: measureEl.index()});
        },

        /////////////////////////////
        // Drag'n'Drop
        /////////////////////////////
        createSortable : function(element) {
            Sortable.create(element, {
                delay: (isIE() ? 200 : 0),
                constraint: false,
                overlap: 'horizontal',
                containment: _(this.axes).keys(),
                dropOnEmpty: true,
                onDrop : this.onAdd
            });
            // Anyway, remove newly create observers for axis.
            Draggables.removeObserver(element);
        },

        createMeasuresSortable : function(element) {
            var measureGroup = $('li.measure > ul.members', element);
            if (measureGroup.length === 0) return;

            // Remove Sortable if measures group is empty
            if (measureGroup.find('li.member').length === 0) {
                Sortable.destroy(measureGroup[0]);
                return;
            }
            Sortable.create(measureGroup[0], {
                delay: (isIE() ? 200 : 0),
                constraint: false,
                overlap: 'horizontal',
                onUpdate: this.onMeasureReorder
            });
        }
    };

    /////////////////////////
    // Helper Functions
    /////////////////////////

    /**
     * Generally filters nothing, only retrieves all leaf nodes
     * @param nodes
     */
    LayoutManager.basicFilter = function(nodes) {
        return _.inject(nodes, function(levels, node) {
            return levels.concat(lm.toLeavesArray(node));
        }, []);
    };

    LayoutManager.removeDuplicatesFilter = function(nodes, existingLevels, compoundKeyMap) {
        var nodeInfo;
        return _(nodes).filter(function(node) {
            nodeInfo = node.param.extra;
            return nodeInfo.id === '_spacer' || !_.any(existingLevels, function(level) {
                return _.all(compoundKeyMap, function(value, key) {
                    return nodeInfo[key] === level[value];
                });
            });
        });
    };

    /**
     * Temporarily change underscore template settings and restore that settings to defaults after action happened.
     * We are using Mustache-like syntax {{ }}
     * @param actionFn
     * @param context
     */
    LayoutManager.changeTemplateSettings = function(actionFn, context) {
        var oldSettings = _.templateSettings;
        _.templateSettings = {
            evaluate:/\{\{([\s\S]+?)\}\}/g,
            interpolate:/\{\{=([\s\S]+?)\}\}/g,
            escape:/\{\{-([\s\S]+?)\}\}/g
        };
        actionFn && actionFn.call(context);
        _.templateSettings = oldSettings;
    };

    /**
     * Recursively traverse tree and retrieve all leaves.
     * @param node initial parent node.
     * @param arr array where to put found leaves.
     */
    LayoutManager.toLeavesArray = function(node, arr) {
        var array = arr || [];
        if (!node.childs || node.childs.length === 0) {
            array.push(node);
            return  array;
        }
        for (var i = 0; i < node.childs.length; i++) {
            lm.toLeavesArray(node.childs[i], array);
        }
        return array;
    };

    var LayoutManagerDragObserver = Class.create({
        initialize: function(element, observer) {
            // TODO jQuery!
            this.element = P(element);
            this.observer = observer;
            this.axes = ['olap_rows', 'olap_columns'];
        },

        onStart: function(eventName, draggable) {
            this.axis = this.getAxis(draggable);
            this.from = $(draggable.element).index();
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

            var destinationAxis = this.getAxis(draggable);
            // Return, if drop place is not an axis.
            if (!destinationAxis || !this.axes.include(destinationAxis.id)) return;

            Sortable.unmark();
            var isReorder = this.axis.id === destinationAxis.id,
                to = $(draggable.element).index();

            this.observer(draggable, isReorder, this.axis.id, destinationAxis.id, this.from, to);
            if (isIE() && this.changedElement) {
                this.changedElement.style.removeAttribute("display");
                this.changedElement.style.removeAttribute("padding");
            }
        },

        getAxis : function(draggable) {
            return draggable.element.up('ul');
        }
    });

    modeExtensionMap = {
        table : {
            nameAttr : 'fieldname',
            moveAttr : 'fieldname',
            // Filter out all values that already available in Layout Manager
            filter : function(nodes, axis) {
                return lm.removeDuplicatesFilter(lm.basicFilter(nodes), axis.data, {id : 'name'});
            },
            fieldExists : function(fields, fieldName) {
                return _.find(fields, function(f) {
                    return f.name === fieldName;
                });
            },
            group : {
                validateAdd : function(nodes, errorMessages) {
                    if (nodes.length === 0) {
                        errorMessages && errorMessages.push("Field or measure already in use.");
                        return false;
                    }
                    if (_.any(nodes, function(node) {return node.param.extra.isMeasure || node.param.extra.id === '_spacer';})) {
                        errorMessages && errorMessages.push(errorAddTpGroups);
                        return false;
                    }
                    return true;
                },
                validateMove : function(source, dest, level, errorMessages) {
                    if (level.hasClass('meazure')) {
                        errorMessages && errorMessages.push(errorAddTpGroups);
                        return false;
                    }
                    if (this.fieldExists(dest.data, level.attr('fieldname'))) {
                        errorMessages && errorMessages.push("Cannot move field already present in groups");
                        return false;
                    }
                    return true;
                }
            },
            column : {
                validateAdd : function(nodes, errorMessages) {
                    if (nodes.length === 0) {
                        errorMessages && errorMessages.push("Field or measure already in use.");
                        return false;
                    }
                    return true;
                },
                validateMove : function(source, dest, level, errorMessages) {
                    if (this.fieldExists(dest.data, level.attr('fieldname'))) {
                        errorMessages && errorMessages.push("Cannot move field already present in columns");
                        return false;
                    }
                    return true;
                }
            },
            normalizeModel : function(json) {
                var isMeasure = false, currentName = null;
                return _.map(json, function(level) {
                    isMeasure = level.measure || level.isSpacer;
                    // TODO: Unify label attribute (currentDisplayName and label) for columns and groups
                    currentName = level.currentDisplayName || level.label;
                    if (currentName === "_null") {
                        currentName = null;
                    }
                    return {
                        name: level.name,
                        title : level.isSpacer ? adhocDesigner.messages["spacer"] : (currentName || level.name),
                        isSpacer : level.isSpacer,
                        isMeasure : isMeasure,
                        itemClass : isMeasure ? 'meazure' : 'dimenzion'
                    }
                })
            }
        },
        chart : {
            nameAttr : 'fieldname',
            moveAttr : 'fieldname',
            // Idempotent filter
            filter : function(nodes) {return nodes;},
            group : {
                validateAdd : function(nodes, errorMessages) {
                    // Check whether items added are not Sets
                    if (_.any(nodes, function(n) {return n.param.type === 'ItemGroupType';})) {
                        errorMessages && errorMessages.push(adhocDesigner.messages['cantAddSet']);
                        return false;
                    }
                    // Cannot add measure to Group axis
                    if (_.any(nodes, function(node) {return node.param.extra.isMeasure;})) {
                        errorMessages && errorMessages.push(errorAddTpGroups);
                        return false;
                    }
                    return true;
                },
                validateMove : function(source, dest, level, errorMessages) {
                    if (level.hasClass('meazure')) {
                        errorMessages && errorMessages.push(errorAddTpGroups);
                        return false;
                    }
                    return true;
                }
            },
            measures : {
            },
            normalizeModel : function(o) {
                if (o instanceof Array) {
                    return _.map(o, function(level) {
                        return {
                            name: level.name,
                            title : level.label,
                            isSpacer : false,
                            isMeasure : level.isMeasure,
                            itemClass : level.isMeasure ? 'meazure' : 'dimenzion'
                        }
                    })
                } else {
                    return o.name ? [{
                        name: o.name,
                        title : o.label,
                        isSpacer : false,
                        isMeasure : false,
                        itemClass : 'dimenzion'
                    }] : [];
                }
            }
        },
        crosstab : {
            nameAttr : 'data-level',
            moveAttr : 'data-dimension',
            filter : function(nodes) {
                // We doesn't support multiselect for OLAP, so pick first selected node
                nodes = lm.basicFilter(this.isOlapMode ? nodes.slice(0, 1) : nodes);
                var isNonOlapMeasure = !this.isOlapMode && _.any(nodes, function(n) {return n.param.extra && n.param.extra.isMeasure;});
                // Don't filter out duplicated measures in non-OLAP mode
                if (isNonOlapMeasure) return nodes;

                return lm.removeDuplicatesFilter(nodes, this.axesCache, {id : 'name', dimensionId : 'groupId'});
            },
            row : {
                validateMove : function(source, dest, level, errorMessages) {
                    // Do not allow move items from columns if it will become empty after it.
                    return !(dest.isDependent && source.data.length == 1);
                },
                validateAdd : function(nodes, errorMessages) {
                    return !_.isEmpty(nodes) &&
                        !(this.axes['olap_rows'].isDependent && this.axes['olap_columns'].data.length === 0);
                }
            },
            column : {
                validateAdd : function(nodes, errorMessages) {
                    return !_.isEmpty(nodes);
                }
            },
            normalizeModel : function(json) {
                var groups = [], label = "";
                for (var groupIndex = 0; groupIndex < json.length; groupIndex++) {
                    var jsonGroup = json[groupIndex],
                        groupId = jsonGroup.name,
                        group = {groupId : groupId, levels : [], liClass : 'dimension', ulClass : 'levels', measureHandle : ''};

                    // Collect all levels from group.
                    for (var levelIndex = 0; levelIndex < jsonGroup.levels.length; levelIndex++) {
                        var jsonLevel = jsonGroup.levels[levelIndex];

                        // Skip level if it's invisible or is a second or next recursive level
                        if (!jsonLevel.visible || jsonLevel.recursiveLevelNumber > 0) continue;

                        if (!_.isEmpty(jsonLevel.members)) {
                            // Update group with measure specific properties
                            _.extend(group, {isMeasure : true, liClass : 'measure', ulClass : 'members', measureHandle: "<span class='handle'>&nbsp;</span>"});

                            for (var memberIndex = 0; memberIndex < jsonLevel.members.length; memberIndex++) {
                                var jsonMember = jsonLevel.members[memberIndex];

                                // Skip All Spacers
                                if (jsonMember.isSpacer === true) continue;
                                label = (jsonMember.fieldDisplay ? jsonMember.fieldDisplay : jsonMember.name) +
                                    (jsonMember.aggregateColumnName && jsonMember['function'] !== "Sum" ?
                                        _.sprintf(" (%s)", jsonMember.functionOrDefault) : "");

                                group.levels.push({
                                    id : _.uniqueId(_.underscored(jsonMember.name) + "_"),
                                    // Name is used for interaction with external subsystems
                                    name : jsonMember.name,
                                    groupId : groupId,
                                    label : label,
                                    depth : memberIndex,
                                    isMeasure : true,
                                    levelClass : 'member'
                                });
                            }
                        } else {
                            group.levels.push({
                                id : _.uniqueId(jsonLevel.name + "_"),
                                // Name is used for interaction with external subsystems
                                name : jsonLevel.name,
                                groupId : groupId,
                                label : jsonLevel.display ? jsonLevel.display : jsonLevel.name,
                                depth : jsonLevel.depth,
                                isMeasure : false,
                                levelClass : 'level'
                            });
                        }
                    }
                    groups.push(group);
                }
                return groups;
            },
            // Put all data into single-dimension array for easy search
            updateAxesDataCache : function() {
                this.axesCache = _.chain(this.axes).values().pluck('data').flatten().pluck('levels').flatten().value();
            }
        }
    };


    exports.LayoutManager = LayoutManager;
})(jQuery, $, window);

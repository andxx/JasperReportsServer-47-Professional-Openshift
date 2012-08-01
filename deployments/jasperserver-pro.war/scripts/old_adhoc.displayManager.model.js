/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

var Level = Backbone.Model.extend({
    defaults : {
        visible : true,
        isMeasure : false
    }
});

var LevelsCollection = Backbone.Collection.extend({
    model : Level
});

var Group = Backbone.Model.extend({
    initialize : function(attrs) {
        if (!attrs) return this;

        var l = attrs.levels,
            isArray = _.isArray(l);
        this.levels = (l && !isArray) ? l : new LevelsCollection(isArray ? l : []);
        this.id = this.groupId = attrs.groupId;

        // Re-trigger all events from levels to group model.
        this.levels.bind('all', function() {
            var args = Array.prototype.slice.call(arguments, 0);
            this.trigger.call(this, args.shift(), this, this.collection, _.extend(args.pop(), {args : args}));
        }, this);
    },

    getLevel : function(attrs) {
        if (!attrs) return;
        return attrs.at != null ? this.levels.at(attrs.at) : this.levels.get((attrs.levelId != null) ? attrs.levelId : attrs);
    },

    getLevels : function() {
        return this.levels.models;
    },

    findPos : function(levelId) {
        var match, pos = -1;
        this.levels.any(function(level, i) {
            if (match = (level.id === levelId)) pos = i;
            return  match;
        });
        return pos;
    },

    size : function() {
        return this.levels.length;
    },

    add : function(level, options) {
        this.levels.add(level, options);
        return this;
    },

    insert : function(level, pos, options) {
        this.levels.add(level, _.extend({at : pos}, options));
        return this;
    },

    remove : function(levelId, options) {
        var level = this.getLevel(levelId);
        var pos = this.levels.indexOf(level);
        this.levels.remove(levelId, _.extend({pos : pos}, options));
        return this;
    },

    reorder : function(levelId, to) {
        var from = this.findPos(levelId), level = this.getLevel({at : from});
        this.remove(levelId, {silent : true});
        this.insert(level, to, {silent : true});
        this.trigger(level.get('isMeasure') ? 'reorderMeasure' : 'reorderLevel', this, {level : level, from : from, to : to});
    }
});

var Axis = Backbone.Collection.extend({
    model : Group,

    canHoldIdentical : false,

    initialize : function(models, options) {
        if (!options) return;

        this.canHoldIdentical = options.canHoldIdentical || false;
        this.name = options.name;
    },

    getLevelGroups : function() {
        return this.models;
    },

    getLevelGroup : function(groupId) {
        return this.find(function(group) {
            return group.groupId === groupId;
        });
    },

    getGroupPos : function(groupId) {
        var match, pos = -1;
        _.any(this.models, function(group, i) {
            if (match = (group.groupId === groupId)) pos = i;
            return  match;
        });
        return pos;
    },

    getLevel : function(attrs) {
        if (!attrs) return;
        var group = this.getLevelGroup(attrs.groupId);
        return group && group.getLevel(attrs);
    },

    findLevel : function(groupId, iterator) {
        if (!groupId) return;
        var group = this.getLevelGroup(groupId);
        return group && ( _.isFunction(iterator) ? group.levels.find(iterator) : group.getLevel(iterator));
    },

    addLevel : function(level, pos) {
        level = level instanceof Backbone.Model ? level : new Level(level);
        var groupId = level.get('groupId');
        var group = (this.canHoldIdentical && !level.get('isMeasure')) ? null : this.getLevelGroup(groupId);
        var groupExists = !!group;
        if (!groupExists) {
            group = new Group({groupId : groupId});
            this.insertGroup(group, pos, true);
        }
        group.add(level, {silent : true});
        group.trigger(level.get('isMeasure') ? 'addMeasure' : 'addLevel', group, this, {
            level : level,
            group : group,
            groupExists: groupExists,
            groupPos : pos
        });
        return this;
    },

    insertGroup : function(group, pos, isSilent) {
        return this.add(group, {at : pos, silent : isSilent || false});
    },

    removeGroup : function(groupId) {
        return this.remove(groupId, {silent : true});
    },

    removeLevel : function(level) {
        var groupId = (arguments.length === 2) ? arguments[0] : level.groupId;
        var levelId = (arguments.length === 2) ? arguments[1] : level.id;
        var group = this.getLevelGroup(groupId);
        if (!group) return null;
        group.remove(levelId);
        if (group.size() === 0) {
            this.removeGroup(group.groupId);
        }
    }
});
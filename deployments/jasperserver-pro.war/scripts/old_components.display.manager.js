/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

var AdhocDisplayManager = function(options) {
	var $ = jQuery; //--> IMPORTANT!
	var it = this;
	var id = options.id;
	var jo = $('#' + id);
	var uls = [];
	
	var duplicate_allowed = options.duplicate_allowed || [false,false];
	var accept_only = options.accept_only || {};
	accept_only['olap_columns'] = null;
	accept_only['olap_rows'] = null;
	
	if(accept_only) {
		var i;
		var regex;
		var axis = ['columns','rows'];
		$.each(axis,function(i,v){
			if(accept_only[v]) {
				regex = '.*';
				for(i=0;i<accept_only[v].length;i++) {
					if(i > 0) regex += '|';
					regex += '(\\b' + accept_only[v][i] + '\\b)';
				}
				accept_only['olap_'+v] = new RegExp(regex + '.*');
			}			
		})
	}
	
	var onDropColFn = options.onDropColFn || doNothing;
	var onRemColFn = options.onRemColFn || doNothing;
	var onRightClickColFn =  options.onRightClickColFn || doNothing;
	
	var onDropRowFn = options.onDropRowFn || doNothing;
	var onRemRowFn = options.onRemRowFn || doNothing;
	var onRightClickRowFn =  options.onRightClickRowFn || doNothing;
	
	var only_one_row_item = options.only_one_row_item !== true ? false : true;
	/*
	 * Used to check if band is emtpy
	 */
	var cnum = 0;
	var rnum = 0;
	/*
	 * Cache field types for rendering
	 */
	var tmap = null;
	var map = null;
	var dims = null;
	var meas = null;
	
	var startpos = null;
	var current_drag = null;
	
	var tmpl = [
	    '<li class="level button ',
	    null,
	    'group ',
	    null,
	    '" fieldname="',
	    null,
	    '">',
	    '<div class="level wrap" title="',
	    null,
	    '">',
	    null,
	    '</div><span class="icon remove"></span></li>'
	];
	
	this.init = function(){
		jo.removeClass('hidden');
		jo.find('ul').each(function(k){
			uls.push(this.id);
		});
		behave();
	}
	/**
	 * Function called by application controller
	 */
	this.update = function(data,map,fns){	
		var json;
		var m;
		var r = /"id":"([^"]*)"/g;	
		tmap = tmap || {};
		$.get('flow.html?_flowId=treeFlow&method=getNode&provider=dimensionsTreeDataProvider&uri=/&depth=10',function(rsp){
			json = rsp.substring(rsp.indexOf('{'),rsp.lastIndexOf('}')+1);
			dims = json;
			while (m = r.exec(json)){
				tmap[m[1]] = 'dimenzion';
			}				
			$.get('flow.html?_flowId=treeFlow&method=getNode&provider=measuresTreeDataProvider&uri=/&depth=10',function(rsp){
				json = rsp.substring(rsp.indexOf('{'),rsp.lastIndexOf('}')+1);
				meas = json;
				while (m = r.exec(json)){
					tmap[m[1]] = 'meazure';
				}
				data && render(data,map,fns);
			})
		})
	}
	
	/**
	 * Function called by this.update() 
	 * @param data
	 * @param _map
	 */
	 var render = this.render = function(data,map,fns){
		var i;
		var m;
		var it;
		var w = 0;
		var last_insert;
		var labels = {};
		var htm;
		jo.find('ul').each(function(k){
			it = $(this);
			m = map[k].length;
			htm = '';
			for(i=0;i<m;i++) {
				labels[map[k][i].name] = map[k][i].label;
			}
			labels['_spacer'] = 'spacer';
			m = data[k].length;
			//it.empty();
			k == 0 ? cnum = m : rnum = m;
			for(i=0;i<m;i++){
				if(labels[data[k][i]]) {
					tmpl[1] = k == 0 ? 'col' : 'row';
					tmpl[3] = fns && fns[data[k][i]] ? tmap[fns[data[k][i]]] : tmap[data[k][i]];
					tmpl[5] = data[k][i];
	 		        tmpl[8] = labels[data[k][i]].escapeHTML().replace(this.DOUBLE_QUOTES, '&quot;');
			        tmpl[10] = labels[data[k][i]].escapeHTML();
			        //it.append(tmpl.join(''));
			        htm += tmpl.join('');
				}	
			}
			it.html(htm);
			
            Sortable.create(this.id, {
                delay: (isIE() ? 200 : 0),
                constraint: false,
                overlap: 'horizontal',
                containment: uls,
                dropOnEmpty: true,
                onStart: function(draggable){
                	draggable.element.style.zIndex = '99';
                	draggable.element.style.position = 'relative';
                    startpos = draggable.element.previousSiblings().length;
                },
                onEmptyHover: onEmptyHover,
                onHover: onHover,
                onDrop: k == 0 ? onDropCol : onDropRow
            });
		});
		
		$('#designer').trigger('layout_update');
	}
	function behave(){
		$.each(uls,function(i,v){
            if(isIPad()){          	
                $('#'+v).bind('touchend', function(e){
                    if(e.target.tagName.toLowerCase() == 'span' && e.target.className.indexOf('remove') >= 0) {
                        var pjo = $(e.target.parentNode);
                        var i = pjo.index();
                        pjo.remove();
                        v.indexOf('columns') > 0 ? onRemColFn(i) : onRemRowFn(i);
                    }
                    if(e.target.tagName.toLowerCase() == 'div') {
                    	var f = $(e.target).parent().attr('fieldname');
                    	if(it.clicked && (it.clicked == f) && (e.timeStamp - it.clicktime < 700)) {
                    		var pjo = $(e.target.parentNode);
	                        var slotid = pjo.parent().attr('id');
	                        var ftype = pjo.hasClass('dimenzion') ? 'dimension' : 'measure';
	                        slotid == 'olap_columns' ? onRightClickColFn(e.originalEvent,f,pjo.index(),ftype) : onRightClickRowFn(e.originalEvent,f,pjo.index());                                   		
                    	}
                    	it.clicked = f;
                    	it.clicktime = e.timeStamp; 
                    }
                });
                
                $('#'+v).bind('touchstart', function(e){      
                	if(e.originalEvent.touches.length == 2) {
                		if(e.target.tagName.toLowerCase() == 'div') {
	                		var pjo = $(e.target.parentNode);
	                        var slotid = pjo.parent().attr('id');
	                        var ftype = pjo.hasClass('dimenzion') ? 'dimension' : 'measure';
	                        slotid == 'olap_columns' ? onRightClickColFn(e.originalEvent,pjo.attr('fieldname'),pjo.index(),ftype) : onRightClickRowFn(e.originalEvent,pjo.attr('fieldname'),pjo.index());                    
                		}
                	}            	
                });
            } else {
                $('#'+v).bind('mouseup',function(e){
                	if(e.which == 3) {
                        if(e.target.tagName.toLowerCase() == 'div') {
                            var pjo = $(e.target.parentNode);
                            var slotid = pjo.parent().attr('id');
                            var ftype = pjo.hasClass('dimenzion') ? 'dimension' : 'measure';
                            slotid == 'olap_columns' ? onRightClickColFn(e,pjo.attr('fieldname'),pjo.index(),ftype) : onRightClickRowFn(e,pjo.attr('fieldname'),pjo.index());
                        }
                	}
                    else {
                        if(e.target.tagName.toLowerCase() == 'span' && e.target.className.indexOf('remove') >= 0) {
                            var pjo = $(e.target.parentNode);
                            var i = pjo.index();
                            pjo.remove();
                            v.indexOf('columns') > 0 ? onRemColFn(i) : onRemRowFn(i);
                        }                		
                	}
                });
            }
		})
		jo.bind('add_field',function(ev,name,label){
			tmap[name] = 'meazure';
		})
	}
	function onEmptyHover(element, dropon, overlap){ 
		if(accept_only[dropon.id] && !accept_only[dropon.id].test(element.className)) return;
		
		if((cnum == 0 && dropon.id == 'olap_columns') || (rnum == 0 && dropon.id == 'olap_rows')){
			Sortable.onEmptyHover(element, dropon, overlap);
		}
		if(dropon.id == 'olap_columns' && element.parentNode.id == 'olap_rows'){
			Sortable.onEmptyHover(element, dropon, overlap);
		}
		if(dropon.id == 'olap_rows' && element.parentNode.id == 'olap_columns'){
			Sortable.onEmptyHover(element, dropon, overlap);
		}
		/*
		if($(element).hasClass('colgroup') && dropon.id == 'olap_columns')return;
		if($(element).hasClass('rowgroup') && dropon.id == 'olap_rows')return;
		Sortable.onEmptyHover(element, dropon, overlap);
		*/
	}
    function onHover(element, dropon, overlap , voverlap){    	
        if (Element.isParent(dropon, element) || element.hasClassName("dialog")) return;
        
		if(accept_only[dropon.parentNode.id] && !accept_only[dropon.parentNode.id].test(element.className)) return;
		
        if (overlap > .15 && overlap < .85 && Sortable.options(dropon).tree) {
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
    /**
     * Use class name to determine function call
     */
    function onDropCol(draggable){
    	var c = null;
    	var pos = draggable.previousSiblings().length; 
    	var ccnt = $('#'+uls[0]).children().length;

    	if(draggable.parentNode.id == 'olap_rows' || pos > ccnt) {
    		pos = ccnt; 		
    	}
        var fieldList = adhocDesigner.collectFields(draggable.nodes || [], true, localContext.canAddFieldAsColumn).
            //fix for bug 23370, encode each fieldname on client and decode on server
            map(function(fieldName){
                return escape(fieldName);
            }
        ).join(',');
    	var fieldname = (fieldList !== '') ? fieldList : draggable.readAttribute('fieldname');
    	if(!fieldname || fieldname === '') return;
    	
    	if(draggable.className.indexOf('colgroup') >= 0) c = 'colgroup';
        if(draggable.className.indexOf('rowgroup') >= 0) c = 'rowgroup';
        if(draggable.className.indexOf('dimension') >= 0) c = 'dimension';
        if(draggable.className.indexOf('measure') >= 0) c = 'measure';
        
        if(!duplicate_allowed[0]) {
            if(fieldname && fieldname != '_spacer') {
    	        if($('#olap_columns > li[fieldname="'+fieldname+'"]').length > 1 ||
    	          ($('#olap_columns > li[fieldname="'+fieldname+'"]').length > 0 && draggable.parentNode.id != 'olap_columns')) {
                    dialogs.systemConfirm.show('Field or measure already in use.', 5000);
    	        	return;
    	        }
            }        	
        }

        if(c != 'colgroup' && c != 'rowgroup'){
        	var li = '<li class="'+draggable.className+'">'+draggable.innerHTML+'</li>'; 
        	
	        if($('#olap_columns').children().length > 0){
	        	if(pos == ccnt) {
	        		$('#olap_columns').children().eq(pos-1).after(li);
	        	} else {
	        		$('#olap_columns').children().eq(pos).before(li);
	        	}        	
	        } else {
	        	$('#olap_columns').append(li);
	        }       
        }
        c == 'colgroup' ? onDropColFn[c](startpos,pos,null,true) : onDropColFn[c](fieldname,pos,startpos);
    }
    function onDropRow(draggable){
    	var c = null;
    	var pos = draggable.previousSiblings().length;
    	var ccnt = $('#'+uls[1]).children().length;
    	if(draggable.parentNode.id == 'olap_columns' || pos > ccnt) {
    		pos = ccnt; 		
    	}

        function getNodeFieldName(node) {
            var firstLeaf = adhocDesigner.getFirstLeaf(node);
            var fieldname = !!firstLeaf ? firstLeaf.param.id : draggable.readAttribute('fieldname');
            if(!fieldname || fieldname == '') return null;

            var label = $(draggable).text();
            var r = new RegExp('"label":"'+label+'","type":"([a-zA-Z]+)"');
            var m = r.exec(dims);
            var n = r.exec(meas);

            if(only_one_row_item && ccnt > 1){
                if(m != null && m[1] == 'ItemGroupType' ||
                   n != null && n[1] == 'ItemGroupType') {
                    dialogs.systemConfirm.show('Only one item is allowed.', 5000);
                    return null;
                }
            } else if(m != null && m[1] == 'ItemGroupType'){
                dialogs.systemConfirm.show(localContext.messages['cantAddSet'], 5000);
                return null;
            }


            if(!duplicate_allowed[1]) {
                if(fieldname && fieldname != '_spacer') {
                    if($('#olap_rows > li[fieldname="'+fieldname+'"]').length > 1 ||
                      ($('#olap_rows > li[fieldname="'+fieldname+'"]').length > 0 && draggable.parentNode.id != 'olap_rows')) {
                        dialogs.systemConfirm.show('Field or measure already in use.', 5000);
                        return null;
                    }
                }
            }

            return fieldname;
        }//end getNodeType

        if(draggable.className.indexOf('colgroup') >= 0) c = 'colgroup';
        if(draggable.className.indexOf('rowgroup') >= 0) c = 'rowgroup';
        if(draggable.className.indexOf('dimension') >= 0) c = 'dimension';
        if(draggable.className.indexOf('measure') >= 0) c = 'measure';

        if(c != 'colgroup' && c != 'rowgroup'){
        	if(!accept_only['olap_rows'] || accept_only['olap_rows'].test(draggable.className)){
	        	var li = '<li class="'+draggable.className+'">'+draggable.innerHTML+'</li>'; 
	        	if(only_one_row_item){
	        		$('#olap_rows').html(li);
	        	} else {
	        		if($('#olap_rows').children().length > 0){
	    	        	if(pos == ccnt) {
	    	        		$('#olap_rows').children().eq(pos-1).after(li);
	    	        	} else {
	    	        		$('#olap_rows').children().eq(pos).before(li);
	    	        	}        	
	    	        } else {
	    	        	$('#olap_rows').append(li);
	    	        }           		
	        	}  
        	}
        }
        var ftype = draggable.className.indexOf('dimenzion') >= 0 ? 'dimension' : 'measure';

        if(c == 'rowgroup') {
            onDropRowFn[c](startpos,pos)
        } else {
            var nodes = draggable.nodes;
            var fieldNames = [];
            for(var i=0; i<nodes.length; i++) {
                var fieldName = getNodeFieldName(nodes[i]);
                if(!fieldName) {
                    return;
                }
                if(fieldNames.indexOf(fieldName) < 0) {
                    fieldNames.push(fieldName);
                }
            }
            onDropRowFn[c](fieldNames,pos,startpos,ftype);
        }

    }//end function onDropRow
	this.init();
};

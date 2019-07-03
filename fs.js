/*	2010 Cyrille Médard de Chardon
	Furnissure
*/

var FS = {};

FS.room = {
	w: 0,
	h: 0,
	drs: 's',	//door side
	drd: 0,		//door distance from the wall to the right of the door
	drw: 0,		//door width
	flist: {},
	fcount: 0
};

FS.constants = {
	door_width: 10,
	snap_dist: 10,
	svgNS: "http://www.w3.org/2000/svg",
	room_buffer: 10
};

//holds values for dragging
FS.drag = {};

//FS.snap will hold the values of the vertical and horizontal snap lines
FS.snap = {
	vl: {},
	hl: {},
	vc: 0,
	hc: 0,
	exists: function(val, vert) {
		var t = 0;
		if(vert) {
			while(t < this.vc) {
				if(this.vl[t] === val) {
					return true;
				}
				t++;
			}
		} else {
			while(t < this.hc) {
				if(this.hl[t] === val) {
					return true;
				}
				t++;
			}
		}
	},
	addv: function(vline, nocheck) {
		vline = parseInt(vline, 10);
		if(nocheck || !this.exists(vline, true)) {
			this.vl[this.vc++] = vline;
		}
	},
	addh: function(hline, nocheck) {
		hline = parseInt(hline, 10);
		if(nocheck || !this.exists(hline, false)) {
			this.hl[this.hc++] = hline;
		}
	},
	remv: function(vline) {
		var t = 0;
		while(t !== this.vc) {
			if(this.vl[t] === vline) {
				delete this.vl[t];
				this.vc--;
				this.vl[t] = this.vl[this.vc];
				return true;
			}
			t++;
		}
		return false;
	},
	remh: function(hline) {
		var t = 0;
		while(t !== this.hc) {
			if(this.hl[t] === hline) {
				delete this.hl[t];
				this.hc--;
				this.hl[t] = this.hl[this.hc];
				return true;
			}
			t++;
		}
		return false;
	},
	purge: function() {
		delete this.hl;
		delete this.vl;
		this.vc = 0;
		this.hc = 0;
		this.hl = {};
		this.vl = {};
	},
	print: function() {
		var contents = 'Vertical Lines: ';
		var t = 0;
		while(t !== this.vc) {
			contents += this.vl[t] + ', ';
			t++;
		}

		t = 0;
		contents += '\n Horizontal Lines: ';
		while(t !== this.hc) {
			contents += this.hl[t] + ', ';
			t++;
		}
		FS.print(contents);
	}
};

FS.warn = function() {
	var msg = {};
	var objid ='warn_header';

	return {
		add: function(newmsg, page, overwrite) {
			if(msg[page] === '' || msg[page] === undefined || overwrite) { //is empty
				msg[page] = newmsg;
			} else {
				msg[page] = msg[page] + '<br>\n' + newmsg;
			}
		},
		clear: function(page) {
			msg[page] = '';
		},
		show: function(page) {
			if(msg[page] !== undefined && msg[page] !== '') {	//if not empty show
				$('#' + objid).html(msg[page]);
				$('#' + objid).show('fast');
		}
		},
		hide: function() {
			$('#' + objid).hide();
		}
	};
}();

//used to debug - prints to a <pre> formatted tag
FS.print = function(text) {
	$("#outputParag").html($("#outputParag").html() + text + '\n');
};

//rotate an SVG rect
FS.rotateSVG = function(evt) {
	//remove old snap lines twice
	for(var i = 0; i < 2; i++) {
		FS.snap.remv(FS.getSVG_int_attr(this.id, 'x') + FS.getSVG_int_attr(this.id, 'width'));
		FS.snap.remh(FS.getSVG_int_attr(this.id, 'y') + FS.getSVG_int_attr(this.id, 'height')); 
		FS.snap.remv(FS.getSVG_int_attr(this.id, 'x'));
		FS.snap.remh(FS.getSVG_int_attr(this.id, 'y'));  
	}
	//new ones are added by mouse up before rotation occurs

	//rotate SVG shape
	var t = FS.getSVG_int_attr(this.id, 'height');
	FS.setSVG_attr(this.id, 'height', FS.getSVG_int_attr(this.id, 'width'));
	FS.setSVG_attr(this.id, 'width', t);

	//add new correct snap lines
	FS.snap.addv(FS.getSVG_int_attr(this.id, 'x'),true);
	FS.snap.addh(FS.getSVG_int_attr(this.id, 'y'),true);  
	FS.snap.addv(FS.getSVG_int_attr(this.id, 'x') + FS.getSVG_int_attr(this.id, 'width'),true);
	FS.snap.addh(FS.getSVG_int_attr(this.id, 'y') + FS.getSVG_int_attr(this.id, 'height'),true); 
}

//gets an attribute of an SVG object
FS.getSVG_attr = function(svgid, attr) {
	return document.getElementById(svgid).getAttributeNS(null, attr);
};

//get an attribute that is an int
FS.getSVG_int_attr = function(svgid, attr) {
	return parseInt(document.getElementById(svgid).getAttributeNS(null, attr),10);
};

//changes an attribute of an SVG object
FS.setSVG_attr = function(svgid, attr, val) {
	document.getElementById(svgid).setAttributeNS(null, attr, val);
};

//changes all the attributes of an svg rect
FS.setSVG_rect = function(svgid, x, y, w, h) {
	var svgrect = document.getElementById(svgid);
	svgrect.setAttributeNS(null, 'x', x);
	svgrect.setAttributeNS(null, 'y', y);
	svgrect.setAttributeNS(null, 'width', w);
	svgrect.setAttributeNS(null, 'height', h);
};

FS.setSVG_rect_loc = function(svgid, x, y) {
	var svgrect = document.getElementById(svgid);
	svgrect.setAttributeNS(null, 'x', x);
	svgrect.setAttributeNS(null, 'y', y);
}

//changes all the attributes of an svg circ
FS.setSVG_circ = function(svgobj, x, y, r) {
	var svgcirc = document.getElementById(svgobj);
	svgcirc.setAttributeNS(null, 'cx', x);
	svgcirc.setAttributeNS(null, 'cy', y);
	svgcirc.setAttributeNS(null, 'r', r);
};

//create a SVG text object
FS.createSVG_text = function(target, id, x, y, text, css_class) {
	//check if the element id already exists (hopefully this is the same object as before
	//note we don't even check if the id is a text object and not a paht/rect/circle...
	if(document.getElementById(id)) {
		//modify element - give new text
		var el = document.getElementById(id).nodeValue = text;
		FS.setSVG_attr(id, 'x', x);
		FS.setSVG_attr(id, 'y', y);
		return;
	}

	//create text element
	var new_text = document.createElementNS(FS.constants.svgNS, 'text');
	new_text.setAttributeNS(null, 'id', id);
	new_text.setAttributeNS(null, 'class', css_class);
	new_text.setAttributeNS(null, 'x', x);
	new_text.setAttributeNS(null, 'y', y);
	new_text.appendChild(document.createTextNode(text));

	//add text to svg canvas
	document.getElementById(target).appendChild(new_text);
};

//creates a path with a predefined curve string
FS.createSVG_path = function(target, id, path_string, css_class, actions) {
	//check if the element id already exists (hopefully this is the same object as before)
	if(document.getElementById(id)) {
		//modify path parameters only do not recreate shape
		FS.setSVG_attr(id, 'd', path_string);
		return;
	}

	//create a path
	var new_shape =  document.createElementNS(FS.constants.svgNS, 'path');
	new_shape.setAttributeNS(null, 'id', id);
	new_shape.setAttributeNS(null, 'd', path_string);
	new_shape.setAttributeNS(null, 'class', css_class);
	for (name in actions ) {
		if(new_shape.addEventListener) {
			new_shape.addEventListener(name, actions[name], false);
		}
	}

	//Add rect to svg canvas
	document.getElementById(target).appendChild(new_shape);
};

//creates a circle in a target svg object, at x,y with a radius, r and class css_class, and with actions in object actions
FS.createSVG_circ = function(target, id, x, y, r, css_class, actions) {
	//check if element id already exists
	if(document.getElementById(id)) {
		//if the circle exists simply modify the parameters
		FS.setSVG_circ(id, x, y, r);
		return;
	}

	//create SVG rect and add to target
	var new_shape = document.createElementNS(FS.constants.svgNS, 'circle');
	new_shape.setAttributeNS(null, 'id', id);
	new_shape.setAttributeNS(null, 'cx', x);
	new_shape.setAttributeNS(null, 'cy', y);
	new_shape.setAttributeNS(null, 'r', r);
	new_shape.setAttributeNS(null, 'class', css_class);
	for (name in actions ) {
		if(new_shape.addEventListener) {
			new_shape.addEventListener(name, actions[name], false);
		}
	}

	//Add circle to svg canvas
	document.getElementById(target).appendChild(new_shape);
};

//creates a line in a target svg object at x1,y1 to x2,y2 with class css_class
FS.createSVG_line = function(target, id, x1, y1, x2, y2, css_class) {
	//check if it already exists
	if(document.getElementById(id)) {
		//allows you to reshape line
		FS.setSVG_attr(id, 'x1', x1);
		FS.setSVG_attr(id, 'y1', y1);
		FS.setSVG_attr(id, 'x2', x2);
		FS.setSVG_attr(id, 'y2', y2);
		return;
	}
	
	//create SVG rect and add to target
	var new_shape = document.createElementNS(FS.constants.svgNS, 'line');
	new_shape.setAttributeNS(null, 'id', id);
	new_shape.setAttributeNS(null, 'x1', x1);
	new_shape.setAttributeNS(null, 'y1', y1);
	new_shape.setAttributeNS(null, 'x2', x2);
	new_shape.setAttributeNS(null, 'y2', y2);
	new_shape.setAttributeNS(null, 'class', css_class);

	//Add line to svg canvas
	document.getElementById(target).appendChild(new_shape);
};

//creates a rectangle in a target svg object, at x,y with dim w,h and class css_class, and with actions in object actions
FS.createSVG_rect = function(target, id, x, y, w, h, css_class, actions) {
	//check if it already exists
	if(document.getElementById(id)) {
		FS.setSVG_rect(id, x, y, w, h);
		return;
	}

	//create SVG rect and add to target
	var new_shape = document.createElementNS(FS.constants.svgNS, "rect");
	new_shape.setAttributeNS(null, 'id', id);
	new_shape.setAttributeNS(null, 'x', x);
	new_shape.setAttributeNS(null, 'y', y);
	new_shape.setAttributeNS(null, 'width', w);
	new_shape.setAttributeNS(null, 'height', h);
	new_shape.setAttributeNS(null, 'class', css_class);
	for (name in actions ) {
		if(new_shape.addEventListener) {
			new_shape.addEventListener(name, actions[name], false);
		}
	}
				
	//Add rect to svg canvas
	return document.getElementById(target).appendChild(new_shape);
	
};

// based on http://www.quirksmode.org/js/findpos.html
//find the x,y location of the object
FS.findObj = function(obj) {
	var curleft = 0;
	var curtop = 0;

	if (obj.offsetParent) {
		while (obj.offsetParent) {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
			obj = obj.offsetParent;
		}
		return [curleft,curtop];
	}
};


//utility function to determine number of objects in an object
FS.countProperties = function(obj) {
    var count = 0;

    for(var prop in obj) {
        if(obj.hasOwnProperty(prop)) {
                ++count;
	}
    }

    return count;
};

//called when a user selects the wall the door is on
FS.selWall = function(evt) {
	//assign door selected to global object
	FS.room.door_side = evt.target.id.charAt(2);

	//reset all wall to class c2
	FS.setSVG_attr('p3nw','class','c2');
	FS.setSVG_attr('p3ew','class','c2');
	FS.setSVG_attr('p3sw','class','c2');
	FS.setSVG_attr('p3ww','class','c2');

	//set selected wall to class c3
	FS.setSVG_attr(evt.target.id, 'class', 'c3');

	FS.warn.clear(3);
};

//function is given two box width/heights one constrained with the larger, determines if the inner is too wide or too tall
//determines the conversion ratios and returns the ratios as well as which (h/v) is the limiting factor
FS.getRatioHW = function(inner_h, inner_w, container_h, container_w) {
	var result = {};

	if( inner_h/inner_w > container_h/container_w) {
		result.isVertConstrained = true;
	} else {
		result.isVertConstrained = false;
	}

	if(result.isVertConstrained) {
		result.ratio = (container_h - 2*FS.constants.room_buffer)/inner_h;
	} else {
		result.ratio = (container_w - 2*FS.constants.room_buffer)/inner_w;
	}

	return result;
};

//function that reads inputs of furniture form and adds details to furniture object list as well as displaying a DOM element
FS.addFurniture = function() {
	//create the pieces object if it does not already exist
	if(!FS.pieces) {
		FS.pieces = {}
	}

	//read inputs: label, w, h
	var flbl = $("#furnl").val();

	//check to see if the label is already used
	if(FS.pieces[flbl]) {
		FS.warn.add('This label name is already used! Please change your label for this item.',6,true);
		FS.warn.show(6);
		return;
	} else if(parseFloat($("#furnw").val(), 10) * parseFloat($("#furnh").val(), 10) > FS.room.w * FS.room.h) {
		FS.warn.add('This piece of furniture is larger than the room - check your units and try again.',6,true);
		FS.warn.show(6);
		return;
	} else {
		FS.warn.hide(6);
		FS.pieces[flbl] = {};
		FS.pieces[flbl].w = parseFloat($("#furnw").val(), 10);
		FS.pieces[flbl].h = parseFloat($("#furnh").val(), 10);
		FS.pieces[flbl].c = $("select[name=furnc]").val();
	}

	//add the furniture item to the list
	$("#furnlist").append("<p id='fpiece_" + flbl + "' class='flitem'><span class='fltext'>" + flbl + " [w: " + FS.pieces[flbl].w + ", h: " + FS.pieces[flbl].h + "]</span><span style='background-color: " + FS.pieces[flbl].c + ";margin-left:5px;'>&nbsp; &nbsp;</span><span class='fldstry' onclick=\"FS.removeFurniture('" + flbl + "');\">x</span></p>");
};

//delete a furniture element from object list and DOM
FS.removeFurniture = function(piece) {
	//remove from data set
	delete FS.pieces[piece];

	//remove DOM element
	$("#fpiece_" + piece).remove();
};

//show the door on the correct side and correct dimensions
FS.showDoor = function() {

	//this function can be cleaned up by doing compression (vert/horiz) before going to switch cases
	//not a priority
	//?? var ratioHW = FS.getRatioHW(innerw,innerh,outw,outh);

	switch (FS.room.door_side) {

		case 'n':
			FS.createSVG_rect('p4svg', 'p4door',
				FS.room.rmrect.x + (.4 * FS.room.rmrect.w),
				FS.room.rmrect.y - FS.constants.door_width,
				FS.room.rmrect.w * .2,
				(2 * FS.constants.door_width),
				'c3',
				{});
			FS.createSVG_circ('p4svg', 'p4dot', FS.room.rmrect.x, FS.room.rmrect.y, FS.constants.door_width, 'c4', {});
			break;

		case 'e':
			FS.createSVG_rect('p4svg', 'p4door',
				FS.room.rmrect.x + FS.room.rmrect.w - FS.constants.door_width,
				FS.room.rmrect.y + (.4 * FS.room.rmrect.h),
				(2 * FS.constants.door_width),
				FS.room.rmrect.h * .2,
				'c3',
				{});
			FS.createSVG_circ('p4svg', 'p4dot', FS.room.rmrect.x + FS.room.rmrect.w, FS.room.rmrect.y, FS.constants.door_width, 'c4', {});
			break;

		case 's':
			FS.createSVG_rect('p4svg', 'p4door',
				FS.room.rmrect.x + (.4 * FS.room.rmrect.w),
				FS.room.rmrect.y + FS.room.rmrect.h - FS.constants.door_width,
				FS.room.rmrect.h * .2,
				(2 * FS.constants.door_width),
				'c3',
				{});
			FS.createSVG_circ('p4svg', 'p4dot', FS.room.rmrect.x + FS.room.rmrect.w, FS.room.rmrect.y + FS.room.rmrect.h, FS.constants.door_width, 'c4', {});
			break;

		case 'w':
			FS.createSVG_rect('p4svg', 'p4door',
				FS.room.rmrect.x - FS.constants.door_width,
				FS.room.rmrect.y + (.4 * FS.room.rmrect.h),
				(2 * FS.constants.door_width),
				FS.room.rmrect.h * .2,
				'c3',
				{});
			FS.createSVG_circ('p4svg', 'p4dot', FS.room.rmrect.x, FS.room.rmrect.y + FS.room.rmrect.h, FS.constants.door_width, 'c4', {});
			break;
	}

	//delete FS.room.rmrect;
};

//called to load the final furnissure room where users will place the furniture
FS.makeRoom = function() {

	//rmrect holds the geometry of the room
	var rmrect = {};

	//get height/widht ratio
	dim = FS.room.h/FS.room.w;

	//get conversion ratio between FS.room h/w and FS.p7stage h/w
	var ratioHW = FS.getRatioHW(FS.room.h, FS.room.w, FS.p7stage.h, FS.p7stage.w);
	FS.room.ratio = ratioHW.ratio;

	//draw room
	FS.createSVG_rect('p7svgbase', 'p7room',
		rmrect.x = FS.constants.room_buffer,
		rmrect.y = FS.constants.room_buffer,
		rmrect.w = parseInt(FS.room.w * ratioHW.ratio,10),
		rmrect.h = parseInt(FS.room.h * ratioHW.ratio,10),
		'c1',
		{});


	//add the snapping bounds of room
	FS.snap.addh(rmrect.y, false);
	FS.snap.addh(parseInt(rmrect.y + rmrect.h,10), false);
	FS.snap.addv(rmrect.x, false);
	FS.snap.addv(parseInt(rmrect.x + rmrect.w,10), false);

	//holds some general values regarding the door location
	var door_prop = {
		widthInt:parseInt(FS.room.dwidth * ratioHW.ratio,10),
		ddistInt:parseInt(FS.room.ddist * ratioHW.ratio,10)
	};

	//continue adding values to door_prop object
	door_prop.width = String(door_prop.widthInt);
	door_prop.nxc = String(parseInt(rmrect.x + door_prop.ddistInt, 10));				//west side of north door
	door_prop.nxf = String(parseInt(rmrect.x + door_prop.ddistInt + door_prop.widthInt, 10));	//east of north door
	door_prop.ny = String(parseInt(rmrect.y + door_prop.widthInt, 10));				//bottom of north door
	door_prop.ex = String(parseInt(rmrect.x + rmrect.w - door_prop.widthInt, 10));
	door_prop.eyf = String(parseInt(rmrect.y + door_prop.ddistInt + door_prop.widthInt, 10));
	door_prop.eyc = String(parseInt(rmrect.y + door_prop.ddistInt, 10));
	door_prop.sxf = String(parseInt(rmrect.x + rmrect.w - door_prop.widthInt - door_prop.ddistInt, 10));
	door_prop.sxc = String(parseInt(rmrect.x + rmrect.w - door_prop.ddistInt, 10));
	door_prop.sy = String(parseInt(rmrect.y + rmrect.h - door_prop.widthInt));
	door_prop.wx = String(parseInt(rmrect.x + door_prop.widthInt,10));
	door_prop.wyf = String(parseInt(rmrect.y + rmrect.h - door_prop.widthInt - door_prop.ddistInt, 10));
	door_prop.wyc = String(parseInt(rmrect.y + rmrect.h - door_prop.ddistInt, 10));

	//draw door
	switch (FS.room.door_side) {

	case 'n':
		//add snap lines of door
		FS.snap.addv(door_prop.nxc, false);
		FS.snap.addv(door_prop.nxf, false);
		FS.snap.addh(door_prop.ny, false);

		//create door arc
		if(FS.room.dhinge === 'c') {
			//create door
			FS.createSVG_line('fpieces', 'p7door',
				door_prop.nxc,
				rmrect.y,
				door_prop.nxc,
				door_prop.ny, 'c7', {});

			FS.createSVG_path('fpieces', 'p7drarc',
				'M ' + door_prop.nxc +
				',' + door_prop.ny +
				' s ' + door_prop.width +
				',0 ' + door_prop.width +
				',-' + door_prop.width, 'c5', {});
		} else {
			//create door
			FS.createSVG_line('fpieces', 'p7door',
				door_prop.nxf,
				rmrect.y,
				door_prop.nxf,
				door_prop.ny, 'c7', {});

			FS.createSVG_path('fpieces', 'p7drarc',
				'M ' + door_prop.nxf +
				',' + door_prop.ny +
				' s -' + door_prop.width +
				',0 -' + door_prop.width +
				',-' + door_prop.width, 'c5', {}); 
		}
		break;

	case 'e':
		//add snap lines of door
		FS.snap.addv(door_prop.ex, false);
		FS.snap.addh(door_prop.eyc, false);
		FS.snap.addh(door_prop.eyf, false);

		//create door arc
		if(FS.room.dhinge === 'c') {
			//create door
			FS.createSVG_line('fpieces', 'p7door',
				door_prop.ex,
				door_prop.eyc,
				rmrect.x + rmrect.w,
				door_prop.eyc, 'c7', {});

			FS.createSVG_path('fpieces', 'p7drarc',
				'M ' + door_prop.ex +
				',' + door_prop.eyc +
				' s 0,' + door_prop.width +
				' ' + door_prop.width +
				',' + door_prop.width, 'c5', {});
		} else {
			//create door
			FS.createSVG_line('fpieces', 'p7door',
				door_prop.ex,
				door_prop.eyf,
				rmrect.x + rmrect.w,
				door_prop.eyf, 'c7', {});

			FS.createSVG_path('fpieces', 'p7drarc',
				'M ' + door_prop.ex +
				',' + door_prop.eyf +
				' s 0,-' + door_prop.width +
				' ' + door_prop.width +
				',-' + door_prop.width, 'c5', {});
		}
		break;

	case 's':
		//add snap lines of south door
		FS.snap.addv(door_prop.sxf, false);
		FS.snap.addv(door_prop.sxc, false);
		FS.snap.addh(door_prop.sy, false);

		//create door arc
		if(FS.room.dhinge === 'c') {
			//create door of south door
			FS.createSVG_line('fpieces', 'p7door',
				door_prop.sxc,
				door_prop.sy,
				door_prop.sxc,
				rmrect.h + rmrect.y, 'c7', {});

			FS.createSVG_path('fpieces', 'p7drarc',
				'M ' + door_prop.sxc +
				',' + door_prop.sy +
				' s -' + door_prop.width +
				',0 -' + door_prop.width +
				',' + door_prop.width, 'c5', {});
		} else {
			//create door of south door
			FS.createSVG_line('fpieces', 'p7door',
				door_prop.sxf,
				door_prop.sy,
				door_prop.sxf,
				rmrect.h + rmrect.y, 'c7', {});

			FS.createSVG_path('fpieces', 'p7drarc',
				'M ' + door_prop.sxf +
				',' + door_prop.sy +
				' s ' + door_prop.width +
				',0 ' + door_prop.width +
				',' + door_prop.width, 'c5', {});
		}
		break;

	case 'w':
		//add snap lines of west door
		FS.snap.addv(door_prop.wx, false);
		FS.snap.addh(door_prop.wyc, false);
		FS.snap.addh(door_prop.wyf, false);

		//create door arc
		if(FS.room.dhinge === 'c') {
			//create west door
			FS.createSVG_line('fpieces', 'p7door',
				rmrect.x,
				door_prop.wyc,
				door_prop.wx,
				door_prop.wyc, 'c7', {});

			FS.createSVG_path('fpieces', 'p7drarc',
				'M ' + door_prop.wx +
				',' + door_prop.wyc +
				' s 0,-' + door_prop.width +
				' -' + door_prop.width +
				',-' + door_prop.width, 'c5', {});
		} else {
			//create west door
			FS.createSVG_line('fpieces', 'p7door',
				rmrect.x,
				door_prop.wyf,
				door_prop.wx,
				door_prop.wyf, 'c7', {});

			FS.createSVG_path('fpieces', 'p7drarc',
				'M ' + door_prop.wx +
				',' + door_prop.wyf +
				' s 0,' + door_prop.width +
				' -' + door_prop.width +
				',' + door_prop.width, 'c5', {});
		}	
		break;
	}
};

//drag functions
//start drag
FS.startDrag = function(evt) {
	//this refers to the target

	evt.preventDefault();

	//get location of mouse relative to x,y of shape and store it
	//get mouse coordinates in terms of SVG canvas
	var topleft = FS.findObj(document.getElementById('p7svgcont'));
	var svg_mx = evt.clientX - topleft[0] + window.pageXOffset;
	var svg_my = evt.clientY - topleft[1] + window.pageYOffset;

	FS.drag.on = true;

	//get real_id and shape properties
	var real_id = this.id.slice(0,this.id.length - 3);
	var furn = {
		w: parseInt(FS.room.ratio * FS.pieces[real_id].w,10),
		h: parseInt(FS.room.ratio * FS.pieces[real_id].h,10)
	}

	//record difference between mouse and shape corner coordinates
	FS.drag.x = furn.w/2;
	FS.drag.y = furn.h/2; 

	//new furntiture piece name
	var realnm = 'p7' + real_id + '_' + FS.room.fcount++;

	FS.drag.targetid = realnm;

	//place center at current location
	fltelm = FS.createSVG_rect('fpieces', realnm,
		svg_mx - furn.w/2,
		svg_my - furn.h/2,
		furn.w,
		furn.h, 'cfurn', {});

	FS.setSVG_attr(fltelm.id,'style', 'fill:' +FS.pieces[real_id].c);

	//create mouseup event listener
	if(fltelm.addEventListener) {
		fltelm.addEventListener('dblclick', FS.rotateSVG, false);
		fltelm.addEventListener('mousedown', FS.restartDrag, false);
		fltelm.addEventListener('mousemove', FS.dragging, false);
		fltelm.addEventListener('mouseup', FS.endDrag, false);
	}

};

FS.restartDrag = function(evt) {
	//determine if this is a double click and if so stop this call to allow double click event
	//otherwise it will delete this object!
	if(FS.drag.time && (new Date() - FS.drag.time) < 500) {
		return;
	}
	FS.drag.time = new Date();

	//get location of mouse relative to x,y of shape and store it
	//get mouse coordinates in terms of SVG canvas
	var topleft = FS.findObj(document.getElementById('p7svgcont'));
	var svg_mx = evt.clientX - topleft[0] + window.pageXOffset;
	var svg_my = evt.clientY - topleft[1] + window.pageYOffset;

	//record difference between mouse and shape corner coordinates
	FS.drag.x = svg_mx - FS.getSVG_int_attr(this.id, 'x');
	FS.drag.y = svg_my - FS.getSVG_int_attr(this.id, 'y');
	FS.drag.on = true;
	FS.drag.targetid = this.id;

	//move element to top - last
	var prnt_node = this.parentNode;
	var new_clone = this.cloneNode(true);
	this.parentNode.removeChild(this);
	var new_node = prnt_node.appendChild(new_clone);
	
	//add event listeners to new node
	if(new_node.addEventListener) {
		new_node.addEventListener('dblclick', FS.rotateSVG, false);
		new_node.addEventListener('mousedown', FS.restartDrag, false);
		new_node.addEventListener('mousemove', FS.dragging, false);
		new_node.addEventListener('mouseup', FS.endDrag, false);
	}

	//remove snapping lines
	FS.snap.remv(FS.getSVG_int_attr(new_node.id, 'x'));
	FS.snap.remv(FS.getSVG_int_attr(new_node.id, 'x') + FS.getSVG_int_attr(new_node.id, 'width'));
	FS.snap.remh(FS.getSVG_int_attr(new_node.id, 'y'));
	FS.snap.remh(FS.getSVG_int_attr(new_node.id, 'y') + FS.getSVG_int_attr(new_node.id, 'height'));


};

FS.dragging = function(evt) {
	if(FS.drag.on) {
		//reload the target shape
		var that = document.getElementById(FS.drag.targetid);

		//get mouse coordinates in terms of SVG canvas
		var topleft = FS.findObj(document.getElementById('p7svgcont'));
		var svg_mx = evt.clientX - topleft[0] + window.pageXOffset;
		var svg_my = evt.clientY - topleft[1] + window.pageYOffset;
		
		//correct location to drag to
		var nx = svg_mx - FS.drag.x;
		var ny = svg_my - FS.drag.y;
		//we will however look to see if there is a location to snap to

		//get shape width and heigth
		var sw = FS.getSVG_int_attr(that.id, 'width');
		var sh = FS.getSVG_int_attr(that.id, 'height')

		//check if shape bound edges are within snap tolerance and if so adjust location (nx, ny)
		var bnds = {
			xl: svg_mx - FS.drag.x,
			xr: svg_mx - FS.drag.x + sw,
			yt: svg_my - FS.drag.y,
			yb: svg_my - FS.drag.y + sh
		};
		
		//check bounds agains vertical snaps
		var t = 0;
		var best_vd = FS.constants.snap_dist*2;
		var best_hd = best_vd;
		var dist;

		//check vertical lines
		while( t < FS.snap.vc ) {
			dist = Math.abs(FS.snap.vl[t] - bnds.xl);
			if(dist < FS.constants.snap_dist && dist < best_vd) {
				best_vd = dist;
				nx = FS.snap.vl[t];
			}
			
			dist = Math.abs(FS.snap.vl[t] - bnds.xr);
			if(dist < FS.constants.snap_dist && dist < best_vd) {
				best_vd = dist;
				nx = FS.snap.vl[t] - sw;
			}
			t++;
		}

		//check horizontal lines
		t = 0;
		while( t < FS.snap.hc ) {
			dist = Math.abs(FS.snap.hl[t] - bnds.yt);
			if(dist < FS.constants.snap_dist && dist < best_hd) {
				best_hd = dist;
				ny = FS.snap.hl[t];
			}

			dist = Math.abs(FS.snap.hl[t] - bnds.yb);
			if(dist < FS.constants.snap_dist && dist < best_hd) {
				best_hd = dist;
				ny = FS.snap.hl[t] - sh;
			}
			t++;
		}

		//update the location of the shape by the shift amount (FS.drag.x & y) relative to mouse position
		FS.setSVG_attr(that.id, 'x', nx);
		FS.setSVG_attr(that.id, 'y', ny);
	}
};

FS.endDrag = function(evt) {
	//get mouse coordinates in terms of SVG canvas
	var topleft = FS.findObj(document.getElementById('p7svgcont'));
	var svg_mx = evt.clientX - topleft[0] + window.pageXOffset;
	var svg_my = evt.clientY - topleft[1] + window.pageYOffset;

	//finished dragging
	FS.drag.on = false;

	//if the cursor is above the garbage delete this shape
	if(svg_mx > FS.p7garb.x && svg_my > FS.p7garb.y) {
		this.parentNode.removeChild(this);
		return;
	}

	//add snapping lines
	FS.snap.addv(FS.getSVG_int_attr(this.id, 'x'),true);
	FS.snap.addv(FS.getSVG_int_attr(this.id, 'x') + FS.getSVG_int_attr(this.id, 'width'),true);
	FS.snap.addh(FS.getSVG_int_attr(this.id, 'y'),true);
	FS.snap.addh(FS.getSVG_int_attr(this.id, 'y') + FS.getSVG_int_attr(this.id, 'height'),true);
};

//when a pages change the following occurs
FS.wndwSelect = function(page) {
	var temp;
	var furn_cont;

	//indicate current page to global object
	FS.page = page;

	//check if the user really wants to go back as this may delete furniture shapes.
	//if snap.vc > 5 then there is an additional element and we should confirm
	if(FS.snap.vc > 5 && page > 1 && page < 5) {
		//FS.print(FS.snap.vc);
		response = confirm("Changing this parameter will delete all the furniture from your room. Proceed?");
		if(response) {
			//delete snap lines
			FS.snap.purge();
			//delete furniture shapes
			furn_cont = document.getElementById('fpieces');
			while(furn_cont.childElementCount > 2) {
				furn_cont.removeChild(furn_cont.lastChild);
			}
		} else {
			return;
		}
	}

	//hide all the windows
	$('.wndw').hide();

	//hide the error box
	FS.warn.hide();

	//show buttons
	$('.bbut').show();
	$('#bflow').html('back');
	$('#fflow').html('next');

	//check if the required input for the page is submitted
	//WARNING: This switch statement cascades through all cases!
	switch (FS.page) {
		case 6:
			//checks if case 5 is satisfied
		case 5:
			//check input from page 4
			//read in values from door location, size, hinge inputs
			FS.room.ddist = parseFloat($("#drdist").val(),10);
			FS.room.dwidth = parseFloat($("#drwidth").val(),10);
			FS.room.dhinge = $("input[name='hinge']:checked").val();

			if(isNaN(FS.room.ddist) || isNaN(FS.room.dwidth) || FS.room.dhinge === undefined) {
				FS.warn.add('Please input the distance of the door from the wall and the width of you door.',4,true);
				FS.page = 4;
			}
		case 4:
			//check input from page 3 - did user select a wall
			if(!FS.room.door_side) {
				FS.warn.add('Please select the wall on which the door lies for your room.', 3, true);
				FS.page = 3;
				FS.warn.clear(4);
			} 
		case 3:
			//need to reread values in case they have changed and rotate if required
			FS.room.w = parseFloat($('#rmw').val(), 10);
			FS.room.h = parseFloat($('#rmh').val(), 10);
			if(FS.room.w < FS.room.h) {
				var temp = FS.room.w;
				FS.room.w = FS.room.h;
				FS.room.h = temp;
			}

			if(isNaN(FS.room.w) || isNaN(FS.room.h) || FS.room.w <= 0 || FS.room.h <= 0) {
				FS.warn.add("Please enter the dimension of your room. Neither value can be 0.", 2, true);
				FS.page = 2;
				FS.warn.clear(3);
			}
		case 2:
			//no checks no data submitted to p2
		case 1:
			//no checks, no data submitted
	}
	
	//show the following content all values have been checked for
	switch (FS.page) {
		case 1:
			$('#p1').show();
			//hide buttons
			$('.bbut').hide();
			break;
		case 2:
			//--------------- Room size input -------------------------------
			//show page
			$('#p2').show();
			
			//show errors if any
			FS.warn.show(2);

			break;
		case 3:
			//--------------- Wall - door selection -------------------------

			//show page 3
			$('#p3').show();

			//show errors if any and clear p2 erros
			FS.warn.show(3);
			FS.warn.clear(2);

			var dim;

			if(FS.room.w < FS.room.h) {
				FS.warn.add("Warning: Your room has been rotated to better fit in the space below.", 3, false);
				FS.warn.show(3);

				//switch hight for width
				dim = FS.room.w;
				FS.room.w = FS.room.h;
				FS.room.h = dim;
			}

			//get ratio
			dim = FS.room.h/FS.room.w;

			//check the dimension of the svg box
			var canvasdim = FS.p3canvas.h/FS.p3canvas.w;
			var rmrect = {};

			//can be optimized using
			//	var ratioHW = FS.getRatioHW();

			if(dim > canvasdim) {
				//top of box is limit
				FS.createSVG_rect('p3svg', 'p3room',
					rmrect.x = FS.p3canvas.w * .05,
					rmrect.y = FS.p3canvas.h * .05,
					rmrect.w = parseInt((FS.p3canvas.h * .9)/dim, 10),
					rmrect.h = parseInt(FS.p3canvas.h * .9, 10),
					'c1',
					{});
			} else {
				//right side of box is limit
				FS.createSVG_rect('p3svg', 'p3room',
					rmrect.x = FS.p3canvas.w * .05,
					rmrect.y = FS.p3canvas.h * .05,
					rmrect.w = parseInt(FS.p3canvas.w * .9, 10),
					rmrect.h = parseInt((FS.p3canvas.w * .9)*dim, 10),
					'c1',
					{});
			}
			
			FS.createSVG_rect('p3svg', 'p3nw',
				rmrect.x + FS.constants.door_width,
				rmrect.y - FS.constants.door_width,
				rmrect.w - (2 * FS.constants.door_width),
				(2 * FS.constants.door_width),
				'c2',
				{'click': FS.selWall});

			FS.createSVG_rect('p3svg', 'p3ew',
				rmrect.x + rmrect.w - FS.constants.door_width,
				rmrect.y + FS.constants.door_width,
				(2 * FS.constants.door_width),
				rmrect.h - (2 * FS.constants.door_width),
				'c2',
				{'click': FS.selWall});

			FS.createSVG_rect('p3svg', 'p3sw',
				rmrect.x + FS.constants.door_width,
				rmrect.y + rmrect.h - FS.constants.door_width,
				rmrect.w - (2 * FS.constants.door_width),
				(2 * FS.constants.door_width),
				'c2',
				{'click': FS.selWall});

			FS.createSVG_rect('p3svg', 'p3ww',
				rmrect.x - FS.constants.door_width,
				rmrect.y + FS.constants.door_width,
				(2 * FS.constants.door_width),
				rmrect.h - (2 * FS.constants.door_width),
				'c2',
				{'click': FS.selWall});

			//copy rmrect to global object
			FS.room.rmrect = rmrect;

			//--------------- End of Wall - door selection -------------------------
			break;
		case 4:
			//--------------- Door distance from A -------------------------


			//load page 4
			$('#p4').show();

			//show errors and clear p3 errors
			FS.warn.show(4);
			FS.warn.clear(3);

			//create room
			FS.createSVG_rect('p4svg', 'p4room',
				FS.room.rmrect.x,
				FS.room.rmrect.y,
				FS.room.rmrect.w,
				FS.room.rmrect.h,
				'c1',
				{});
			//create/show door
			FS.showDoor();		
			//--------------- End of distance door-wall selection section -------------------------
			break;
		case 5:
			//--------------- Create furniture section -------------------------

			//load p5
			$('#p5').show();

			//show errors if any and clear p4 errors
			FS.warn.show(5);
			FS.warn.clear(4);

			//--------------- End of Door distance from A section -------------------------
			break;
		case 6:
			//--------------- Start laying out furniture -------------------------
			$('#p6').show();

			//edit buttons
			$('#bflow').html('Modify Room Properties');
			$('#fflow').html('Print');
			//$('#fflow').html('Export');

			//delete storage elements before putting new svg boxes
			var strg = document.getElementById('furnstrg');
			while(strg.hasChildNodes() && strg.childNodes.length > 0) {
				strg.removeChild( strg.firstChild );
			}
			
			//don't need to load anything into global data
			//draw room and door
			FS.makeRoom();

			//add list of objects to storage ------------

			//get storage dimensions
			var strprop = {
				h: parseInt(FS.getSVG_attr('p7str','height'),10),
				w: parseInt(FS.getSVG_attr('p7str','width'),10),
				x: parseInt(FS.getSVG_attr('p7str','x'),10),
				y: parseInt(FS.getSVG_attr('p7str','y'),10),
				sp: 5
			}

			//get number of furniture piece types
			var pnum = FS.countProperties(FS.pieces);
			var rect;

			//create SVG rects for each furniture type
			var i = 0;

			for(piece in FS.pieces) {
				FS.createSVG_text('furnstrg','txt'+i,
					strprop.x + (3 * strprop.sp),
					strprop.y + ((i + 1) * strprop.sp) + ((strprop.h - ((pnum + 1) * strprop.sp))/pnum * i) + ((strprop.h - ((pnum + 1) * strprop.sp))/pnum)/2, piece,'t1');
				//create a rec of 1/pnum height
				rect = FS.createSVG_rect('furnstrg',piece + 'but',
					strprop.x + strprop.sp,
					strprop.y + ((i + 1) * strprop.sp) + ((strprop.h - ((pnum + 1) * strprop.sp))/pnum * i),
					strprop.w - (2 * strprop.sp),
					(strprop.h - ((pnum + 1) * strprop.sp))/pnum,'c6',{'mousedown': FS.startDrag});
				//give it a distinct colour
				FS.setSVG_attr(rect.id, 'style','fill:' + FS.pieces[piece].c);

				i++;
			}
			
			//mousemove detection for SVG
			var svg_bg = document.getElementById('p7svg');
			if(svg_bg.addEventListener) {
				svg_bg.addEventListener('mousemove', FS.dragging, false);
			}

			
			//DO NEXT
			//on move, drag and check snapping (do snapping last)
			//on release drop

			//on drop need to add snap lines to list
			//new furniture items need to be moveable/rotateable

			//--------------- End of laying out furniture section -------------------------
			break;
		case 7:
			//show page 7 - the import textfield
			$('#p7').show();

			//show buttons
			$('.bbut').show();
			$('#bflow').html('Cancel');
			$('#fflow').html('Submit');
			break;
	}
	
	//tidy up, always clear the following page errors
	if(page < 7) {
		FS.warn.clear(page + 1);
	}
};

//determines where to redirect the user based on directional button click
FS.flow = function(moveForward) {
	var response;

	//reset button labels to default
	$('#bflow').html('back');
	$('#fflow').html('next');

	switch(FS.page) {
		case 6:
			if(moveForward) {
				print();
				FS.wndwSelect(FS.page);
			} else {
				FS.wndwSelect(FS.page - 1);
			}
			break;
		case 7:
			if(moveForward) {
				FS.wndwSelect(6);
			} else { //move backwards
				FS.wndwSelect(1);
			}

			break;
		default:
			if(moveForward) {
				FS.wndwSelect(FS.page + 1);
			} else { //move backwards
				FS.wndwSelect(FS.page - 1);
			}
			break
	}

};

//during initialization sets the visibility of appropriate items
FS.setItemVisibility = function() {

	//hide the non-relevant pages
	$("#p2").hide();
	$("#p3").hide();
	$("#p4").hide();
	$("#p5").hide();
	$("#p6").hide();
	$("#p7").hide();
	$("#p8").hide();

	//hide warning area
	FS.warn.hide();

	//hide the two buttons
	$('.bbut').hide();	
};

//gets some of the global constants from the SVG canvases
FS.getGlobalConst = function() {
	//holds the dimensions of the SVG canvas for p3
	FS.p3canvas = {};
	FS.p3canvas.w = parseInt(FS.getSVG_attr('p3svg','width'), 10);
	FS.p3canvas.h = parseInt(FS.getSVG_attr('p3svg','height'), 10);

	FS.p7stage = {};
	FS.p7stage.w = parseInt(FS.getSVG_attr('p7stg','width'), 10);
	FS.p7stage.h = parseInt(FS.getSVG_attr('p7stg','height'), 10);

	FS.p7storage = {};
	FS.p7storage.w = parseInt(FS.getSVG_attr('p7str','width'), 10);
	FS.p7storage.h = parseInt(FS.getSVG_attr('p7str','height'), 10);

	FS.p7garb = {};
	FS.p7garb.x = FS.getSVG_int_attr('p7garb','x');
	FS.p7garb.y = FS.getSVG_int_attr('p7garb','y');
};

//on page load initialize fs
window.onload = function() {
	
	//set visibility at start
	FS.setItemVisibility();

	//get some global values from html
	FS.getGlobalConst();
	
};

/***************** COLLECTION FUNCTIONS *****************/
	
	var where=function(array,predicate)
	{
		var retVal=[];
		for(var i in array)
		{
			var item=array[i];
			if(predicate(item)) retVal.push(item)
		}
		
		if(retVal.length>0) return retVal;
	}
	
	var first=function(array,predicate)
	{
		if(predicate instanceof Function)
		{
			var retArray=where(array,predicate);
			if(retArray) return retArray[0];
		} else if(array && array.length>0) return array[0];
	}
	
	var last=function(array,predicate)
	{
		if(predicate instanceof Function)
		{
			var retArray=where(array,predicate);
			if(retArray) return retArray[retArray.length-1];
		} else if(array && array.length>0) return array[array.length-1];
	}
	
	var each=function(array,func)
	{
		var length=array.length;
		for(var i=0;i<length;i++)
		{
			func(array[i]);
		}
	}

/***************** STRING FUNCTIONS *****************/
	
	var join=function()
    {
    	return arguments.length ? Array.prototype.slice.call(arguments).join('') : '';
    }
	

/***************** ALERT/CONSOLE *****************/
	
	//Adds console functions to browsers that don't support them
	{(function()
	{
	    var method;
	    var noop = function () {};
	    var methods = [
	        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
	        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
	        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
	        'timeStamp', 'trace', 'warn'
	    ];
	    var length = methods.length;
	    var console = (window.console = window.console || {});

	    while (length--)
	    {
	        method = methods[length];
	        if (!console[method]) console[method] = noop;
	    }
	}())};
	
	//Multi-alert function _alert(1,2,3);
	var _alert=function()
	{
		alert(Array.prototype.slice.call(arguments).join(', '));
	};

/***************** PROTOTYPE FUNCTIONS *****************/

	if(!Array.prototype.indexOf)
	{
	    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
	        "use strict";
	        if (this == null) {
	            throw new TypeError();
	        }
	        var t = Object(this);
	        var len = t.length >>> 0;
	        if (len === 0) {
	            return -1;
	        }
	        var n = 0;
	        if (arguments.length > 1) {
	            n = Number(arguments[1]);
	            if (n != n) { // shortcut for verifying if it's NaN
	                n = 0;
	            } else if (n != 0 && n != Infinity && n != -Infinity) {
	                n = (n > 0 || -1) * Math.floor(Math.abs(n));
	            }
	        }
	        if (n >= len) {
	            return -1;
	        }
	        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
	        for (; k < len; k++) {
	            if (k in t && t[k] === searchElement) {
	                return k;
	            }
	        }
	        return -1;
	    }
	}

	if ( 'function' !== typeof Array.prototype.reduce ) {
	  Array.prototype.reduce = function( callback /*, initialValue*/ ) {
	    'use strict';
	    if ( null === this || 'undefined' === typeof this ) {
	      throw new TypeError(
	         'Array.prototype.reduce called on null or undefined' );
	    }
	    if ( 'function' !== typeof callback ) {
	      throw new TypeError( callback + ' is not a function' );
	    }
	    var t = Object( this ), len = t.length >>> 0, k = 0, value;
	    if ( arguments.length >= 2 ) {
	      value = arguments[1];
	    } else {
	      while ( k < len && ! k in t ) k++; 
	      if ( k >= len )
	        throw new TypeError('Reduce of empty array with no initial value');
	     value = t[ k++ ];
	    }
	    for ( ; k < len ; k++ ) {
	      if ( k in t ) {
	         value = callback( value, t[k], k, t );
	      }
	    }
	    return value;
	  };
	}

	if(!String.prototype.trim)
	{
		String.prototype.trim=function()
		{
			var str=(this instanceof String) ? this : this.toString();
		    return str.replace(/^\s+|\s+$/g,'');
		}
	}

	if(typeof Date.prototype.toJSON !== 'function')
	{
		Date.prototype.toJSON = function (key)
		{
		    return isFinite(this.valueOf())
		        ? this.getUTCFullYear()             + '-' +
		            f(this.getUTCMonth() + 1)       + '-' +
		            f(this.getUTCDate())            + 'T' +
		            f(this.getUTCHours())           + ':' +
		            f(this.getUTCMinutes())         + ':' +
		            f(this.getUTCSeconds())         + /*added - start*/ '.'+
		            f(this.getUTCMilliseconds())    + /*added - end*/ 'Z'
		        : null;
		};

		String.prototype.toJSON =
		Number.prototype.toJSON =
		Boolean.prototype.toJSON = function (key)
		{
			if(this) return ((typeof this.valueOf === 'function') ? this.valueOf() : this.toString());
		};
	}
	
	/**
	 * Shim for "fixing" IE's lack of support (IE < 9) for applying slice
	 * on host objects like NamedNodeMap, NodeList, and HTMLCollection
	 * (technically, since host objects have been implementation-dependent,
	 * at least before ES6, IE hasn't needed to work this way).
	 * Also works on strings, fixes IE < 9 to allow an explicit undefined
	 * for the 2nd argument (as in Firefox), and prevents errors when
	 * called on other DOM objects.
	 */
	(function () {
	    'use strict';
	    var _slice = Array.prototype.slice;

	    try {
	        // Can't be used with DOM elements in IE < 9
	        _slice.call(document.documentElement);
	    } catch (e) { // Fails in IE < 9
	        // This will work for genuine arrays, array-like objects, 
	        // NamedNodeMap (attributes, entities, notations),
	        // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
	        // and will not fail on other DOM objects (as do DOM elements in IE < 9)
	        Array.prototype.slice = function (begin, end) {
	            // IE < 9 gets unhappy with an undefined end argument
	            end = (typeof end !== 'undefined') ? end : this.length;

	            // For native Array objects, we use the native slice function
	            if (Object.prototype.toString.call(this) === '[object Array]'){
	                return _slice.call(this, begin, end); 
	            }
	            
	            // For array like object we handle it ourselves.
	            var i, cloned = [],
	                size, len = this.length;
	            
	            // Handle negative value for "begin"
	            var start = begin || 0;
	            start = (start >= 0) ? start: len + start;
	            
	            // Handle negative value for "end"
	            var upTo = (end) ? end : len;
	            if (end < 0) {
	                upTo = len + end;
	            }
	            
	            // Actual expected size of the slice
	            size = upTo - start;
	            
	            if (size > 0) {
	                cloned = new Array(size);
	                if (this.charAt) {
	                    for (i = 0; i < size; i++) {
	                        cloned[i] = this.charAt(start + i);
	                    }
	                } else {
	                    for (i = 0; i < size; i++) {
	                        cloned[i] = this[start + i];
	                    }
	                }
	            }
	            
	            return cloned;
	        };
	    }
	}());
	
	if (!Array.prototype.filter) {
	  Array.prototype.filter = function(fun/*, thisArg*/) {
	    'use strict';

	    if (this === void 0 || this === null) {
	      throw new TypeError();
	    }

	    var t = Object(this);
	    var len = t.length >>> 0;
	    if (typeof fun !== 'function') {
	      throw new TypeError();
	    }

	    var res = [];
	    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
	    for (var i = 0; i < len; i++) {
	      if (i in t) {
	        var val = t[i];

	        // NOTE: Technically this should Object.defineProperty at
	        //       the next index, as push can be affected by
	        //       properties on Object.prototype and Array.prototype.
	        //       But that method's new, and collisions should be
	        //       rare, so use the more-compatible alternative.
	        if (fun.call(thisArg, val, i, t)) {
	          res.push(val);
	        }
	      }
	    }

	    return res;
	  };
	}
	
	if (!String.prototype.startsWith) {
	    String.prototype.startsWith = function(searchString, position){
	      position = position || 0;
	      return this.substr(position, searchString.length) === searchString;
	  };
	}
	
	if (!String.prototype.endsWith) {
	  String.prototype.endsWith = function(searchString, position) {
	      var subjectString = this.toString();
	      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
	        position = subjectString.length;
	      }
	      position -= searchString.length;
	      var lastIndex = subjectString.lastIndexOf(searchString, position);
	      return lastIndex !== -1 && lastIndex === position;
	  };
	}
	
	if (!String.prototype.includes) {
	  String.prototype.includes = function(search, start) {
	    'use strict';
	    if (typeof start !== 'number') {
	      start = 0;
	    }
	    
	    if (start + search.length > this.length) {
	      return false;
	    } else {
	      return this.indexOf(search, start) !== -1;
	    }
	  };
	}
	
/***************** USE TO SEPARATE *****************/

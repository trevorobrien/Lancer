!function(){function t(t){return t.replace(/^\s\s*/,"").replace(/\s\s*$/,"")}var n={},e="ad",r="https://ct.pinterest.com/v3/",i="cb",o="event",a="ed",u="ov",c="tid";n.a=JSON&&JSON.stringify,n.activate=function(){if(window.pintrk&&window.pintrk.queue){var e=window.pintrk.queue;if(e.push===Array.prototype.push){for(var r=function(e){var r=e.shift();"string"==typeof r&&(r=t(r.toLowerCase()),n[r]&&n[r](e))},i=e.length,o=0;i>o;o++)r(e.shift());e.push=r}}},n.load=function(n){var e=n.shift();"string"!=typeof e&&"number"!=typeof e||(window.pintrk.tagId=t(String(e)))},n.page=function(t){var e=[];if(tagId=window.pintrk.tagId,tagId){e.push([c,tagId]);var r=t.shift();r&&"object"==typeof r&&e.push([u,r]),n.b(e)}},n.track=function(e){var r=[],i=e.shift();i&&"string"==typeof i&&r.push([o,t(i)]);var f=e.shift();f&&"object"==typeof f&&r.push([a,f]);var d=e.shift();"function"!=typeof d&&(d=null);var p=e.shift();if(null==p&&(p=window.pintrk.tagId),"string"!=typeof p&&"number"!=typeof p)return d&&d(!1,"The tag ID is missing."),0;r.push([c,t(String(p))]);var s=e.shift();return s&&"object"==typeof s&&r.push([u,s]),n.b(r,d),0},n.b=function(t,r){t.push([e,n.c()]),t.push([i,n.d()]);var o=n.e(t),a=n.f(o);a.length<2048?n.g(a,r):n.h(o,r)},n.d=function(){var t=new Date;return t.getTime()},n.f=function(t){for(var n=r+"?",e=[],i=0;i<t.length;i++)e.push(t[i][0]+"="+encodeURIComponent(t[i][1]));return n+e.join("&")},n.e=function(t){for(var e=[],r=0;r<t.length;r++){var i=t[r][1];"object"==typeof i?n.a&&e.push([t[r][0],JSON.stringify(i)]):e.push([t[r][0],i])}return e},n.c=function(){var t=null,n=null;return screen&&(t=screen.height,n=screen.width),{loc:location.href,ref:document.referrer,"if":window.top!==window,sh:t,sw:n}},n.i=function(t,n){var e=function(){t.detachEvent?t.detachEvent("onload",findAndDetach):t.onload=null,n()};t.attachEvent?t.attachEvent("onload",e):t.onload=e},n.g=function(t,e){var r=document.createElement("img");return r.src=t,n.i(r,function(){e&&e(!0)}),r},n.h=function(t,e){var i=document.createElement("form");i.method="post",i.action=r,i.acceptCharset="utf-8",i.style.display="none";var o="pintrk"+n.d();i.target=o;var a=!(!window.attachEvent||window.addEventListener),u=a?'<iframe name="'+o+'">':"iframe",c=document.createElement(u);c.src="",c.id=o,c.name=o,i.appendChild(c);var f=function(){for(var r=0;r<t.length;r++){var o=document.createElement("input");o.name=t[r][0],o.value=t[r][1],i.appendChild(o)}n.i(c,function(){i.parentNode.removeChild(i),e&&e(!0)}),i.submit()};n.i(c,f);var d=function(){document.body.appendChild(i)};return"complete"===document.readyState?d():n.i(window,d),i},n.activate()}();
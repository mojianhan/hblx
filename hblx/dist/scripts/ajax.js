define(["exports"],function(e){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},u=new XMLHttpRequest;function i(t,e,n){if(Array.isArray(e))e.forEach(function(e,o){/\[\]$/.test(t)?n(t,e):i(t+"["+("object"===(void 0===e?"undefined":r(e))&&null!=e?o:"")+"]",e,n)});else if("object"===(void 0===e?"undefined":r(e)))for(var o in e)i(t+"["+o+"]",e[o],n);else n(t,e)}function c(e){var n=[];if(Array.isArray(e))e.forEach(function(e,o){t(o,e)});else for(var o in e)i(o,e[o],t);function t(e,o){var t="function"==typeof o?o():o;n[n.length]=encodeURIComponent(e)+"="+encodeURIComponent(null==t?"":t)}return n.join("&")}e.default=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},o=e.url,t=void 0===o?"":o,n=e.method,r=void 0===n?"GET":n,i=e.data,f=void 0===i?{}:i;return HOST&&(t=HOST+t),"GET"===r&&(t+="?"+c(f)),new Promise(function(e){var o;u.open(r,t),"POST"===r&&(o=f,"[object FormData]"!==Object.prototype.toString.call(o)&&u.setRequestHeader("Content-type","application/x-www-form-urlencoded")),u.onreadystatechange=function(){4===u.readyState&&e(u)},"GET"===r?u.send(null):u.send(c(f))})}});
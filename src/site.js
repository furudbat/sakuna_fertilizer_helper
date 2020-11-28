/*global require, exports, module */
/*global localStorage, console, clearTimeout, setTimeout, $, window, CodeMirrorSpellChecker, CodeMirror, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify */
/*global site, USE_CACHE */
'use strict';

/// https://stackoverflow.com/questions/13639464/javascript-equivalent-to-pythons-format
String.prototype.format = function () {
    var args = arguments;
    var unkeyed_index = 0;
    return this.replace(/\{(\w*)\}/g, (match, key) => {
        if (key === '') {
            key = unkeyed_index;
            unkeyed_index++;
        }
        if (key == +key) {
            return (args[key] !== 'undefined') ? args[key] : match;
        } else {
            for (var i = 0; i < args.length; i++) {
                if (typeof args[i] === 'object' && typeof args[i][key] !== 'undefined') {
                    return args[i][key];
                }
            }
            return match;
        }
    });
};

/// https://stackoverflow.com/questions/19491336/how-to-get-url-parameter-using-jquery-or-plain-javascript
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

var isOnScreen = function (element, factor_width = 1.0, factor_height = 1.0) {
    var win = $(window);
    var viewport = {
        top: win.scrollTop(),
        left: win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    var bounds = $(element).offset();
    bounds.right = bounds.left + ($(element).outerWidth() * factor_width);
    bounds.bottom = bounds.top + ($(element).outerHeight() * factor_height);

    //console.debug('isOnScreen', viewport, bounds);
    //console.debug('isOnScreen', bounds.left >= viewport.left, bounds.top >= viewport.top, bounds.right <= viewport.right, bounds.bottom <= viewport.bottom);

    return !(bounds.left >= viewport.left && bounds.top >= viewport.top && bounds.right <= viewport.right && bounds.bottom <= viewport.bottom);
};

var countlines = function (str) {
    return (str !== null && str !== "") ? str.split(/\r\n|\r|\n/).length : 0;
};


/// https://css-tricks.com/snippets/javascript/bind-different-events-to-click-and-double-click/
var makeDoubleClick = function (element, doDoubleClickAction, doClickAction) {
    var timer = 0;
    var delay = 250;
    var prevent = false;

    element.on('click', function (e) {
        var that = this;
        timer = setTimeout(() => {
            if (!prevent) {
                doClickAction(that);
            }
            prevent = false;
        }, delay);
    }).on('dblclick', function (e) {
        clearTimeout(timer);
        prevent = true;
        doDoubleClickAction(this);
    });
};

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

function clamp (num, a, b) {
    return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b)); 
}

module.exports = {
    site,
    USE_CACHE,
    getUrlParameter,
    isOnScreen,
    countlines,
    makeDoubleClick,
    clamp
};
/*
   Copyright (c) 2011 Ivo Wetzel.

   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in
   all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   THE SOFTWARE.
*/

(function(undefined) {
    'use strict';

    // match {} placholders like {0}, {name}, {} and the inner "{{foo}}"
    // {} can be escaped with \
    var replaceExp = /([^\\]|^)\{([^\{\}]*[^\\^\}]|)\}/g,

        // match thins like: foo[0].test["test"]['test]
        accessExp = /^\.?([^\.\[]+)|\[((-?\d+)|('|")(.*?[^\\])\4)\]/,

        // match :foo and :foo(.*?)
        formatExp = /\:([a-zA-Z]+)(\((.*?)\))?$/,

        // match arguments: "test", 12, -12, 'test', true, false
        // strings can contain escaped characters like \"
        argumentsExp = /^(,|^)\s*?((true|false|(-?\d+))|('|")(.*?([^\\]|\5))\5)/;

    // Formatter factory
    function Formatter(formats) {
        var formatters = extend({}, defaultFormats, formats);
        function f() {
            return format(formatters, arguments);
        }
        return f;
    }

    // Main formatting function
    function format(formatters, args) {

        // Setup magic!
        var string = args[0],
            first = args[1],
            argsLength = args.length - 2,
            type = first != null ? {}.toString.call(first).slice(8, -1) : '',
            arrayLength = first ? first.length - 1 : 0,
            autoIndex = 0;

        function replace(value, pre, id) {

            // Extract formatters
            var formats = [], format = null;
            while (format = id.match(formatExp)) {
                id = id.substring(0, format.index);
                formats.unshift(format);
            }

            // In case of a valid number use it for indexing
            var num = (isNaN(+id) || id === '') ? null : +id;

            // Handle objects
            if (type === 'Object' && id !== '') {

                // Handle plain keys
                if (id.indexOf('.') === -1 && id.indexOf('[') === -1) {
                    if (first[id] !== undefined) {
                        value = first[id];

                    // fall back to obj.toString()
                    } else {
                        value = args[1 + autoIndex];
                    }

                // Access properties
                } else {
                    value = getProperty(first, id);
                }

            // Handle given array indexes
            } else if (type === 'Array' && num !== null) {
                value = first[num >= 0 ? num : arrayLength + num];

            // Handle given arguments indexes
            } else if (num !== null) {
                value = args[1 + (num >= 0 ? num : argsLength + num)];

            // Handle automatic arguments indexes
            } else {
                value = args[1 + autoIndex];
            }
            autoIndex++;

            // Apply formats
            while (format = formats.shift()) {
                var method = formatters[format[1]];
                if (method) {
                    value = method.apply(formatters,
                                         getArguments(value, format[3] || ''));

                } else {
                    throw new FormatError(
                        replace, 'Undefined formatter "{}".', format[1]
                    );
                }
            }
            return pre + value;
        }
        return string.replace(replaceExp, replace);
    }

    // Default formatters
    var defaultFormats = {
        repeat: function(value, count) {
            return new Array((count || 0) + 1).join(value || ' ');
        },

        join: function(value, str) {
            return value.join(str || ', ');
        },

        upper: function(value) {
            return value.toUpperCase();
        },

        lower: function(value) {
            return value.toLowerCase();
        },

        lpad: function(value, length, str) {
            value = '' + value;
            return this.repeat(str || ' ', length - value.length) + value;
        },

        rpad: function(value, length, str) {
            value = '' + value;
            return value + this.repeat(str || ' ', length - value.length);
        },

        pad: function(value, length, str) {
            var len = length - ('' + value).length;
            str = str || ' ';
            return this.repeat(str, len - ~~(len / 2))
                   + '' + value
                   + this.repeat(str, ~~(len / 2));
        },

        surround: function(value, left, right) {
            return left + value + (right || left);
        },

        hex: function(value, lead) {
            return (lead ? '0x' : '') + value.toString(16);
        },

        bin: function(value, lead) {
            return (lead ? '0b' : '') + value.toString(2);
        }
    };

    // Get a specific peoperty of an object based on a accessor string
    function getProperty(obj, id) {
        var m, pos = 0;
        while (m = id.substring(pos).match(accessExp)) {
            // .name  / [0] / ["test"]
            var prop = m[1] || (m[3] ? +m[3] : m[5].replace('\\' + m[4], m[4]));
            if (obj === undefined) {
                throw new FormatError(
                    getProperty,
                    'Cannot access property "{}" of undefined.', prop
                );

            } else {
                obj = obj[prop];
            }
            pos += m[0].length;
        }
        return obj;
    }

    // Convert a string like:
    //   true, false, -1, 34, 'foo', "bla\" foo"
    //
    // Into a  list of arguments:
    //   [true, false, -1, 34, 'foo', 'bla" foo']
    function getArguments(value, string) {
        var m = '', pos = 0, args = [value];

        while (m = string.substring(pos).match(argumentsExp)) {
            // number
            args.push(m[4] ? +m[4]
                           // boolean
                           : (m[3] ? m[3] === 'true'
                                   // string
                                   : m[6].replace('\\' + m[5], m[5])));

            pos += m[0].length;
        }
        return args;
    }

    // Formatting error type
    function FormatError(func, msg, value) {
        this.name = 'FormatError';
        this.message = format(defaultFormats, [msg, value]);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, func);
        }
    }
    FormatError.prototype = new Error();

    // Helpers
    function extend(obj) {
        for(var i = 1; i < arguments.length; i++) {
            var props = arguments[i];
            for(var e in props) {
                if (props.hasOwnProperty(e)) {
                    obj[e] = props[e];
                }
            }
        }
        return obj;
    }

    // Exports
    extend(typeof window === 'undefined' ? exports : window, {
        Formatter: Formatter,
        FormatError: FormatError
    });
})();


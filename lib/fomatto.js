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

    // Formatter factory
    function Formatter(formats) {
        function f() {
            return format(f.formats, arguments);
        }
        f.formats = formats || {};
        return f;
    }

    // Default formatters
    Formatter.formats = {
        repeat: repeat,

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
            return pad(value, length, str, 'l');
        },

        rpad: function(value, length, str) {
            return pad(value, length, str, 'r');
        },

        pad: function(value, length, str) {
            return pad(value, length, str);
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

    function repeat(value, count) {
        return new Array((count || 0) + 1).join(value || ' ');
    }

    function pad(value, length, str, mode) {
        value = '' + value;
        var len = length - value.length,
            half = ~~(len / 2);

        if (len < 0) {
            return value;
        }

        var padding = repeat(str, len);
        return mode === 'l' ? padding + value
                            : mode === 'r' ? value + padding
                                           : repeat(str, len - half)
                                             + value + repeat(str, half);
    }

    // match {} placholders like {0}, {name}, {} and the inner "{{foo}}"
    // {} can be escaped with \
    var replaceExp = /([^\\]|^)\{([^\{\}]*[^\\^\}]|)\}/g,

        // match things like: foo[0].test["test"]['test]
        accessExp = /^\.?([^\.\[]+)|\[((-?\d+)|('|")(.*?[^\\])\4)\]/,

        // match :foo and :foo(.*?) but make sure to not greedy match :foo():bla()
        formatExp = /\:([a-zA-Z]+)(\((.*?)\))?(\:|$)/,

        // match arguments: "test", 12, -12, 'test', true, false
        // strings can contain escaped characters like \"
        argumentsExp = /^(,|^)\s*?((true|false|(-?\d+))|('|")(.*?([^\\]|\5))\5)/;

    // Main formatting function
    function format(formatters, args) {

        // Setup magic!
        var string = args[0],
            first = args[1],
            argsLength = args.length - 2,
            type = first != null ? {}.toString.call(first).slice(8, -1) : '',
            arrayLength = first ? first.length - 1 : 0,
            autoIndex = 0;

        function replace(value, pre, form) {

            // Extract formatters
            var formats = [], format = null, id = form;
            while (format = form.match(formatExp)) {
                if (!formats.length) {
                    id = form.substring(0, format.index);
                }
                form = form.substring(format[0].length - 1);
                formats.push(format);
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
                var method = (formatters[format[1]] ?
                                 formatters : Formatter.formats)[format[1]];

                if (method) {
                    value = method.apply(undefined,
                                         getArguments(value, format[3] || ''));

                } else {
                    throw new FormatError(replace, 'Undefined formatter "{}".',
                                          format[1]);
                }
            }
            return pre + value;
        }
        return string.replace(replaceExp, replace);
    }

    // Get a specific peoperty of an object based on a accessor string
    function getProperty(obj, id) {
        var m, pos = 0;
        while (m = id.substring(pos).match(accessExp)) {
            // .name         / [0]           / ["t\"est"]
            var prop = m[1] || (m[3] ? +m[3] : m[5].replace('\\' + m[4], m[4]));
            if (obj === undefined) {
                throw new FormatError(getProperty,
                                      'Cannot access property "{}" of undefined.',
                                      prop);

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
        var m, pos = 0, args = [value];
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
        this.message = format(Formatter.formats, [msg, value]);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, func);
        }
    }
    FormatError.prototype = new Error();

    // Exports
    var exp = typeof window === 'undefined' ? exports : window;
    exp.Formatter = Formatter;
    exp.FormatError = FormatError;
})();


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
    var numberExp = /^\-?\d{1,}$/,
        formatExp = /\:([a-zA-Z]+)(\((.*?)\))?$/,
        replaceExp = /\{([^\}]*)\}/g,
        accessExp = /^\.?([^\.\[]+)|\[((-?\d+)|('|")(.*?[^\\])\4)\]/,
        argumentsExp = /^,\s*?((true|false|(-?\d+))|('|")(.*?([^\\]|\4))\4)/;

    // Formatter factory
    function Formatter(formats) {
        var formatters = addon(addon(defaultFormats), formats);
        function f() {
            return format.apply(formatters, arguments);
        }
        return f;
    }

    // Main formatting function
    function format(string) {
        if (string.indexOf('{') === -1) {
            return string;
        }

        var list = arguments,
            first = list[1],
            listLength = list.length - 2,
            obj = is('Object', first) ? first : null,
            array = is('Array', first) ? first : null,
            arrayLength = array ? array.length - 1 : 0,
            autoIndex = 0,
            formatters = this;

        function replace(value, id, offset) {

            // Extract formats
            var formats = [], format = null;
            while (format = id.match(formatExp)) {
                id = id.substring(0, format.index);
                formats.unshift(format);
            }

            // Replace
            var num = numberExp.test(id) ? +id : null;
            if (obj && id !== '') {

                // Handle simple keys
                if (id.indexOf('.') === -1 && id.indexOf('[') === -1) {
                    if (obj[id] !== undefined) {
                        value = obj[id];

                    // fall back to toString()
                    } else {
                        value = list[1 + autoIndex];
                    }

                } else {
                    value = getProperty(obj, id);
                }

            // Handle given array indexes
            } else if (array && num !== null) {
                value = array[num >= 0 ? num : arrayLength + num];

            // Handle given arguments indexes
            } else if (num !== null) {
                value = list[1 + (num >= 0 ? num : listLength + num)];

            // Handle automatic arguments indexes
            } else {
                value = list[1 + autoIndex];
            }
            autoIndex++;

            // Apply formats
            while (format = formats.shift()) {
                var method = formatters[format[1]];
                if (method) {
                    var args = getArguments(value, format[3] || '');
                    value = method.apply(formatters, args);

                } else {
                    throw new FormatError(
                        replace, ['Undefined formatter "{}".', format[1]]
                    );
                }
            }
            return value;
        }
        return string.replace(replaceExp, replace);
    }

    // Default formatting options
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
            return this.repeat(str || ' ', length - value.length) + '' + value;
        },

        rpad: function(value, length, str) {
            return value + '' + this.repeat(str || ' ', length - value.length);
        },

        pad: function(value, length, str) {
            var len = length - value.length;
            return this.repeat(str || ' ', len - ~~(len / 2))
                   + '' + value + ''
                   + this.repeat(str || ' ', ~~(len / 2));
        },

        surround: function(value, left, right) {
            return left + value + (right || left);
        },

        hex: function(value, lead) {
            return (lead ? '0x' : '') + value.toString(16);
        },

        bin: function(value, lead) {
            var num = '';
            return (lead ? '0b' : '') + value.toString(2);
        }
    };

    // Get a specific peoperty of an object based on a accessor string
    function getProperty(obj, id) {
        var m, pos = 0;
        while (m = id.substring(pos).match(accessExp)) {
            var prop = m[1] || (m[3] ? +m[3] : m[5].replace('\\' + m[4], m[4]));
            if (obj === undefined) {
                throw new FormatError(
                    getProperty,
                    ['Cannot access property "{}" of undefined.', prop]
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

        string = ',' + string;
        while (m = string.substring(pos).match(argumentsExp)) {
            // number
            args.push(m[3] ? +m[3]
                           // boolean
                           : (m[2] ? m[2] === 'true'
                                   // string
                                   : m[5].replace('\\' + m[4], m[4])));

            pos += m[0].length;
        }
        return args;
    }

    function is(type, obj) {
        return obj !== null && obj !== undefined
               && Object.prototype.toString.call(obj).slice(8, -1) === type;
    }

    function addon(props, obj) {
        obj = obj || {};
        for(var i in props) {
            if (props.hasOwnProperty(i)) {
                obj[i] = props[i];
            }
        }
        return obj;
    }

    function FormatError(func, msg) {
        this.name = 'FormatError';
        this.message = format.apply(defaultFormats, msg);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, func);
        }
    }
    FormatError.prototype = new Error();

    addon({
        Formatter: Formatter,
        FormatError: FormatError,
        format: Formatter()

    }, typeof window === 'undefined' ? exports : window);
})();


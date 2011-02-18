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
    var numberExp = /^\-?\d{1,}$/;
    var formatExp = /\:([a-zA-Z]+)(\((.*?)\))?$/;
    var replaceExp = /\{([^\}]*)\}/g;

    // Formatter factory
    function Formatter(formats) {
        function f() {
            return format.apply(f, arguments);
        }
        f.formatters = extend(extend({}, format.formatters), formats || {});
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
            formatters = this.formatters;

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
                    value = method.apply(formatters,
                                         getArguments(value, format[3] || ''));

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
    format.formatters = {
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

    // Get the property accessors of a format id
    function getProperty(obj, id) {
        var accessExp = /\.?([^\.\[]+)|\[(\d+|('|")[^\3]+\3)\]/g,
            m;

        while (m = accessExp.exec(id)) {
            var prop = m[1] || (numberExp.test(m[2]) ? m[2] : m[2].slice(1, -1));
            if (obj === undefined) {
                throw new FormatError(
                    getProperty,
                    ['Can\'t access property "{}" of undefined.', prop]
                );

            } else {
                obj = obj[prop];
            }
        }
        return obj;
    }

    // Convert a string like "34, 'foo'" into a  list of arguments
    function getArguments(value, str) {
        var args = [value], string = null, number = true,
            value = '', escaped = false;

        for(var i = 0, l = str.length + 1; i < l; i++) {
            var cur = str.charAt(i),
                slash = !escaped && cur === '\\';

            // add a new argument to the list
            if (!string && value !== ''
                && (cur === ',' || i === l - 1)) {

                if (value === 'true' || value === 'false') {
                    args.push(value === 'true');

                } else {
                    args.push(number ? +value : value);
                }
                value = '';
                number = true;
            }

            // end strings
            if (cur === string && !escaped) {
                string = null;
                number = false;

            // start strings
            } else if (!escaped && (cur === '"' || cur === "'")) {
                string = cur;

            // no escape slashed, all in string otherwise only numbers
            } else if (!slash && ((cur !== ',' && cur !== ' ') || string)) {
                value += cur;
            }
            escaped = string && slash;
        }
        return args;
    }

    function is(type, obj) {
        return obj !== null && obj !== undefined
               && Object.prototype.toString.call(obj).slice(8, -1) === type;
    }

    function extend(obj, props) {
        for(var i in props) {
            if (props.hasOwnProperty(i)) {
                obj[i] = props[i];
            }
        }
        return obj;
    }

    function FormatError(func, msg) {
        this.name = 'FormatError';
        this.message = format.apply(format, msg);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, func);
        }
    }
    FormatError.prototype = new Error();

    extend(typeof window === 'undefined' ? exports : window, {
        Formatter: Formatter,
        FormatError: FormatError,
        format: Formatter()
    })
})();


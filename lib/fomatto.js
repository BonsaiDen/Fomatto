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
        if (!string) {
            return '';
        }

        var list = arguments,
            listLength = list.length - 2,
            obj = is('Object', list[1]) ? list[1] : null,
            array = is('Array', list[1]) ? list[1] : null,
            arrayLength = array ? array.length - 1 : 0,
            num = undefined,
            pos = 0,
            formatters = this.formatters;

        function replace(value, id, offset) {

            // Extract formatting options
            var formats = [], format = null;
            while (format = id.match(formatExp)) {
                id = id.substring(0, format.index);
                formats.unshift(format);
            }
            num = numberExp.test(id) ? +id : undefined;

            // Handle Objects
            if (obj && id !== '') {

                // Handle simple keys
                if (id.indexOf('.') === -1 && id.indexOf('[') === -1) {

                    // Only replace defined keys so we handle toString() of
                    // objects fine
                    if (obj[id] !== undefined) {
                        value = obj[id];
                    }

                } else {
                    value = getProperty(obj, id);
                }

            // Handle given array indexes
            } else if (array && num !== undefined) {
                value = array[num >= 0 ? num : arrayLength + num];

            // Handle automatic array indexes
            } else if (array && num === undefined) {
                value = array[pos];

            // Handle given arguments indexes
            } else if (num !== undefined) {
                value = list[1 + (num >= 0 ? num : listLength + num)];

            // Handle automatic arguments indexes
            } else {
                value = list[1 + pos];
            }
            pos++;

            // Apply formatters
            while(format = formats.shift()) {
                var method = formatters[format[1]],
                    args = format[3] || '';

                if (method) {
                    value = method.apply(formatters,
                                         getArguments(value, args));

                } else {
                    throw new FormatError(
                        replace, ['Undefined formatter "{}".', format[1]]
                    );
                }
            }
            return value;
        }
        return string.replace(/\{([^\}]*)\}/g, replace);
    }

    // Default formatting options
    format.formatters = {
        repeat: function(value, count) {
            return new Array(count + 1).join(value || '');
        },

        upper: function(value) {
            return value.toUpperCase();
        },

        lower: function(value) {
            return value.toLowerCase();
        },

        lpad: function(value, length, str) {
            return this.repeat(str, length - value.length) + value;
        },

        rpad: function(value, length, str) {
            return value + this.repeat(str, length - value.length);
        },

        pad: function(value, length, str) {
            var len = length - value.length,
                half = ~~(len / 2);

            return this.repeat(str, len - half)
                   + value
                   + this.repeat(str, half);
        },

        surround: function(value, start, end) {
            return start + value + end;
        }
    };

    // Get the property accessors of a format id
    function getProperty(obj, id) {
        var exp = /\.?([^\.\[]+)|\[(\d+|'[^']+'|"[^"]+")\]/g,
            m;

        while (m = exp.exec(id)) {
            var p = m[1] || (numberExp.test(m[2]) ? m[2] : m[2].slice(1, -1));
            if (obj === undefined) {
                throw new FormatError(
                    getProperty,
                    ['Can\'t access property "{}" of undefined.', p]
                );

            } else {
                obj = obj[p];
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
            if (!string && (cur === ',' || i === l - 1) && value !== '') {
                args.push(number ? +value : value);
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
            } else if (!slash && (/\d/.test(cur) || string)) {
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

    // FormatError Class
    function FormatError(func, msg) {
        this.name = 'FormatError';
        this.message = format.apply(format, msg);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, func);
        }
    }

    var err = function() {};
    err.prototype.constructor = FormatError;
    err.prototype = Error.prototype;

    FormatError.prototype = new err();
    FormatError.__proto__ = Error.prototype;

    // Exports
    var exp = (typeof window === 'undefined' ? exports : window);
    exp.Formatter = Formatter;
    exp.FormatError = FormatError;
})();


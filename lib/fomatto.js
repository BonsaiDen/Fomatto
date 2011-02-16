(function(undefined) {
    function _(string) {
        if (!string) {
            return '';
        }

        var list = arguments,
            listLength = list.length - 2,
            obj = is('Object', list[1]) ? list[1] : null,
            array = is('Array', list[1]) ? list[1] : null,
            arrayLength = array ? array.length - 1 : 0,
            numex = /^\-?\d{1,}$/,
            num = undefined,
            pos = 0;

        function replace(value, id, offset) {
            num = numex.test(id) ? +id : undefined;

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

            // Handle array joins
            } else if (array && id !== '') {
                value = array.join(id);

            // Handle given arguments indexes
            } else if (num !== undefined) {
                value = list[1 + (num >= 0 ? num : listLength + num)];

            // Handle automatic arguments indexes
            } else {
                value = list[pos + 1];
            }
            pos++;
            return value;
        }
        return string.replace(/\{([^\}]*)\}/g, replace);
    }

    function getProperty(obj, id) {
        var exp = /\.?([^\.\[]+)|\[(\d+|'[^']+'|"[^"]+")\]/g,
            m;

        while (m = exp.exec(id)) {
            var p = m[1] || m[2].replace(/["']/g, '');
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

    function is(type, obj) {
        return obj !== null && obj !== undefined
               && Object.prototype.toString.call(obj).slice(8, -1) === type;
    }

    function FormatError(func, msg) {
        this.name = 'FormatError';
        this.message = _.apply(null, msg);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, func);
        }
    }

    var err = function() {};
    err.prototype.constructor = FormatError;
    err.prototype = Error.prototype;

    FormatError.prototype = new err();
    FormatError.__proto__ = Error.prototype;

    var exp = (typeof window === 'undefined' ? exports : window);
    exp.format = _;
    exp.FormatError = FormatError;
})();


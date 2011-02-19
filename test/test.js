
// Setup
if (typeof window === 'undefined') {
    Formatter = require('./../lib/fomatto').Formatter;
    format = Formatter();
    FormatError = require('./../lib/fomatto').FormatError;

} else {
    exports = {};
    format = Formatter();
}


// Plain ------------------------------------------------------------------------
// ------------------------------------------------------------------------------
exports.testPlainNamed = function(test) {
    test.expect(2);
    test.equals(format('Good morning Sir {name}.', 'Lancelot'),
                'Good morning Sir Lancelot.');

    test.equals(format('Good {time} Sir {name}.', 'evening', 'Lancelot'),
                'Good evening Sir Lancelot.');

    test.done();
};

exports.testPlainAuto = function(test) {
    test.expect(3);
    test.equals(format('Good morning Sir {}.', 'Lancelot'),
                'Good morning Sir Lancelot.');

    test.equals(format('Good {} Sir {}.', 'evening', 'Lancelot'),
                'Good evening Sir Lancelot.');

    test.equals(format('Good {time} Sir {}.', 'evening', 'Lancelot'),
                'Good evening Sir Lancelot.');

    test.done();
};

exports.testPlainIndex = function(test) {
    test.expect(4);
    test.equals(format('Good morning Sir {0}.', 'Lancelot'),
                'Good morning Sir Lancelot.');

    test.equals(format('Good {0} Sir {1}.', 'evening', 'Lancelot'),
                'Good evening Sir Lancelot.');

    test.equals(format('Good {1} Sir {0}.', 'Lancelot', 'evening'),
                'Good evening Sir Lancelot.');

    test.equals(format('Good {-1} Sir {-2}.', 'Lancelot', 'evening', 'blue'),
                'Good evening Sir Lancelot.');

    test.done();
};

exports.testPlainMixed = function(test) {
    test.expect(3);
    test.equals(format('Good {time} Sir {1}.', 'evening', 'Lancelot'),
                'Good evening Sir Lancelot.');

    test.equals(format('Good {0} Sir {name}.', 'evening', 'Lancelot'),
                'Good evening Sir Lancelot.');

    test.equals(format('Good {0} Sir {}.', 'evening', 'Lancelot'),
                'Good evening Sir Lancelot.');

    test.done();
};


// Arrays -----------------------------------------------------------------------
// ------------------------------------------------------------------------------
exports.testArrayToString = function(test) {
    test.expect(2);
    test.equals(format('Good morning Sir {}.', ['Lancelot']),
                'Good morning Sir Lancelot.');
    test.equals(format('Good morning {}.', ['Sir', 'Lancelot']),
                'Good morning Sir,Lancelot.');

    test.done();
};

exports.testArrayIndex = function(test) {
    test.expect(3);
    test.equals(format('Good morning Sir {0}.', ['Lancelot']),
                'Good morning Sir Lancelot.');

    test.equals(format('Good {0} Sir {1}.', ['evening', 'Lancelot']),
                'Good evening Sir Lancelot.');

    test.equals(format('Good {-2} Sir {-1}.', ['evening', 'Lancelot', 'blue']),
                'Good evening Sir Lancelot.');

    test.done();
};


// Objects-----------------------------------------------------------------------
// ------------------------------------------------------------------------------
exports.testObjectAccess = function(test) {
    test.expect(4);
    test.equals(format('Good morning Sir {name}.', {name: 'Lancelot'}),
                'Good morning Sir Lancelot.');

    test.equals(format('Good {time} Sir {name}.', {time: 'evening',
                                                   name: 'Lancelot'}),
                'Good evening Sir Lancelot.');

    test.equals(format('Good morning Sir {0}.', {'0': 'Lancelot'}),
                'Good morning Sir Lancelot.');

    test.equals(format('Good {1} Sir {0}.', {'1': 'evening', '0': 'Lancelot'}),
                'Good evening Sir Lancelot.');

    test.done();
};

exports.testObjectToString = function(test) {
    var knight = {
        toString: function() {
            return 'Sir Lancelot';
        }
    };

    test.expect(3);
    test.equals(format('Good morning {knight}.', knight),
                'Good morning Sir Lancelot.');

    test.equals(format('Good morning {0}.', knight),
                'Good morning Sir Lancelot.');

    test.equals(format('Good morning {}.', knight),
                'Good morning Sir Lancelot.');

    test.done();
};


// Property Access --------------------------------------------------------------
// ------------------------------------------------------------------------------
exports.testPropertyAccess = function(test) {
    test.expect(4);
    test.equals(format('Good {msg.time} Sir {msg.name}.', {
        msg: {
            name: 'Lancelot',
            time: 'morning'
        }
    }), 'Good morning Sir Lancelot.');

    test.equals(format('Good {msg.time} Sir {msg.name}.', {
        msg: {
            name: 'Lancelot',
            time: 'evening'
        }
    }), 'Good evening Sir Lancelot.');

    test.equals(format('Good {msg["time"]} Sir {msg.name}.', {
        msg: {
            name: 'Lancelot',
            time: 'evening'
        }
    }), 'Good evening Sir Lancelot.');

    test.equals(format('Good {msg[\'values\'][1]} Sir {msg.values[0]}.', {
        msg: {
            values: ['Lancelot', 'evening']
        }
    }), 'Good evening Sir Lancelot.');

    test.done();
};

exports.testPropertyAccessEscaped = function(test) {
    test.expect(4);
    test.equals(format('My favorite color is {colors[\'"favorite"\']}.', {
        colors: {
            '"favorite"': 'blue'
        }
    }), 'My favorite color is blue.');

    test.equals(format('My favorite color is {colors["\"favorite\""]}.', {
        colors: {
            '"favorite"': 'blue'
        }
    }), 'My favorite color is blue.');

    test.equals(format('My favorite color is {colors["\'favorite\'"]}.', {
        colors: {
            '\'favorite\'': 'blue'
        }
    }), 'My favorite color is blue.');

    test.equals(format('My favorite color is {colors[\'\'favorite\'\']}.', {
        colors: {
            '\'favorite\'': 'blue'
        }
    }), 'My favorite color is blue.');

    test.done();
};

exports.testPropertyAccessError = function(test) {
    test.expect(2);
    try {
        format('{favorite.color}', {msg: {name:'Lancelot'}});

    } catch(err) {
        test.ok(err instanceof FormatError);
        test.equal(err.message, 'Cannot access property "color" of undefined.');
    }
    test.done();
};


// Formatting -------------------------------------------------------------------
// ------------------------------------------------------------------------------
exports.testFormattingJoin = function(test) {
    test.expect(2);
    test.equals(format('{:join(" ")}', ['blue', 'red', 'green', 'yellow']),
                'blue red green yellow');

    test.equals(format('{:join(",")}', ['blue', 'red', 'green', 'yellow']),
                'blue,red,green,yellow');

    test.done();
};

exports.testFormattingSurround = function(test) {
    test.expect(2);
    test.equals(format('{:surround("(", ")")}', 'Lancelot'), '(Lancelot)');
    test.equals(format('{:surround("-")}', 'Lancelot'), '-Lancelot-');
    test.done();
};


exports.testFormattingCase = function(test) {
    test.expect(2);
    test.equals(format('{:upper}', 'Lancelot'), 'LANCELOT');
    test.equals(format('{:lower}', 'Lancelot'), 'lancelot');
    test.done();
};

exports.testFormattingBase = function(test) {
    test.expect(4);
    test.equals(format('{:hex}', 32768), '8000');
    test.equals(format('{:bin}', 255), '11111111');
    test.equals(format('{:hex(true)}', 32768), '0x8000');
    test.equals(format('{:bin(true)}', 255), '0b11111111');
    test.done();
};
exports.testFormattingPad = function(test) {
    test.expect(3);
    test.equals(format('{:lpad(12)}', 'Lancelot'), '    Lancelot');
    test.equals(format('{:rpad(12, " ")}', 'Lancelot'), 'Lancelot    ');
    test.equals(format('{:pad(12, "=")}', 'Lancelot'), '==Lancelot==');
    test.done();
};

exports.testFormattingAccess = function(test) {
    test.expect(2);
    test.equals(format('{name:upper}', {name: 'Lancelot'}), 'LANCELOT');
    test.equals(format('{name[0]:lower}', {name: ['Lancelot']}), 'lancelot');
    test.done();
};

exports.testFormattingMultiple = function(test) {
    test.expect(2);
    test.equals(format('{:upper:lpad(12, " ")}', 'Lancelot'), '    LANCELOT');
    test.equals(format('{:surround("i", "i"):upper}', 'Lancelot'), 'ILANCELOTI');
    test.done();
};

exports.testFormattingEscaped = function(test) {
    test.expect(3);
    test.equals(format('{:surround(\'i\', \'i\'):upper}', 'Lancelot'), 'ILANCELOTI');
    test.equals(format('{:pad(12, "\\"=")}', 'Lancelot'), '"="=Lancelot"="=');
    test.equals(format('{:pad(12, "\'=")}', 'Lancelot'), '\'=\'=Lancelot\'=\'=');
    test.done();
};

exports.testFormattingError = function(test) {
    test.expect(2);
    try {
        format('{:unicornify}', 'Lancelot');

    } catch(err) {
        test.ok(err instanceof FormatError);
        test.equal(err.message, 'Undefined formatter "unicornify".');
    }
    test.done();
};

exports.testFormattingCustom = function(test) {
    test.expect(1);
    var custom = Formatter({
        unicorns: function(value) {
            return value + ' unicorns!';
        }
    });

    test.equals(custom('Here come the {:unicorns}', 'five'),
                       'Here come the five unicorns!');
    test.done();
};


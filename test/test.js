if (typeof window === 'undefined') {
    var format = require('./../lib/fomatto').format;

} else {
    var exports = {};
}

exports.testObject = function(test) {
    test.expect(2);
    test.equals(format('Good morning Sir {name}.', {name: 'Lancelot'}),
                'Good morning Sir Lancelot.');

    test.equals(format('Good {time} Sir {name}.', {time: 'evening',
                                                   name: 'Lancelot'}),
                'Good evening Sir Lancelot.');

    test.done();
};

exports.testObjectNum = function(test) {
    test.expect(2);
    test.equals(format('Good morning Sir {0}.', {'0': 'Lancelot'}),
                'Good morning Sir Lancelot.');

    test.equals(format('Good {1} Sir {0}.', {'1': 'evening',
                                             '0': 'Lancelot'}),
                'Good evening Sir Lancelot.');

    test.done();
};

exports.testObjectProperties = function(test) {
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

exports.testPrintObject = function(test) {
    var knight = {
        toString: function() {
            return 'Sir Lancelot';
        }
    };

    test.expect(3);
    test.equals(format('Good morning {knight}.', knight),
                'Good morning {knight}.');

    test.equals(format('Good morning {0}.', knight),
                'Good morning {0}.');

    test.equals(format('Good morning {}.', knight),
                'Good morning Sir Lancelot.');

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

exports.testPrintArray = function(test) {
    test.expect(3);
    test.equals(format('Good morning Sir {}.', ['Lancelot']),
                'Good morning Sir Lancelot.');

    test.equals(format('Good evening { }.', ['Sir', 'Lancelot']),
                'Good evening Sir Lancelot.');

    test.equals(format('Good { Sir }.', ['evening', 'Lancelot']),
                'Good evening Sir Lancelot.');

    test.done();
};

exports.testPlainKeys = function(test) {
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

exports.testNumbered = function(test) {
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

exports.testMixed = function(test) {
    test.expect(2);

    test.equals(format('Good {time} Sir {1}.', 'evening', 'Lancelot'),
                'Good evening Sir Lancelot.');

    test.equals(format('Good {0} Sir {name}.', 'evening', 'Lancelot'),
                'Good evening Sir Lancelot.');

    test.done();
};


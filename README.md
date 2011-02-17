Fōmatto
=======

Fōmatto provides leightweight string interpolation and formatting for
JavaScript.

The library brings with it:

- The `format` function
- The `Formatter` factory
- The `FormatError` error type

## Basic usage

    > format('Good {} Sir {}.', 'morning', 'Lancelot')
    'Good morning Sir Lancelot.'
    
    > format('Good {time} Sir {name}.', 'morning', 'Lancelot')
    'Good morning Sir Lancelot.'

    > format('Good {0} Sir {1}.', ['morning', 'Lancelot'])
    'Good morning Sir Lancelot.'

It is also possible to use negative indexes.

## Object access

    > format('Good {day.time} Sir {knight.name}.', {
        day: {
            time: 'evening'
        },

        knight: {
            name: 'Lancelot'
        }
    })
    > 'Good evening Sir Lancelot.'

    > format('Good {day["time"]} Sir {knight["name"]}.', {
        ...
    })
    > 'Good evening Sir Lancelot.'

    > format('Good {msg[0]} Sir {msg[1]}.', {
        msg: ['day', 'Lancelot']
    })
    > 'Good day Sir Lancelot.'

# Using formatters

    > format('{:upper}!', 'banana')
    'BANANA!'

    > format('Some fruits: {:join(', ')}!', ['melons', 'oranges', 'strawberries'])
    'Some fruits: melons, oranges, strawberries!'

Fōmatto comes with a couple of standard formatters:
    
- `upper` transforms the value into uppercase.
- `lower` transforms the value into lowercase.
- `lpad(count [, character])` pads the value left.
- `rpad(count [, character])` pads the value right.
- `pad(count [, character])` pads the value on both sides.
- `repeat(count)` repeats the value.
- `join([character])` joins the value.
- `surround(left [, right])` surrounds the value.

## Custom formatters

Using the `Formatter` factory one can add their own formatters.

    var custom = Formatter({
        unicorns: function(value) {
            return value + ' unicorns!';
        }
    });

    > custom('Here come the {:unicorns}', 'five')
    'Here come the five unicorns!'

# TODO

- Additional tests
- Allow for [] in property accessors
- Add support for negative numbers as formatter arguments
- More standard formatters


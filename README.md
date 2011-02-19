Fōmatto
=======

Fōmatto provides leightweight string interpolation and formatting for
JavaScript.

The library brings with it the `Formatter` factory and the `FormatError`.

## Basic usage

    > format = Formatter()
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
    
- `upper` will transform to UPPER case.
- `lower` will transform to lower case.
- `lpad(count [, character=' '])` will pad on the left side with `character`.
- `rpad(count [, character=' '])` will pad on the right side with `character`.
- `pad(count [, character=' '])` will pad on both sides with `character`.
- `surround(left=' ' [, right=left])` will surround with `left` and `right`.
- `repeat(count=0)` will repeat `count` times.
- `join([character=' '])` will join an array with `character`.
- `hex([leading=false])` will convert to hexadecimal representation. If leading
  is true `0x` will be prepended.

- `bin([leading=false])` will convert to binary representation. If leading
  is true `0b` will be prepended.                                     

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
- Add support for escaped {} in formatting strings
- More standard formatters


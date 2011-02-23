Fōmatto - Japanese for Format
=============================

Fōmatto provides leightweight string interpolation and formatting for
JavaScript.

The library brings with it the `Formatter` factory and the `FormatError`.

### Basic usage

    > format = Formatter()
    > format('Good {} Sir {}.', 'morning', 'Lancelot')
    'Good morning Sir Lancelot.'
    
    > format('Good {time} Sir {name}.', 'morning', 'Lancelot')
    'Good morning Sir Lancelot.'

    > format('Good {0} Sir {1}.', ['morning', 'Lancelot'])
    'Good morning Sir Lancelot.'

It is also possible to use negative indexes.

### Object access

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

# Using formats

    > format('{:upper}!', 'banana')
    'BANANA!'

    > format('Some fruits: {:join(', ')}!', ['melons', 'oranges', 'strawberries'])
    'Some fruits: melons, oranges, strawberries!'

Fōmatto comes with a couple of standard formats:
    
- `upper` will transform to UPPER case.
- `lower` will transform to lower case.
- `lpad(count [, padding=' '])` will pad to `count` characters on the left side.
- `rpad(count [, padding=' '])` will pad to `count` characters on the right side.
- `pad(count [, padding=' '])` will equally pad to `count` characters on both sides.

> **Note:** The `pad` formats only support single characters for padding.

- `surround(left=' ' [, right=left])` will surround with `left` and `right`.
- `repeat(count=0)` will repeat `count` times.
- `join([character=' '])` will join an array with `character`.
- `hex([leading=false])` will convert to hexadecimal representation. If leading
  is true `0x` will be prepended.

- `bin([leading=false])` will convert to binary representation. If leading
  is true `0b` will be prepended.                                     

### Custom formats

Using the `Formatter` factory one can add their own formatters.

    var custom = Formatter({
        unicorns: function(value) {
            return value + ' unicorns!';
        }
    });

    > custom('Here come the {:unicorns}', 'five')
    'Here come the five unicorns!'

It is also possible to add more formats later on by setting properties on the
`formats` object of a formatter.

    custom.formats.foo = function(value) {
        return 'foo';
    };

This will add the format `:foo`.

### Adding default formats

By extending `Formatter.formats` it's also possible to add more default
formats.

    Formatter.formats.bonsai = function(value) {
        // ...   
    };


The format `:bonsai` will now be available to all formatters.


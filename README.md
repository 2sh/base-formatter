# Base Formatter
A Javascript library for encoding numbers to any radix/base with many formatting options.

## Features
- Encode and decode between any bases.
- Use specified symbols (digits, sign, radix character, padding, separators) to represent the encoded number.
- Adjust integer and fractions lengths.
- Adding "thousands" grouping separators, grouping at adjustable lengths.
- A choice of various rounding modes.
- Scientific and engineering notation.
- Alternatively output as a numeral object, to represent numbers in bases without the use of digit symbols.
- Encoding of decimal.js values for more precision.

## Documentation
- The API reference can be found [here](https://2sh.github.io/base-formatter/modules.html).
  - [BaseFormatter](https://2sh.github.io/base-formatter/classes/BaseFormatter.html) - Makes use of specified symbols, formatting options to represent numbers in different bases.
  - [BaseConverter](https://2sh.github.io/base-formatter/classes/BaseConverter.html) - Alternatively represents numbers in different bases as numberal objects.

## Examples
```js
import { BaseFormatter, BaseConverter } from 'base-formatter'

const base16Greek = new BaseFormatter('0123456789ΑΒΓΔΕΖ', {radixCharacter: ','})
// or for just the A-F characters, BaseFormatter.hexadecimal({...})
const dozenal = BaseFormatter.dozenal()

dozenal.encode(142) // '↋↊'
dozenal.encode(144) // '100'
dozenal.encode(1/3, {minimumIntegerDigits: 3, minimumFractionDigits: 3}) // '000;400'
dozenal.encode(1.6, {roundingMode: 'ceil', fractionDigits: 0}) // '2'
dozenal.encode(-1.6, {roundingMode: 'floor', fractionDigits: 0}) // '-2'
base16Greek.encode(13) // 'Δ'
base16Greek.encode(5e-6, {notation: 'scientific', maximumFractionDigits: 3}) // '1,Β1e-5'

dozenal.decode('↊;9429e↊') // 667430129664
dozenal.isNumber('↊;9429e↊') // true

// Making use of numeral outputs:
const base120 = new BaseConverter(120)
base120.encode(-1440)
// { isNegative: true, integer: [ 12, 0 ], fraction: [], exponent: 0 }
base120.encode(6347544.3456, {notation: 'scientific', maximumFractionDigits: 5})
// { isNegative: false, integer: [ 3 ], fraction: [ 80, 96, 24, 41, 57 ], exponent: 3 }
base120.decode({ isNegative: false, integer: [ 3 ], fraction: [ 80, 96, 24, 41, 57 ], exponent: 3 })
// 6347544.345625
```

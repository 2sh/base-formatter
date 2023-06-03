# Base Formatter
A Javascript library for encoding numbers to different radixes/bases with many formatting options.

The encoder takes various options to adjust the formatting of the output base number as a string, such as the characters to use for the various symbols (radix character, signs, separators), integer and fraction lengths, padding, grouping, scientific and engineering notation and rounding mode. The base can be any number as long as the digits are specified: 0123456789ABCD...

## Use
```js
import Base from 'base-formatter'

const base16Greek = new Base('0123456789ΑΒΓΔΕΖ', {radixCharacter: ','})
// or for just the A-F characters, Base.hexadecimal({...})
const dozenal = Base.dozenal()

dozenal.encode(142) // '↋↊'
dozenal.encode(144) // '100'
dozenal.encode(1/3, {minimumIntegerDigits: 3, minimumFractionDigits: 3}) // '000;400'
dozenal.encode(1.6, {roundingMode: 'ceil', fractionDigits: 0}) // '2'
dozenal.encode(-1.6, {roundingMode: 'floor', fractionDigits: 0}) // '-2'
base16Greek.encode(13) // 'Δ'
base16Greek.encode(5e-6, {notation: 'scientific', maximumFractionDigits: 3}) // '1,Β1e-5'

dozenal.decode('↊;9429e↊') // 667430129664
dozenal.isNumber('↊;9429e↊') // true
```
(decimal.js values can also be encoded for more precision.)

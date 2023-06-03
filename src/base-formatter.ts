/*
 * Copyright (c) 2023 2sh <contact@2sh.me>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * A Javascript library for encoding numbers to different radixes/bases with many formatting options.
 * 
 * The `base-formatter` defines the {@link default} class, which is used to
 * create a Base instance for encoding and decoding numbers.
 * 
 * @packageDocumentation
 */

import Decimal from 'decimal.js'

// Basing options on:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat

/**
 * Thrown if the base number exceeds the maximum.
 * @category Error
 **/
export class MaximumBaseExceeded extends Error {}
/**
 * Thrown if there are no digits specified for the instance when required by a method.
 * @category Error
 **/
export class DigitsUndefined extends Error {}
/**
 * Thrown if the matching digit is not found.
 * @category Error
 */
export class DigitNotFound extends Error {}

/**
 * - `'auto'`: Only show the radix character with the fraction.
 * - `'always'`: Always show the radix character.
 */
export type RadixDisplay =
      'auto'
    | 'always'

/**
 * - `'auto'`: Sign display for negative numbers only, including negative zero.
 * - `'always'`: Always display sign.
 * - `'exceptZero'`: Sign display for positive and negative numbers, but not zero.
 * - `'negative'`: Sign display for negative numbers only, excluding negative zero.
 * - `'never'`: Never display sign.
 */
export type SignDisplay =
      'auto'
    | 'always'
    | 'exceptZero'
    | 'negative'
    | 'never'

/**
 * - `'ceil'`: Round towards positive infinity.
 * - `'floor'`: Round towards negative infinity.
 * - `'expand'`: Round away from zero.
 * - `'trunc'`: Round towards zero.
 * - `'halfCeil'`: Values above or equal to the half-increment round like `ceil`, otherwise like `floor`.
 * - `'halfFloor'`: Values above the half-increment round like `ceil`, otherwise like `floor`.
 * - `'halfExpand'`: Values above or equal to the half-increment round like `expand`, otherwise like `trunc`.
 * - `'halfTrunc'`: Values above the half-increment round like `expand`, otherwise like `trunc`.
 * - `'halfEven'`: Like `halfExpand`, except that on the half-increment values round towards the nearest even digit.
 * - `'halfOdd'`: Like `halfExpand`, except that on the half-increment values round towards the nearest odd digit.
 */
export type RoundingMode =
      'ceil'
    | 'floor'
    | 'expand'
    | 'trunc'
    | 'halfCeil'
    | 'halfFloor'
    | 'halfExpand'
    | 'halfTrunc'
    | 'halfEven'
    | 'halfOdd'

/**
 * - `'standard'`: Plain number formatting.
 * - `'scientific'`: Return the order-of-magnitude for formatted number.
 * - `'engineering'`: Return the exponent of ten when divisible by three.
 */
export type Notation =
      'standard'
    | 'scientific'
    | 'engineering'

/**
 * - `'always'`: Always display the group separators.
 * - `'min2'`: Display grouping separators when there are at least 2 digits in a group.
 * - `false`: Do not display grouping separators.
 * - `true`: Alias for `'always'`.
 */
export type UseGrouping =
      false
    | true
    | 'always'
    | 'min2'

/**
 * The options passed to {@link Base}, {@link Base.encode} and {@link Base.decode}.
 */
export interface Options
{
    /**
     * The radix character, or "decimal" point/mark/separator, such as the point in `0.5`).
     * @defaultValue `'.'`
     */
    radixCharacter?: string
    /**
     * The negative sign.
     * @defaultValue `'-'`
     */
    negativeSign?: string
    /**
     * The positive sign.
     * @defaultValue `'+'`
     */
    positiveSign?: string
    /**
     * The grouping separator, such as the commas in `100,000,000`.
     * @defaultValue `','`
     */
    groupingSeparator?: string
    /**
     * The grouping length, the distance between grouping separators, e.g. with a length of 2: `1,00,00,00`.
     * @defaultValue `3`
     */
    groupingLength?: number
    /**
     * The digit separator, if specified, will be places between every digit without a grouping separator.
     * @defaultValue `''`
     */
    digitSeparator?: string
    /**
     * The scientific notation character, such as the `e` in `1.342e3`.
     * @defaultValue `'e'`
     */
    scientificNotationCharacter?: string
    /**
     * The integer pad character, padding the left side of the integer.
     * By default the specified digit for zero is used,
     * but could also be a `' '` space char for example.
     * @defaultValue `null`
     */
    integerPadCharacter?: string | null // the digit zero char if not string
    /**
     * The fraction pad character, padding the right side of the fraction.
     * By default the specified digit for zero is used, but could also be a `' '` space char for example.
     * @defaultValue `null`
     */
    fractionPadCharacter?: string | null


    /**
     * When to display the radix character.
     * @defaultValue `'auto'`
     */
    radixDisplay?: RadixDisplay
    /**
     * When to display the sign.
     * @defaultValue `'auto'`
     */
    signDisplay?: SignDisplay
    /**
     * How numbers are to be rounded.
     * @defaultValue `'halfExpand'`
     */
    roundingMode?: RoundingMode
    /**
     * The precision of the number, the number of significant digits.
     * @defaultValue `32`
     */
    precision?: number
    /**
     * If specified, the exact number of fraction Digits.
     * By default there is not limit, though this is
     * overridable by {@link minimumFractionDigits} and {@link maximumFractionDigits}.
     * @defaultValue `null`
     */
    fractionDigits?: number | null
    /**
     * The minimum number of fraction digits to use.
     * A value with a smaller number of fraction digits than this number will be
     * right-padded with zeros or the specified fraction pad character.
     * @defaultValue `0`
     */
    minimumFractionDigits?: number
    /**
     * The maximum number of fraction digits to use.
     * By default, the maximum number of fraction digits is determined by the precision.
     * @defaultValue `null`
     */
    maximumFractionDigits?: number | null
    /**
     * The minimum number of integer digits to use.
     * A value with a smaller number of integer digits than this number will be
     * left-padded with zeros or the specified integer pad character.
     * @defaultValue `0`
     */
    minimumIntegerDigits?: number
    /**
     * The formatting that should be displayed for the number.
     * @defaultValue `'standard'`
     */
    notation?: Notation
    /**
     * When numbers are to be grouped.
     * @defaultValue `false`
     */
    useGrouping?: UseGrouping
}
/**
 * The properties of the Base class.
 */
type Properties = Required<Options>

/**
 * The numeral output of the {@link Base.encode} method if the base digits have not been specified.
 */
export interface NumeralOutput
{
    /**
     * Whether the number is negative.
     */
    isNegative: boolean,
    /**
     * The integer part of the number.
     */
    integer: number[],
    /**
     * The fraction part of the number.
     */
    fraction: number[],
    /**
     * The exponent of the number.
     */
    exponent: number
}

/**
 * Create a pad array
 * @param amount - The length of the array
 * @param character - The character to fill the array with
 * @returns The pad array
 */
function createPadArray(length: Decimal, character: string): string[]
{
    return Array(length.toNumber()).fill(character) as string[]
}

const zero = new Decimal(0)

const numbers = '0123456789'
const asciiUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const asciiLowercase = 'abcdefghijklmnopqrstuvwxyz'
const allDigits = numbers + asciiUppercase + asciiLowercase

/**
 * The class from which to create a Base instance for encoding and decoding numbers.
 * @typeParam Digits - The type of the `digits` argument,
 * determining the output type of the {@link Base.encode} method.
 * @category Main
 */
export class Base<Digits extends string | number>
{
    /**
     * The inferred base, from either the number of digits or the number passed to the digits argument of the constructor.
     */
    public readonly base: number
    /**
     * The digits to use.
     */
    public readonly digits: string[] | null
    /**
     * The properties of the Base class, set by the options of the constructor
     */
    private readonly properties: Properties
    /**
     * The RegExp object used by the {@link isNumber} method.
     */
    private readonly reValid: RegExp | null
    /**
     * The rounding modes used by the {@link encode} method.
     */
    private readonly roundingModes: {
        [mode in RoundingMode]: (value: Decimal, isNegative: boolean, index: number, values: (Decimal | null)[]) => boolean
    }
    /**
     * The natural logarithm of the base used by the {@link calculateExponent} method.
     */
    private readonly lnBase: Decimal
    /**
     * The natural logarithm of base*10^3 used by the {@link calculateExponent} method.
     */
    private readonly lnBase3: Decimal
    /**
     * The zero character of the input digits. Becomes a `' '` space character if no digits are specified.
     */
    private readonly baseZero: string

    /**
     * The constructor of the Base class.
     * @param digits - A string of digits, the length of which determining the base number, or a base number.
     * If the digits argument is a string, the output of the {@link encode} method will be a formatted
     * string, and if a number, the output of the {@link encode} method will be a {@link NumeralOutput} object.
     * @param options - Optional parameters, for adjusting the base settings or encoding formatting.
     */
    constructor(digits: Digits, options?: Options)
    {
        if (typeof digits === 'number')
        {
            this.base = digits
            this.digits = null
        }
        else
        {
            this.digits = typeof digits === 'string' ? [...digits] : digits
            this.base = this.digits.length
        }

        this.properties = {
            radixCharacter: '.',
            negativeSign: '-',
            positiveSign: '+',
            groupingSeparator: ',',
            groupingLength: 3,
            digitSeparator: '',
            scientificNotationCharacter: 'e',
            integerPadCharacter: null,
            fractionPadCharacter: null,

            radixDisplay: 'auto',
            signDisplay: 'auto',
            roundingMode: 'halfExpand',
            precision: 32,
            fractionDigits: null,
            minimumFractionDigits: 0,
            maximumFractionDigits: null,
            minimumIntegerDigits: 0,
            notation: 'standard',
            useGrouping: false,

            ...options
        }

        this.baseZero = this.digits !== null ? this.digits[0] : ' '
        this.lnBase = new Decimal(this.base).ln()
        this.lnBase3 = new Decimal(Math.pow(this.base, 3)).ln()
        
        if (this.digits !== null)
        {
            const u = (v: string): string => v
                ? v.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('')
                : ''
            const uDigits = this.digits.map(d => u(d)).join('')
            const signPattern = '['
                + u(this.properties.negativeSign)
                + u(this.properties.positiveSign)
            + ']?'
            
            const pattern = '^'
            + signPattern
            + '['
                + uDigits
                + u(this.properties.digitSeparator)
                + u(this.properties.groupingSeparator)
            + ']+'
            + '(?:'
                + u(this.properties.radixCharacter)
                + '[' + uDigits + ']*'
            + ')?'
            + '(?:'
                + u(this.properties.scientificNotationCharacter)
                + signPattern
                + '[' + uDigits + ']+'
            + ')?'
            + '$'
            this.reValid = new RegExp(pattern, 'u')
        }
        else
            this.reValid = null
        
        const halfBase = new Decimal(this.base).dividedBy(2)
        this.roundingModes = {
            expand: (value) => value.greaterThan(0),
            trunc: () => false,
            ceil: (value, isNegative) => !isNegative && value.greaterThan(0),
            floor: (value, isNegative) => isNegative && value.greaterThan(0),
            halfExpand: (value) => value.greaterThanOrEqualTo(halfBase),
            halfTrunc: (value) => value.greaterThan(halfBase),
            halfCeil: (value, isNegative) => !isNegative ? value.greaterThanOrEqualTo(halfBase) : value.greaterThan(halfBase),
            halfFloor: (value, isNegative) => isNegative ? value.greaterThanOrEqualTo(halfBase) : value.greaterThan(halfBase),
            halfEven: (value, _, i, values) =>
            {
                if (value.equals(halfBase))
                {
                    const value = values[values[i-1] === null ? i-2 : i-1]
                    if (value) return value.modulo(2).equals(1)
                }
                return value.greaterThan(halfBase)
            },
            halfOdd: (value, _, i, values) =>
            {
                if (value.equals(halfBase))
                {
                    const value = values[values[i-1] === null ? i-2 : i-1]
                    if (value) return value.modulo(2).equals(0)
                }
                return value.greaterThan(halfBase)
            }
        }
    }
    
    /**
     * This method will take the base number, slice a string of digits 0-9A-Za-z and return
     * an instance of the Base class with the sliced string as its digits.
     * @param base - The base number to use, a maximum of `62`.
     * For a higher base number, supply the Base class an amount of digits equal to the desired base or
     * specify it with just a number and receive the output as a {@link NumeralOutput}.
     * @param options - The options to use.
     * @returns An instance of the Base class.
     * @throws {@link MaximumBaseExceeded}
     * Thrown when the base number exceeds the maximum amount of this method.
     * @category Static
     */
    public static digitsByBase(base: number, options?: Options)
    {
        if (base > allDigits.length) throw new MaximumBaseExceeded("Can't be higher than " + allDigits.length.toString() + " digits")
        return new Base([...allDigits].slice(0, base).join(''), options)
    }

    /**
     * This method returns an instance of the Base class in base 2 with the digits `'01'`.
     * @param options - The options to use.
     * @returns An instance of the Base class.
     * @category Static
     */
    public static binary(options?: Options) { return Base.digitsByBase(2, options) }
    /**
     * This method returns an instance of the Base class in base 8 with the digits `'01234567'`.
     * @param options - The options to use.
     * @returns An instance of the Base class.
     * @category Static
     */
    public static octal(options?: Options) { return Base.digitsByBase(8, options) }
    /**
     * This method returns an instance of the Base class in base 10 with the digits `'0123456789'`.
     * @param options - The options to use.
     * @returns An instance of the Base class.
     * @category Static
     */
    public static decimal(options?: Options) { return Base.digitsByBase(10, options) }
    /**
     * This method returns an instance of the Base class in base 16 with the digits `'0123456789ABCDEF'`.
     * @param options - The options to use.
     * @returns An instance of the Base class.
     * @category Static
     */
    public static hexadecimal(options?: Options) { return Base.digitsByBase(16, options) }
    /**
     * This method returns an instance of the Base class in base 12 with the digits `'0123456789↊↋'` and the radix character of `';'`.
     * The digits ↊ and ↋ as used by the Dozenal Societies of America and Great Britain.
     * @param options - The options to use.
     * @returns An instance of the Base class.
     * @category Static
     */
    public static dozenal(options?: Options)
        { return new Base(numbers + '↊↋', {radixCharacter: ';', ...options}) }
    /**
     * This method returns an instance of the Base class in base 12 with the digits `'0123456789TE'` and the radix character of `';'`.
     * The digits T and E are the ASCII variations of the digits ↊ and ↋ used by the {@link Base.dozenal} method in case a font doesn't have them.
     * @param options - The options to use.
     * @returns An instance of the Base class.
     * @category Static
     */
    public static dozenalInitials(options?: Options)
        { return new Base(numbers + 'TE', {radixCharacter: ';', ...options}) }
    /**
     * This method returns an instance of the Base class in base 12 with the digits `'0123456789XE'` and the radix character of `';'`.
     * Uses a variant of the digit for 10 using the Roman numeral X.
     * @param options - The options to use.
     * @returns An instance of the Base class.
     * @category Static
     */
    public static dozenalRoman(options?: Options)
        { return new Base(numbers + 'XE', {radixCharacter: ';', ...options}) }
    /**
     * This method returns an instance of the Base class in base 12 with the digits `'0123456789AB'`.
     * @param options - The options to use.
     * @returns An instance of the Base class.
     * @category Static
     */
    public static duodecimal(options?: Options) { return Base.digitsByBase(12, options) }
    /**
     * This method returns an instance of the Base class in base 20 with the digits `'0123456789ABCDEFGHJK'`,
     * skipping over I in order to avoid confusion between I and 1.
     * @param options - The options to use.
     * @returns An instance of the Base class.
     * @category Static
     */
    public static vigesimal(options?: Options) { return new Base(numbers + "ABCDEFGHJK", options) }
    /**
     * This method returns an instance of the Base class in base 57 with the digits 0-9A-Ba-b without the characters Il1O0.
     * @param options - The options to use.
     * @returns An instance of the Base class.
     * @category Static
     */
    public static base57(options?: Options)
    {
        const digits = (numbers + asciiUppercase + asciiLowercase)
            .replace('I', '')
            .replace('l', '')
            .replace('1', '')
            .replace('O', '')
            .replace('0', '')
        return new Base(digits, options)
    }
    /**
     * This method returns an instance of the Base class in base 58 with the digits 0-9A-Ba-b without the characters IlO0.
     * @param options - The options to use.
     * @returns An instance of the Base class.
     * @category Static
     */
    public static base58(options?: Options)
    {
        const digits = (numbers + asciiUppercase + asciiLowercase)
            .replace('I', '')
            .replace('l', '')
            .replace('O', '')
            .replace('0', '')
        return new Base(digits, options)
    }
    /**
     * This method returns an instance of the Base class in base 60 with the digits 0-9A-Ba-b without the characters l0.
     * @param options - The options to use.
     * @returns An instance of the Base class.
     * @category Static
     */
    public static sexagesimal(options?: Options)
    {
        const digits = (numbers + asciiUppercase + asciiLowercase)
            .replace('l', '')
            .replace('O', '')
        return new Base(digits, options)
    }
    /**
     * This method returns an instance of the Base class in base 60 using cuneiform digits.
     * @param options - The options to use.
     * @returns An instance of the Base class.
     * @category Static
     */
    public static cuneiform(options?: Options)
    {
        const ones = [...'𒑊𒐕𒐖𒐗𒐘𒐙𒐚𒐛𒐜𒐝']
        const tens = ['',...'𒌋𒑱𒌍𒐏𒐐']
        const digits = tens.map(t => ones.map(o => t + o)).flat().join('')
        return new Base(digits,
        {
            radixCharacter: ';',
            integerPadCharacter: ' ',
            fractionPadCharacter: ' ',

            ...options
        })
    }
    /**
     * This method returns an instance of the Base class in base 62 with the digits 0-9A-Ba-b.
     * @param options - The options to use.
     * @returns An instance of the Base class.
     * @category Static
     */
    public static base62(options?: Options) { return Base.digitsByBase(62, options) }
    /**
     * This method returns an instance of the Base class in base 98 using Unicode domino tiles.
     * @param options - The options to use.
     * @returns An instance of the Base class.
     * @category Static
     */
    public static domino(options?: Options)
    {
        const chars =
           '🁣🁤🁥🁦🁧🁨🁩🀱🀲🀳🀴🀵🀶🀷'
         + '🁪🁫🁬🁭🁮🁯🁰🀸🀹🀺🀻🀼🀽🀾'
         + '🁱🁲🁳🁴🁵🁶🁷🀿🁀🁁🁂🁃🁄🁅'
         + '🁸🁹🁺🁻🁼🁽🁾🁆🁇🁈🁉🁊🁋🁌'
         + '🁿🂀🂁🂂🂃🂄🂅🁍🁎🁏🁐🁑🁒🁓'
         + '🂆🂇🂈🂉🂊🂋🂌🁔🁕🁖🁗🁘🁙🁚'
         + '🂍🂎🂏🂐🂑🂒🂓🁛🁜🁝🁞🁟🁠🁡'
        return new Base(chars,
        {
            radixCharacter: '🁢',
            negativeSign: '🀰',
            ...options
        })
    }

    /**
     * Calculate the exponent of a given value in the instance base.
     * @param value - The value of which to calculate the exponent.
     * @param isEngineering - Whether to use the engineering notation.
     * @returns The exponent.
     * @category Instance
     */
    private calculateExponent(value: Decimal | number, isEngineering = false): number
    {
        const isNumber = typeof value === 'number'
        const decValue = isNumber ? new Decimal(value) : value
        if (decValue.equals(0)) return decValue.toNumber()
        return decValue
            .ln()
            .dividedBy(isEngineering ? this.lnBase3 :this.lnBase)
            .floor()
            .times(isEngineering ? 3 : 1)
            .toNumber()
    }

    /**
     * @param value - The integer value to convert to the base.
     * @returns A number array of the value in the instance base.
     * @category Instance
     */
    private convertIntegerToBase(value: Decimal): Decimal[]
    {
        const baseVal: Decimal[] = []
        let index = 0
        while (value.greaterThanOrEqualTo(this.base))
        {
            baseVal.push(value.modulo(this.base))
            value = value.dividedBy(this.base).floor()
            index++
        }
        if (value.greaterThan(0) || index == 0) baseVal.push(value)
        return baseVal.reverse()
    }

    /**
     * Encode the value array using the instance digits.
     * @param value - The number array to encode.
     * @param opts - The options used.
     * @returns The encoded value.
     * @category Instance
     */
    private encodeInteger(value: (Decimal | string)[], opts: Properties): string
    {
        return value
            .map(n => typeof n === 'string' ? n : this.encodeDigit(n.toNumber()))
            .reverse()
            .reduce((acc, cur, i, array) =>
            {
                if (i > 0)
                {
                    if (opts.useGrouping
                        && (i % opts.groupingLength) == 0
                        && (opts.useGrouping != "min2" || array.length > i+1))
                    {
                        acc.push(opts.groupingSeparator)
                    }
                    else
                    {
                        acc.push(opts.digitSeparator)
                    }
                }
                acc.push(cur)
                return acc
            }, [] as string[])
            .reverse()
            .join('')
    }

    /**
     * @param value - The fraction value to convert to the base.
     * @param precision - The fraction precision, the maximum length of the fraction.
     * @returns A number array of the value in the instance base.
     * @category Instance
     */
    private convertFractionalToBase(value: Decimal, precision: Decimal): Decimal[]
    {
        const baseVal: Decimal[] = []
        const prec = precision.toNumber()
        for(let i=0; i<prec && !value.isZero(); i++)
        {
            value = value.times(this.base)
            const baseDigit = value.floor()
            value = value.minus(baseDigit)
            baseVal.push(baseDigit)
        }
        return baseVal
    }

    /**
     * Encode a single digit.
     * @param value - The number to convert.
     * @returns The encoded digit.
     * @throws {@link DigitsUndefined}
     * Thrown when the digits are undefined.
     * @throws {@link DigitNotFound}
     * Thrown when no digit could be found for the specified number.
     * @category Instance
     */
    private encodeDigit(value: number): string
    {
        if (this.digits === null) throw new DigitsUndefined('Could not encode as digits undefined')
        if (!this.digits[value]) throw new DigitNotFound('No digit found for number specified')
        return this.digits[value]
    }

    /**
     * Decode a single digit.
     * @param value - The digit to convert to a number.
     * @returns The decoded digit.
     * @throws {@link DigitsUndefined}
     * Thrown when the digits are undefined.
     * @throws {@link DigitNotFound}
     * Thrown when the string is not found in the digits.
     * @category Instance
     */
    private decodeDigit(value: string): number
    {
        if (this.digits === null) throw new DigitsUndefined('Could not decode as digits undefined')
        const digitIndex = this.digits.indexOf(value)
        if (!(digitIndex >= 0)) throw new DigitNotFound('String value not found in digits')
        return digitIndex
    }

    /**
     * Encodes the input number into the instance base, according to the chosen formatting options.
     * @param numberValue - The number to encode, as a number, string or Decimal type.
     * @param options - The options to use for formatting.
     * @returns The encoded number as a string if digits were passed to the instance,
     * otherwise a {@link NumeralOutput} object.
     * @category Instance
     */
    public encode(numberValue: number | string | Decimal, options?: Options): Digits extends number ? NumeralOutput : string
    public encode(numberValue: number | string | Decimal, options?: Options): NumeralOutput | string
    {
        const props: Properties = {...this.properties, ...options}
        if (typeof props.integerPadCharacter !== "string")
            props.integerPadCharacter = this.baseZero
        if (typeof props.fractionPadCharacter !== "string")
            props.fractionPadCharacter = this.baseZero
        if (props.fractionDigits !== null)
        {
            props.maximumFractionDigits = props.fractionDigits
            props.minimumFractionDigits = props.fractionDigits
        }
        props.minimumFractionDigits = props.maximumFractionDigits
            ? Math.min(props.minimumFractionDigits, props.maximumFractionDigits)
            : props.minimumFractionDigits
        
        const decVal = new Decimal(numberValue)
        let isNegative = decVal.isNegative()
        const absVal = decVal.absoluteValue()
        
        const exponent = this.calculateExponent(absVal, props.notation === 'engineering')
        
        const makeExponential = props.notation !== 'standard' && exponent != 0
        const expValue = makeExponential ? (absVal.dividedBy(Decimal.pow(this.base, exponent))) : absVal

        const precisionExponent = makeExponential ? exponent : 0

        const decPrecision = new Decimal(props.precision)
        const maxFractLengthByPrecision = (precisionExponent > 0
            ? decPrecision.minus(precisionExponent)
            : decPrecision) || zero
        const maxFractionalLength = (typeof props.maximumFractionDigits == "number"
            ? Decimal.min(props.maximumFractionDigits, maxFractLengthByPrecision)
            : maxFractLengthByPrecision)

        const intVal = expValue.floor()
        const fractVal = expValue.minus(intVal)
        
        const baseIntVal = this.convertIntegerToBase(intVal)
        const baseFractVal = this.convertFractionalToBase(fractVal, maxFractLengthByPrecision)

        const baseVal: (Decimal|null)[] = [
            ...baseIntVal,
            null,
            ...baseFractVal
        ]

        const roundingIndex = maxFractionalLength.plus(baseIntVal.length)
        let isRemainder = false
        let onlyZeros = true
        for(let i=baseVal.length-1; i>=0; i--)
        {
            let value = baseVal[i]
            if(value === null) continue
            const isRounded = roundingIndex.lessThan(i)
            
            if (isRemainder)
            {
                value = value.plus(1)
                isRemainder = value.greaterThanOrEqualTo(this.base)
            }
            
            if (!isRemainder && isRounded)
            {
                if (this.roundingModes[props.roundingMode](value, isNegative, i, baseVal))
                    isRemainder = true
            }

            if (isRemainder)
                value = zero

            if (isRounded)
                onlyZeros = true
            else if (!value.isZero())
                onlyZeros = false
            
            baseVal[i] = value
            
            if (onlyZeros && baseIntVal.length < i)
                baseVal.pop()
            else if(!isRemainder)
                break
        }
        if (isRemainder) baseVal.unshift(new Decimal(1))
        
        const nullPos = baseVal.findIndex(e => e == null)
        const roundedIntVal = baseVal.slice(0, nullPos) as Decimal[]
        const roundedFractVal = baseVal.slice(nullPos+1) as Decimal[]

        // if the value became zero through rounding, make no longer negative
        if (!decVal.isZero() && baseVal.every((v) => v === null || v.isZero()))
            isNegative = false

        if (this.digits !== null)
        {
            const encodedIntVal = this.encodeInteger(
                (props.minimumIntegerDigits && props.minimumIntegerDigits > roundedIntVal.length
                ? [...createPadArray((new Decimal(props.minimumIntegerDigits)).minus(roundedIntVal.length), props.integerPadCharacter), ...roundedIntVal]
                : roundedIntVal), props)
            
            const encodedFractVal =
                (props.minimumFractionDigits > roundedFractVal.length
                    ? [...roundedFractVal, ...createPadArray(new Decimal(props.minimumFractionDigits-roundedFractVal.length), props.fractionPadCharacter)]
                    : roundedFractVal)
                .map(n => typeof n === 'string' ? n : this.encodeDigit(n.toNumber()))
                .join('')
            
            const signSymbol = isNegative ? props.negativeSign : props.positiveSign
            const outputSignSymbol = 
                (props.signDisplay == "always" && signSymbol)
                || (props.signDisplay == "exceptZero" && !decVal.isZero() && signSymbol)
                || (props.signDisplay == "negative" && decVal.lessThan(0) && signSymbol)
                || (props.signDisplay == "never" && '')
                || props.signDisplay == "auto" && isNegative ? signSymbol : ''
            
            const encodedExponent = makeExponential && exponent != 0
                ? (props.scientificNotationCharacter + (this.encode(exponent, {...this.properties, notation: 'standard', fractionDigits: 0, minimumIntegerDigits: 0}) as string))
                : ''
            
            return outputSignSymbol
                + encodedIntVal
                + (encodedFractVal || props.radixDisplay === 'always' ? (props.radixCharacter + encodedFractVal) : '')
                + encodedExponent
        }
        else
        {
            return {
                isNegative,
                integer: roundedIntVal.map(v => v.toNumber()),
                fraction: roundedFractVal.map(v => v.toNumber()),
                exponent: makeExponential ? exponent : 0
            }
        }
    }

    /**
     * Calculating the parts of the encoded value together.
     * @param isNegative - Whether the number is negative.
     * @param encodedNumber - The encoded number.
     * @param integerLength - How much of the encoded number is the integer partm.
     * @param exponent - The exponent of the number.
     * @returns The decoded value.
     * @category Instance
     */
    private calculateValue(isNegative: boolean, encodedNumber: number[], integerLength: number, exponent: number): number
    {
        const largestExponent = integerLength - 1
        console.log(largestExponent)
        return encodedNumber.reduce((a, c, i) => a + c * Math.pow(this.base, largestExponent-i), 0)
            * Math.pow(this.base, exponent) * (isNegative ? -1 : 1)
    }

    /**
     * @param encodedValue - An encoded number in the instance base.
     * @param options - The options to use if, e.g. alternative characters were used.
     * @returns The decoded number.
     * @throws {@link DigitsUndefined}
     * Thrown when the digits are undefined.
     * @throws {@link DigitNotFound}
     * Thrown when the specified string contains unknown characters.
     * @category Instance
     */
    public decode(encodedValue: string | NumeralOutput, options?: Options): number
    {
        if (typeof encodedValue !== "string")
        {
            return this.calculateValue(encodedValue.isNegative,
                [...encodedValue.integer, ...encodedValue.fraction],
                encodedValue.integer.length, encodedValue.exponent)
        }

        const opts: Properties = {...this.properties, ...options}

        const trimmedValue = encodedValue.trim()

        const isNegative = trimmedValue.startsWith(opts.negativeSign)

        const notationIndex = trimmedValue.indexOf(opts.scientificNotationCharacter)

        const exponent = notationIndex >= 0 ? this.decode(trimmedValue.slice(notationIndex+1)) : 0
        const intFractValue = notationIndex >= 0 ? trimmedValue.slice(0,notationIndex) : trimmedValue

        const cleanedValue = intFractValue
            .replaceAll(opts.positiveSign, '')
            .replaceAll(opts.negativeSign, '')
            .replaceAll(opts.groupingSeparator, '')
            .replaceAll(opts.digitSeparator, '')

        const valueArray = [...cleanedValue]

        const radixCharIndex = valueArray.indexOf(opts.radixCharacter)

        const integerLength = radixCharIndex >= 0 ? radixCharIndex : valueArray.length

        const pureNumberValueArray = radixCharIndex >= 0
            ? [...valueArray.slice(0, radixCharIndex), ...valueArray.slice(radixCharIndex+1)]
            : valueArray

        return this.calculateValue(isNegative,
            pureNumberValueArray.map((d) => this.decodeDigit(d)),
            integerLength, exponent)
    }

    /**
     * @param value - A string to check.
     * @returns Whether the input string is a number according to the digits and options of the instance.
     * @throws {@link DigitsUndefined}
     * Thrown when the digits are undefined.
     * @category Instance
     */
    public isNumber(value: string): boolean
    {
        if (this.reValid === null) throw new DigitsUndefined('No digits defined for the isNumber check')
        return this.reValid.test(value)
    }
}
export default Base

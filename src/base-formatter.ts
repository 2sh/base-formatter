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
 * The `base-formatter` defines the {@link BaseFormatter} and {@link BaseConverter} classes.
 * The {@link BaseFormatter} class is used to base encode a number to a string using specified digits,
 * and the {@link BaseConverter} to instead encode to a {@link NumeralOutput} object.
 * 
 * @packageDocumentation
 */

import Decimal from 'decimal.js'

// Basing options on:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat

/**
 * Thrown if the base number exceeds the maximum.
 * @group Exceptions
 **/
export class MaximumBaseExceeded extends Error {}
/**
 * Thrown if the matching digit is not found.
 * @group Exceptions
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
 * The properties of the {@link BaseConverter} class.
 */
export interface BaseConverterProperties
{
    /**
     * How numbers are to be rounded.
     * @defaultValue `'halfExpand'`
     */
    roundingMode: RoundingMode
    /**
     * The precision of the number, the number of significant digits.
     * @defaultValue `32`
     */
    precision: number
    /**
     * The maximum fraction length.
     * By default, the maximum fraction length is determined by the precision.
     * @defaultValue `null`
     */
    maximumFractionLength: number | null
    /**
     * The formatting that should be displayed for the number.
     * @defaultValue `'standard'`
     */
    notation: Notation
}
/**
 * The options passed to {@link BaseConverter} and {@link BaseConverter.encode}.
 */
export type BaseConverterOptions = Partial<BaseConverterProperties>

/**
 * The properties of the {@link BaseFormatter} class.
 */
export interface BaseFormatterProperties
{
    /**
     * The radix character, or "decimal" point/mark/separator, such as the point in `0.5`).
     * @defaultValue `'.'`
     */
    radixCharacter: string
    /**
     * The negative sign.
     * @defaultValue `'-'`
     */
    negativeSign: string
    /**
     * The positive sign.
     * @defaultValue `'+'`
     */
    positiveSign: string
    /**
     * The grouping separator, such as the commas in `100,000,000`.
     * @defaultValue `','`
     */
    groupingSeparator: string
    /**
     * The grouping length, the distance between grouping separators, e.g. with a length of 2: `1,00,00,00`.
     * @defaultValue `3`
     */
    groupingLength: number
    /**
     * The digit separator, if specified, will be places between every digit without a grouping separator.
     * @defaultValue `''`
     */
    digitSeparator: string
    /**
     * The scientific notation character, such as the `e` in `1.342e3`.
     * @defaultValue `'e'`
     */
    scientificNotationCharacter: string
    /**
     * The integer pad character, padding the left side of the integer.
     * By default the specified digit for zero is used,
     * but could also be a `' '` space char for example.
     * @defaultValue `null`
     */
    integerPadCharacter: string | null // the digit zero char if not string
    /**
     * The fraction pad character, padding the right side of the fraction.
     * By default the specified digit for zero is used, but could also be a `' '` space char for example.
     * @defaultValue `null`
     */
    fractionPadCharacter: string | null

    /**
     * The minimum fraction.
     * A value with a smaller fraction length than this number will be
     * right-padded with zeros.
     * @defaultValue `0`
     */
    minimumFractionLength: number
    /**
     * The minimum integer length.
     * A value with a smaller number of integer digits than this number will be
     * left-padded with zeros or the specified integer pad character.
     * @defaultValue `0`
     */
    minimumIntegerLength: number
    /**
     * When to display the radix character.
     * @defaultValue `'auto'`
     */
    radixDisplay: RadixDisplay
    /**
     * When to display the sign.
     * @defaultValue `'auto'`
     */
    signDisplay: SignDisplay
    /**
     * When numbers are to be grouped.
     * @defaultValue `false`
     */
    useGrouping: UseGrouping
}
/**
 * The options passed to {@link BaseFormatter}, {@link BaseFormatter.encode} and {@link BaseFormatter.decode}.
 * It includes the options for the BaseConverter.
 */
export type BaseFormatterOptions = Partial<BaseFormatterProperties> & BaseConverterOptions

/**
 * The numeral output of the {@link BaseConverter.encode} method.
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

/**
 * @param value - The integer value to convert.
 * @param base - The base.
 * @returns A number array of the integer value in the specified base.
 */
function convertIntegerToBase(value: Decimal, base: number): Decimal[]
{
    const baseVal: Decimal[] = []
    let index = 0
    while (value.greaterThanOrEqualTo(base))
    {
        baseVal.push(value.modulo(base))
        value = value.dividedBy(base).floor()
        index++
    }
    if (value.greaterThan(0) || index == 0) baseVal.push(value)
    return baseVal.reverse()
}

/**
 * @param value - The fraction value to convert to the base.
 * @param base - The base.
 * @param maximumLength - The maximum length of the output fraction.
 * @returns A number array of the fraction value in the specified base.
 */
function convertFractionToBase(value: Decimal, base: number, maximumLength: Decimal): Decimal[]
{
    const baseVal: Decimal[] = []
    const prec = maximumLength.toNumber()
    for(let i=0; i<prec && !value.isZero(); i++)
    {
        value = value.times(base)
        const baseDigit = value.floor()
        value = value.minus(baseDigit)
        baseVal.push(baseDigit)
    }
    return baseVal
}


const zero = new Decimal(0)


/**
 * The class from which to create a BaseConverter instance for encoding to the {@link NumeralOutput}.
 */
export class BaseConverter
{
    /**
     * The base number
     */
    public readonly base: number
    /**
     * The properties of the class, set by the options of the constructor
     */
    public readonly properties: BaseConverterProperties
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
     * The constructor of the BaseConverter class.
     * @param base - The base number.
     * @param options - Optional parameters, for adjusting conversion rules.
     */
    constructor(base: number, options: BaseConverterOptions = {})
    {
        this.base = base
        this.properties = {
            roundingMode: 'halfExpand',
            precision: 32,
            maximumFractionLength: null,
            notation: 'standard',

            ...options,
        }

        this.lnBase = new Decimal(this.base).ln()
        this.lnBase3 = new Decimal(Math.pow(this.base, 3)).ln()

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
     * Calculate the exponent of a specified value in the instance base.
     * @param value - The value of which to calculate the exponent.
     * @param isEngineering - Whether to use the engineering notation.
     * @returns The exponent.
     * @group Instance Methods
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
     * Encodes the specified number according to the instance base and properties.
     * @param numberValue - The number to encode, as a number, string or Decimal type.
     * @param options - The options to use as conversion rules.
     * @returns The encoded number as a {@link NumeralOutput} object.
     * @group Instance Methods
     */
    public encode(numberValue: number | string | Decimal, options?: BaseConverterOptions): NumeralOutput
    {
        const props: BaseConverterProperties = {...this.properties, ...options}
        
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
        const maxFractionalLength = (typeof props.maximumFractionLength == "number"
            ? Decimal.min(props.maximumFractionLength, maxFractLengthByPrecision)
            : maxFractLengthByPrecision)

        const intVal = expValue.floor()
        const fractVal = expValue.minus(intVal)
        
        const baseIntVal = convertIntegerToBase(intVal, this.base)
        const baseFractVal = convertFractionToBase(fractVal, this.base, maxFractLengthByPrecision)

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

        return {
            isNegative,
            integer: roundedIntVal.map(v => v.toNumber()),
            fraction: roundedFractVal.map(v => v.toNumber()),
            exponent: makeExponential ? exponent : 0
        }
    }

    /**
     * Decode an encoded number.
     * @param encodedValue - An encoded number as a {@link NumeralOutput} object in the instance base.
     * @param options - The options to use if, for example, alternative characters were specified during encoding.
     * @returns The decoded number.
     * @group Instance Methods
     */
    public decode(encodedValue: NumeralOutput): number
    {
        const largestExponent = encodedValue.integer.length - 1
        return [...encodedValue.integer, ...encodedValue.fraction].reduce((a, c, i) => a + c * Math.pow(this.base, largestExponent-i), 0)
            * Math.pow(this.base, encodedValue.exponent) * (encodedValue.isNegative ? -1 : 1)
    }
}


const numbers = '0123456789'
const asciiUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const asciiLowercase = 'abcdefghijklmnopqrstuvwxyz'
const allDigits = numbers + asciiUppercase + asciiLowercase

/**
 * The class from which to create a BaseFormatter instance for encoding to a string format from specified digits.
 */
export class BaseFormatter
{
    /**
     * Internally used BaseConverter instance.
     */
    private baseConverter: BaseConverter
    /**
     * The base number
     */
    public readonly base: number
    /**
     * The digits to use.
     */
    public readonly digits: string[]
    /**
     * The properties of the class, set by the options of the constructor
     */
    public readonly properties: BaseFormatterProperties
    /**
     * The RegExp object used by the {@link isNumber} method.
     */
    private readonly reValid: RegExp
    /**
     * The zero character of the specified digits. Becomes a `' '` space character if no digits are specified.
     */
    private readonly baseZero: string

    /**
     * The constructor of the BaseFormatter class.
     * @param digits - A string of symbols for representing the digits, the length of which determining the base number.
     * @param options - Optional parameters, for adjusting conversion rules and the encoding output string formatting.
     */
    constructor(digits: string | string [], options: BaseFormatterOptions = {})
    {
        const digitArray = typeof digits === 'string' ? [...digits] : digits
        const base = digitArray.length
        this.baseConverter = new BaseConverter(base, options)
        
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
            minimumFractionLength: 0,
            minimumIntegerLength: 0,
            radixDisplay: 'auto',
            signDisplay: 'auto',
            useGrouping: false,

            ...options
        }
        
        this.digits = digitArray
        this.base = base

        this.baseZero = this.digits[0]
        
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

    /**
     * This method will take the base number, slice a string of digits 0-9A-Za-z to a length equal to the base number
     * and return an instance of the {@link BaseFormatter} class with the sliced string as the digits.
     * @param base - The base number to use, a maximum of `62`.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter} class.
     * @throws {@link MaximumBaseExceeded} when the base number exceeds the maximum amount of this method.
     * @group Static Methods
     */
    public static byBase(base: number, options?: BaseFormatterOptions)
    {
        if (base > allDigits.length) throw new MaximumBaseExceeded("Can't be higher than " + allDigits.length.toString() + " digits")
        return new BaseFormatter([...allDigits].slice(0, base).join(''), options)
    }

    /**
     * This method returns an instance of the {@link BaseFormatter} class in base 2 with the digits `'01'`.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter} class.
     * @group Static Methods
     */
    public static binary(options?: BaseFormatterOptions) { return BaseFormatter.byBase(2, options) }
    /**
     * This method returns an instance of the {@link BaseFormatter} class in base 8 with the digits `'01234567'`.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter} class.
     * @group Static Methods
     */
    public static octal(options?: BaseFormatterOptions) { return BaseFormatter.byBase(8, options) }
    /**
     * This method returns an instance of the {@link BaseFormatter} class in base 10 with the digits `'0123456789'`.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter} class.
     * @group Static Methods
     */
    public static decimal(options?: BaseFormatterOptions) { return BaseFormatter.byBase(10, options) }
    /**
     * This method returns an instance of the {@link BaseFormatter} class in base 16 with the digits `'0123456789ABCDEF'`.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter} class.
     * @group Static Methods
     */
    public static hexadecimal(options?: BaseFormatterOptions) { return BaseFormatter.byBase(16, options) }
    /**
     * This method returns an instance of the {@link BaseFormatter} class in base 12 with the digits `'0123456789↊↋'` and the radix character of `';'`.
     * The digits ↊ and ↋ as used by the Dozenal Societies of America and Great Britain.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter} class.
     * @group Static Methods
     */
    public static dozenal(options?: BaseFormatterOptions)
        { return new BaseFormatter(numbers + '↊↋', {radixCharacter: ';', ...options}) }
    /**
     * This method returns an instance of the {@link BaseFormatter} class in base 12 with the digits `'0123456789TE'` and the radix character of `';'`.
     * The digits T and E are the ASCII variations of the digits ↊ and ↋ used by the {@link BaseFormatter.dozenal} method in case a font doesn't have them.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter} class.
     * @group Static Methods
     */
    public static dozenalInitials(options?: BaseFormatterOptions)
        { return new BaseFormatter(numbers + 'TE', {radixCharacter: ';', ...options}) }
    /**
     * This method returns an instance of the {@link BaseFormatter} class in base 12 with the digits `'0123456789XE'` and the radix character of `';'`.
     * Uses a variant of the digit for 10 using the Roman numeral X.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter} class.
     * @group Static Methods
     */
    public static dozenalRoman(options?: BaseFormatterOptions)
        { return new BaseFormatter(numbers + 'XE', {radixCharacter: ';', ...options}) }
    /**
     * This method returns an instance of the {@link BaseFormatter} class in base 12 with the digits `'0123456789AB'`.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter} class.
     * @group Static Methods
     */
    public static duodecimal(options?: BaseFormatterOptions) { return BaseFormatter.byBase(12, options) }
    /**
     * This method returns an instance of the {@link BaseFormatter} class in base 20 with the digits `'0123456789ABCDEFGHJK'`,
     * skipping over I in order to avoid confusion between I and 1.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter} class.
     * @group Static Methods
     */
    public static vigesimal(options?: BaseFormatterOptions) { return new BaseFormatter(numbers + "ABCDEFGHJK", options) }
    /**
     * This method returns an instance of the {@link BaseFormatter} class in base 57 with the digits 0-9A-Ba-b without the characters Il1O0.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter} class.
     * @group Static Methods
     */
    public static base57(options?: BaseFormatterOptions)
    {
        const digits = (numbers + asciiUppercase + asciiLowercase)
            .replace('I', '')
            .replace('l', '')
            .replace('1', '')
            .replace('O', '')
            .replace('0', '')
        return new BaseFormatter(digits, options)
    }
    /**
     * This method returns an instance of the {@link BaseFormatter} class in base 58 with the digits 0-9A-Ba-b without the characters IlO0.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter} class.
     * @group Static Methods
     */
    public static base58(options?: BaseFormatterOptions)
    {
        const digits = (numbers + asciiUppercase + asciiLowercase)
            .replace('I', '')
            .replace('l', '')
            .replace('O', '')
            .replace('0', '')
        return new BaseFormatter(digits, options)
    }
    /**
     * This method returns an instance of the {@link BaseFormatter} class in base 60 with the digits 0-9A-Ba-b without the characters l0.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter} class.
     * @group Static Methods
     */
    public static sexagesimal(options?: BaseFormatterOptions)
    {
        const digits = (numbers + asciiUppercase + asciiLowercase)
            .replace('l', '')
            .replace('O', '')
        return new BaseFormatter(digits, options)
    }
    /**
     * This method returns an instance of the {@link BaseFormatter} class in base 60 using cuneiform digits.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter} class.
     * @group Static Methods
     */
    public static cuneiform(options?: BaseFormatterOptions)
    {
        const ones = [...'𒑊𒐕𒐖𒐗𒐘𒐙𒐚𒐛𒐜𒐝']
        const tens = ['',...'𒌋𒑱𒌍𒐏𒐐']
        const digits = tens.map(t => ones.map(o => t + o)).flat().join('')
        return new BaseFormatter(digits,
        {
            radixCharacter: ';',
            integerPadCharacter: ' ',
            fractionPadCharacter: ' ',

            ...options
        })
    }
    /**
     * This method returns an instance of the {@link BaseFormatter} class in base 62 with the digits 0-9A-Ba-b.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter} class.
     * @group Static Methods
     */
    public static base62(options?: BaseFormatterOptions) { return BaseFormatter.byBase(62, options) }
    /**
     * This method returns an instance of the {@link BaseFormatter} class in base 98 using Unicode domino tiles.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter} class.
     * @group Static Methods
     */
    public static domino(options?: BaseFormatterOptions)
    {
        const chars =
           '🁣🁤🁥🁦🁧🁨🁩🀱🀲🀳🀴🀵🀶🀷'
         + '🁪🁫🁬🁭🁮🁯🁰🀸🀹🀺🀻🀼🀽🀾'
         + '🁱🁲🁳🁴🁵🁶🁷🀿🁀🁁🁂🁃🁄🁅'
         + '🁸🁹🁺🁻🁼🁽🁾🁆🁇🁈🁉🁊🁋🁌'
         + '🁿🂀🂁🂂🂃🂄🂅🁍🁎🁏🁐🁑🁒🁓'
         + '🂆🂇🂈🂉🂊🂋🂌🁔🁕🁖🁗🁘🁙🁚'
         + '🂍🂎🂏🂐🂑🂒🂓🁛🁜🁝🁞🁟🁠🁡'
        return new BaseFormatter(chars,
        {
            radixCharacter: '🁢',
            negativeSign: '🀰',
            ...options
        })
    }


    /**
     * Encode the value array using the instance digits.
     * @param value - The number array to encode.
     * @param opts - The options used.
     * @returns The encoded value.
     * @group Instance Methods
     */
    private encodeInteger(value: (number | string)[], opts: BaseFormatterProperties): string
    {
        return value
            .map(n => typeof n === 'string' ? n : this.encodeDigit(n))
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
     * Encode a single digit.
     * @param value - The number to convert.
     * @returns The encoded digit.
     * @throws {@link DigitNotFound} when no digit could be found for the specified number.
     * @group Instance Methods
     */
    private encodeDigit(value: number): string
    {
        if (!this.digits[value]) throw new DigitNotFound('No digit found for number specified')
        return this.digits[value]
    }

    /**
     * Decode a single digit.
     * @param value - The digit to convert to a number.
     * @returns The decoded digit.
     * @throws {@link DigitNotFound} when the string is not found in the digits.
     * @group Instance Methods
     */
    private decodeDigit(value: string): number
    {
        const digitIndex = this.digits.indexOf(value)
        if (!(digitIndex >= 0)) throw new DigitNotFound('String value not found in digits')
        return digitIndex
    }

    /**
     * Encodes the specified number according to the instance base and specified digits and properties.
     * @param numberValue - The number to encode, as a number, string or Decimal type.
     * @param options - The options to use for formatting.
     * @returns the encoded number as a string.
     * @group Instance Methods
     */
    public encode(numberValue: number | string | Decimal, options?: BaseFormatterOptions): string
    {
        const converterProps: BaseConverterProperties = {
            ...this.baseConverter.properties,
            ...options
        }
        const props: BaseFormatterProperties = {
            ...this.properties,
            ...options}
        
        if (typeof props.integerPadCharacter !== "string")
            props.integerPadCharacter = this.baseZero
        if (typeof props.fractionPadCharacter !== "string")
            props.fractionPadCharacter = this.baseZero
        props.minimumFractionLength = converterProps.maximumFractionLength
            ? Math.min(props.minimumFractionLength, converterProps.maximumFractionLength)
            : props.minimumFractionLength
        
        const decVal = new Decimal(numberValue)

        const {isNegative, integer, fraction, exponent} = this.baseConverter.encode(numberValue, options)
        
        const encodedIntVal = this.encodeInteger(
            (props.minimumIntegerLength && props.minimumIntegerLength > integer.length
            ? [...createPadArray((new Decimal(props.minimumIntegerLength)).minus(integer.length), props.integerPadCharacter), ...integer]
            : integer), props)
        
        const encodedFractVal =
            (props.minimumFractionLength > fraction.length
                ? [...fraction, ...createPadArray(new Decimal(props.minimumFractionLength-fraction.length), props.fractionPadCharacter)]
                : fraction)
            .map(n => typeof n === 'string' ? n : this.encodeDigit(n))
            .join('')
        
        const signSymbol = isNegative ? props.negativeSign : props.positiveSign
        const outputSignSymbol = 
            (props.signDisplay == "always" && signSymbol)
            || (props.signDisplay == "exceptZero" && !decVal.isZero() && signSymbol)
            || (props.signDisplay == "negative" && decVal.lessThan(0) && signSymbol)
            || (props.signDisplay == "never" && '')
            || props.signDisplay == "auto" && isNegative ? signSymbol : ''
        
        const encodedExponent = converterProps.notation !== 'standard' && exponent != 0
            ? (props.scientificNotationCharacter + (this.encode(exponent, {...props, notation: 'standard', minimumFractionLength: 0, maximumFractionLength: 0, minimumIntegerLength: 0})))
            : ''
        
        return outputSignSymbol
            + encodedIntVal
            + (encodedFractVal || props.radixDisplay === 'always' ? (props.radixCharacter + encodedFractVal) : '')
            + encodedExponent
    }


    /**
     * Decode an en encoded number according to the instance base and specified digits and properties.
     * @param encodedValue - An encoded number as a string in the instance base.
     * @param options - The options to use if, for example, alternative characters were specified during encoding.
     * @returns The decoded number.
     * @throws {@link DigitNotFound} when the specified string contains unknown characters.
     * @group Instance Methods
     */
    public decode(encodedValue: string, options?: BaseFormatterOptions): number
    {
        const opts: BaseFormatterProperties = {...this.properties, ...options}

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

        const integerArray = radixCharIndex >= 0 ? valueArray.slice(0, radixCharIndex) : valueArray
        const fractionArray = radixCharIndex >= 0 ? valueArray.slice(radixCharIndex+1) : []

        return this.baseConverter.decode({
            isNegative,
            integer: integerArray.map((d) => this.decodeDigit(d)),
            fraction: fractionArray.map((d) => this.decodeDigit(d)),
            exponent: exponent
        }) 
        
        
    }
    
    /**
     * Check if the specified value is a number according to the instance base and specified digits and properties.
     * @param value - A string to check.
     * @returns Whether the specified string is a number.
     * @group Instance Methods
     */
    public isNumber(value: string): boolean
    {
        return this.reValid.test(value)
    }
}
export default BaseFormatter

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
 * The `base-formatter` defines the {@link BaseFormatter | `BaseFormatter`} and {@link BaseConverter | `BaseConverter`} classes.
 * The {@link BaseFormatter | `BaseFormatter`} class is used to base encode a number to a string using specified digits,
 * and the {@link BaseConverter | `BaseConverter`} to instead encode to a {@link NumeralOutput | `NumeralOutput`} object.
 * 
 * @packageDocumentation
 */

import { Decimal } from 'decimal.js'

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
 * The options passed to {@link BaseConverter | `BaseConverter`} and {@link BaseConverter.encode | `BaseConverter.encode`}.
 */
export interface BaseConverterOptions
{
    /** {@inheritDoc BaseConverter.roundingMode} */
    roundingMode?: RoundingMode
    /** {@inheritDoc BaseConverter.precision} */
    precision?: number
    /** {@inheritDoc BaseConverter.maximumFractionLength} */
    maximumFractionLength?: number | null
    /** {@inheritDoc BaseConverter.notation} */
    notation?: Notation
}
type BaseConverterProperties = Required<BaseConverterOptions>

/**
 * The options specifically to the {@link BaseFormatter | `BaseFormatter`} class.
 * @internal
 */
export interface BaseFormatterOnlyOptions
{
    /** {@inheritDoc BaseFormatter.radixCharacter} */
    radixCharacter?: string
    /** {@inheritDoc BaseFormatter.negativeSign} */
    negativeSign?: string
    /** {@inheritDoc BaseFormatter.positiveSign} */
    positiveSign?: string
    /** {@inheritDoc BaseFormatter.groupingSeparator} */
    groupingSeparator?: string
    /** {@inheritDoc BaseFormatter.groupingLength} */
    groupingLength?: number
    /** {@inheritDoc BaseFormatter.digitSeparator} */
    digitSeparator?: string
    /** {@inheritDoc BaseFormatter.scientificNotationCharacter} */
    scientificNotationCharacter?: string
    /** {@inheritDoc BaseFormatter.integerPadCharacter} */
    integerPadCharacter?: string | null
    /** {@inheritDoc BaseFormatter.fractionPadCharacter} */
    fractionPadCharacter?: string | null

    /** {@inheritDoc BaseFormatter.minimumFractionLength} */
    minimumFractionLength?: number
    /** {@inheritDoc BaseFormatter.minimumIntegerLength} */
    minimumIntegerLength?: number
    /** {@inheritDoc BaseFormatter.radixDisplay} */
    radixDisplay?: RadixDisplay
    /** {@inheritDoc BaseFormatter.signDisplay} */
    signDisplay?: SignDisplay
    /** {@inheritDoc BaseFormatter.useGrouping} */
    useGrouping?: UseGrouping
}
type BaseFormatterProperties = Required<BaseFormatterOnlyOptions>

/**
 * The options passed to {@link BaseFormatter | `BaseFormatter`}, {@link BaseFormatter.encode | `BaseFormatter.encode`} and {@link BaseFormatter.decode | `BaseFormatter.decode`}.
 * It includes the options for the {@link BaseConverter | `BaseConverter`}.
 */
export interface BaseFormatterOptions extends BaseConverterOptions, BaseFormatterOnlyOptions {}

/**
 * The numeral output of the {@link BaseConverter.encode | `BaseConverter.encode`} method.
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

const dateTimeTokens = [
    'Y', 'y',
    'M',
    'N', 'n',
    'D', 'd',
    'W', 'w',
    'V', 'v',
    'j',
    'H', 'h', 'K', 'k',
    'i',
    's',
    'S',
    'A', 'a',
    'e',
    'p',
    'Z', 'T',
    'z',
    'g',
    'Q',
    'u'

] as const
type DateTimeToken = typeof dateTimeTokens[number]

const reDateTimeToken = new RegExp('\\[(.+?)\\]|(' + dateTimeTokens.map(l => l + '+').join('|') + ')(o)?', 'g')

const getTimezoneOffset = (date: Date, timeZone: string) =>
{
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone }))
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
    return (tzDate.getTime() - utcDate.getTime()) / 6e4
}

const toRepValue = (length: number) => (['narrow', 'short', 'long'] as const)[Math.min(2, length-1)]

const getDaysInYear = (d: Date) =>
    Math.ceil((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5)

/**
 * The class from which to create a `BaseConverter` instance for encoding to the {@link NumeralOutput | `NumeralOutput`}.
 */
export class BaseConverter
{
    /**
     * The base number
     */
    public readonly base: number
    
    /**
     * How numbers are to be rounded.
     */
    public readonly roundingMode: RoundingMode = 'halfExpand'
    /**
     * The precision of the number, the number of significant digits.
     */
    public readonly precision: number = 32
    /**
     * The maximum fraction length.
     * By default, the maximum fraction length is determined by the precision.
     */
    public readonly maximumFractionLength: number | null = null
    /**
     * The formatting that should be displayed for the number.
     */
    public readonly notation: Notation = 'standard'

    /**
     * The rounding modes used by the {@link encode | `encode`} method.
     */
    private readonly roundingModes: {
        [mode in RoundingMode]: (value: Decimal, isNegative: boolean, index: number, values: (Decimal | null)[]) => boolean
    }
    /**
     * The natural logarithm of the base used by the {@link calculateExponent | `calculateExponent`} method.
     */
    private readonly lnBase: Decimal
    /**
     * The natural logarithm of base*10^3 used by the {@link calculateExponent | `calculateExponent`} method.
     */
    private readonly lnBase3: Decimal

    /**
     * The constructor of the `BaseConverter` class.
     * @param base - The base number.
     * @param options - Optional parameters, for adjusting conversion rules.
     */
    constructor(base: number, options: BaseConverterOptions = {})
    {
        this.base = base
        Object.assign(this, options)

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
     * @returns The encoded number as a {@link NumeralOutput | `NumeralOutput`} object.
     * @group Instance Methods
     */
    public encode(numberValue: number | string | Decimal, options?: BaseConverterOptions): NumeralOutput
    {
        const props: BaseConverterProperties = {...this, ...options}
        
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
        const roundedIntVal = baseVal.slice(0, nullPos)
        const roundedFractVal = baseVal.slice(nullPos+1)

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
     * @param encodedValue - An encoded number as a {@link NumeralOutput | `NumeralOutput`} object in the instance base.
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
 * The class from which to create a `BaseFormatter` instance for encoding to a string format from specified digits.
 */
export class BaseFormatter
{
    /**
     * Internally used {@link BaseConverter | `BaseConverter`} instance.
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
     * The radix character, or "decimal" point/mark/separator, such as the point in `0.5`).
     */
    public readonly radixCharacter: string = '.'
    /**
     * The negative sign.
     */
    public readonly negativeSign: string = '-'
    /**
     * The positive sign.
     */
    public readonly positiveSign: string = '+'
    /**
     * The grouping separator, such as the commas in `100,000,000`.
     */
    public readonly groupingSeparator: string = ','
    /**
     * The grouping length, the distance between grouping separators, e.g. with a length of 2: `1,00,00,00`.
     */
    public readonly groupingLength: number = 3
    /**
     * The digit separator, if specified, will be places between every digit without a grouping separator.
     */
    public readonly digitSeparator: string = ''
    /**
     * The scientific notation character, such as the `e` in `1.342e3`.
     */
    public readonly scientificNotationCharacter: string = 'e'
    /**
     * The integer pad character, padding the left side of the integer.
     * By default the specified digit for zero is used,
     * but could also be a `' '` space char for example.
     */
    public readonly integerPadCharacter: string | null = null
    /**
     * The fraction pad character, padding the right side of the fraction.
     * By default the specified digit for zero is used, but could also be a `' '` space char for example.
     */
    public readonly fractionPadCharacter: string | null = null

    /**
     * The minimum fraction.
     * A value with a smaller fraction length than this number will be
     * right-padded with zeros.
     */
    public readonly minimumFractionLength: number = 0
    /**
     * The minimum integer length.
     * A value with a smaller number of integer digits than this number will be
     * left-padded with zeros or the specified integer pad character.
     */
    public readonly minimumIntegerLength: number = 0
    /**
     * When to display the radix character.
     */
    public readonly radixDisplay: RadixDisplay = 'auto'
    /**
     * When to display the sign.
     */
    public readonly signDisplay: SignDisplay = 'auto'
    /**
     * When numbers are to be grouped.
     */
    public readonly useGrouping: UseGrouping = false
    
    /**
     * The RegExp object used by the {@link isNumber | `isNumber`} method.
     */
    private readonly reValid: RegExp
    /**
     * The zero character of the specified digits. Becomes a `' '` space character if no digits are specified.
     */
    private readonly baseZero: string

    /**
     * The constructor of the `BaseFormatter` class.
     * @param digits - A string of symbols for representing the digits, the length of which determining the base number.
     * @param options - Optional parameters, for adjusting conversion rules and the encoding output string formatting.
     */
    constructor(digits: string | string [], options: BaseFormatterOptions = {})
    {
        const digitArray = typeof digits === 'string' ? [...digits] : digits
        const base = digitArray.length
        this.baseConverter = new BaseConverter(base, options)
        Object.assign(this, options)
        
        this.digits = digitArray
        this.base = base

        this.baseZero = this.digits[0]
        
        const u = (v: string): string => v
            ? v.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('')
            : ''
        const uDigits = this.digits.map(d => u(d)).join('')
        const signPattern = '['
            + u(this.negativeSign)
            + u(this.positiveSign)
        + ']?'
        
        const pattern = '^'
        + signPattern
        + '['
            + uDigits
            + u(this.digitSeparator)
            + u(this.groupingSeparator)
        + ']+'
        + '(?:'
            + u(this.radixCharacter)
            + '[' + uDigits + ']*'
        + ')?'
        + '(?:'
            + u(this.scientificNotationCharacter)
            + signPattern
            + '[' + uDigits + ']+'
        + ')?'
        + '$'
        this.reValid = new RegExp(pattern, 'u')
    }

    /**
     * This method will take the base number, slice a string of digits 0-9A-Za-z to a length equal to the base number
     * and return an instance of the {@link BaseFormatter | `BaseFormatter`} class with the sliced string as the digits.
     * @param base - The base number to use, a maximum of `62`.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter | `BaseFormatter`} class.
     * @throws {@link MaximumBaseExceeded | `MaximumBaseExceeded`} when the base number exceeds the maximum amount of this method.
     * @group Static Methods
     */
    public static byBase(base: number, options?: BaseFormatterOptions)
    {
        if (base > allDigits.length) throw new MaximumBaseExceeded("Can't be higher than " + allDigits.length.toString() + " digits")
        return new BaseFormatter([...allDigits].slice(0, base).join(''), options)
    }

    /**
     * This method returns an instance of the {@link BaseFormatter | `BaseFormatter`} class in base 2 with the digits `'01'`.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter | `BaseFormatter`} class.
     * @group Static Methods
     */
    public static binary(options?: BaseFormatterOptions) { return BaseFormatter.byBase(2, options) }
    /**
     * This method returns an instance of the {@link BaseFormatter | `BaseFormatter`} class in base 8 with the digits `'01234567'`.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter | `BaseFormatter`} class.
     * @group Static Methods
     */
    public static octal(options?: BaseFormatterOptions) { return BaseFormatter.byBase(8, options) }
    /**
     * This method returns an instance of the {@link BaseFormatter | `BaseFormatter`} class in base 10 with the digits `'0123456789'`.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter | `BaseFormatter`} class.
     * @group Static Methods
     */
    public static decimal(options?: BaseFormatterOptions) { return BaseFormatter.byBase(10, options) }
    /**
     * This method returns an instance of the {@link BaseFormatter | `BaseFormatter`} class in base 16 with the digits `'0123456789ABCDEF'`.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter | `BaseFormatter`} class.
     * @group Static Methods
     */
    public static hexadecimal(options?: BaseFormatterOptions) { return BaseFormatter.byBase(16, options) }
    /**
     * This method returns an instance of the {@link BaseFormatter | `BaseFormatter`} class in base 12 with the digits `'0123456789↊↋'` and the radix character of `';'`.
     * The digits ↊ and ↋ as used by the Dozenal Societies of America and Great Britain.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter | `BaseFormatter`} class.
     * @group Static Methods
     */
    public static dozenal(options?: BaseFormatterOptions)
        { return new BaseFormatter(numbers + '↊↋', {radixCharacter: ';', ...options}) }
    /**
     * This method returns an instance of the {@link BaseFormatter | `BaseFormatter`} class in base 12 with the digits `'0123456789TE'` and the radix character of `';'`.
     * The digits T and E are the ASCII variations of the digits ↊ and ↋ used by the {@link BaseFormatter.dozenal | `BaseFormatter.dozenal`} method in case a font doesn't have them.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter | `BaseFormatter`} class.
     * @group Static Methods
     */
    public static dozenalInitials(options?: BaseFormatterOptions)
        { return new BaseFormatter(numbers + 'TE', {radixCharacter: ';', ...options}) }
    /**
     * This method returns an instance of the {@link BaseFormatter | `BaseFormatter`} class in base 12 with the digits `'0123456789XE'` and the radix character of `';'`.
     * Uses a variant of the digit for 10 using the Roman numeral X.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter | `BaseFormatter`} class.
     * @group Static Methods
     */
    public static dozenalRoman(options?: BaseFormatterOptions)
        { return new BaseFormatter(numbers + 'XE', {radixCharacter: ';', ...options}) }
    /**
     * This method returns an instance of the {@link BaseFormatter | `BaseFormatter`} class in base 12 with the digits `'0123456789AB'`.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter | `BaseFormatter`} class.
     * @group Static Methods
     */
    public static duodecimal(options?: BaseFormatterOptions) { return BaseFormatter.byBase(12, options) }
    /**
     * This method returns an instance of the {@link BaseFormatter | `BaseFormatter`} class in base 20 with the digits `'0123456789ABCDEFGHJK'`,
     * skipping over I in order to avoid confusion between I and 1.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter | `BaseFormatter`} class.
     * @group Static Methods
     */
    public static vigesimal(options?: BaseFormatterOptions) { return new BaseFormatter(numbers + "ABCDEFGHJK", options) }
    /**
     * This method returns an instance of the {@link BaseFormatter | `BaseFormatter`} class in base 57 with the digits 0-9A-Ba-b without the characters Il1O0.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter | `BaseFormatter`} class.
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
     * This method returns an instance of the {@link BaseFormatter | `BaseFormatter`} class in base 58 with the digits 0-9A-Ba-b without the characters IlO0.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter | `BaseFormatter`} class.
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
     * This method returns an instance of the {@link BaseFormatter | `BaseFormatter`} class in base 60 with the digits 0-9A-Ba-b without the characters l0.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter | `BaseFormatter`} class.
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
     * This method returns an instance of the {@link BaseFormatter | `BaseFormatter`} class in base 60 using cuneiform digits.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter | `BaseFormatter`} class.
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
     * This method returns an instance of the {@link BaseFormatter | `BaseFormatter`} class in base 62 with the digits 0-9A-Ba-b.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter | `BaseFormatter`} class.
     * @group Static Methods
     */
    public static base62(options?: BaseFormatterOptions) { return BaseFormatter.byBase(62, options) }
    /**
     * This method returns an instance of the {@link BaseFormatter | `BaseFormatter`} class in base 98 using Unicode domino tiles.
     * @param options - The options to use.
     * @returns An instance of the {@link BaseFormatter | `BaseFormatter`} class.
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
     * @throws {@link DigitNotFound | `DigitNotFound`} when no digit could be found for the specified number.
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
     * @throws {@link DigitNotFound | `DigitNotFound`} when the string is not found in the digits.
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
     * @returns The encoded number as a string.
     * @group Instance Methods
     */
    public encode(numberValue: number | string | Decimal, options?: BaseFormatterOptions): string
    {
        const converterProps: BaseConverterProperties = {
            ...this.baseConverter,
            ...options
        }
        const props: BaseFormatterProperties = {...this, ...options}
        
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
     * @throws {@link DigitNotFound | `DigitNotFound`} when the specified string contains unknown characters.
     * @group Instance Methods
     */
    public decode(encodedValue: string, options?: BaseFormatterOptions): number
    {
        const opts: BaseFormatterProperties = {...this, ...options}

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
     * Encode a date-time object into a formatted string, converting the numbers to the specified base.
     * @param dateTime - A Day.js object.
     * @param format - The output date-time format.
     * 
     * The format is made up of a series of tokens.
     * For numbers, multiples of the token indicate the minimum padded length unless specified otherwise.
     * Month names, names of the days of the week, day period and era are output according to the locale
     * specified within the Day.js object.
     * 
     * 
     * The tokens:
     * - `Y`: The year.
     * - `y`: The year, multiples of which indicate the maximum length,
     *        e.g. The year `2023` formatted with `yy` returns `'23'`.
     * - `M`: The month, e.g. A date in September formatted with `MM` returns `'09'`.
     * - `m`: The abbreviated month name, e.g. `'Sep'` for September.
     * - `mm`: The full month name.
     * - `D`: The day of the month.
     * - `d`: The day of the year. Dependent on the `dayOfYear` Day.js plugin.
     * - `W`: The day of the week, starting from 1.
     * - `w`: The day of the week, starting from 0.
     * - `v`: The min name of the day of the week, e.g. `'We'` for Wednesday.
     * - `vv`: The short name of the day of the week, e.g. `'Wed'` for Wednesday.
     * - `vvv`: The full name of the day of the week.
     * - `j`: The week number of the year. Dependent on the `weekOfYear` Day.js plugin.
     * - `H`: The hour, 0 to 23.
     * - `h`: The hour, 1 to 12.
     * - `K`: The hour, 1 to 24.
     * - `k`: The hour, 0 to 11.
     * - `i`: The minutes.
     * - `s`: The seconds.
     * - `S`: The "milliseconds", the equivelent thousandth of a second.
     * - `A`: `'AM'` or `'PM'`.
     * - `a`: `'am'` or `'pm'`.
     * - `Z`: The UTC offset hour with sign. Combined with `T` as
     *        e.g. `'ZZ:TT'` to return `'+07:00'` for a UTC offset of 420 minutes.
     *        Dependent on the `timezone` Day.js plugin.
     * - `T`: The minutes of the UTC offset hour, used in combination with `Z`.
     *        Dependent on the `timezone` Day.js plugin.
     * - `Q`: The year quarter, `1` to `4`.
     * - `u`: Unix Timestamp.
     * - `z`: Abbreviated named offset. Dependent on the `timezone` Day.js plugins.
     * - `zz`: Unabbreviated named offset. Dependent on the `timezone` Day.js plugins.
     * 
     * 
     * Various formats:
     * - ISO 8601: `'YYYY-MM-DD[T]HH:ii:ssttzz'`
     * - RFC 2822: `'vvv, DD mmm YYYY HH:ii:ss ttzz'`
     * - Short: `D/M/yy`
     * - US: `MM-DD-YYYY`
     * @param options - The options to use for formatting.
     * @returns The encoded and formatted date-time.
     * @example
     * dozenal.encodedDateTime(dayjs('2023-12-25'), 'YYYY-MM-DD') // Returns: '1207-10-21'
     * @group Instance Methods
     */
    public encodeDateTime(dateTime: number | Date, format: string, inputTimeZone?: string, inputLocale?: string, options?: BaseFormatterOptions)
    {
        const formatting = Intl.DateTimeFormat(inputLocale, { timeZone: inputTimeZone })
        const { timeZone, locale } = formatting.resolvedOptions()
        const intlLocale = new Intl.Locale(locale)
        // @ts-ignore
        let { firstDay, minimalDays } = intlLocale.weekInfo

        const ud = typeof dateTime === 'number'
            ? new Date(dateTime) : dateTime

        const utcOffset = timeZone
            ? getTimezoneOffset(ud, timeZone)
            : ud.getTimezoneOffset()
        
        const d = new Date(ud.getTime() + utcOffset*6e4)

        const getIntlData = (key: string, value: string) =>
            Intl.DateTimeFormat(locale, {timeZone, [key]: value}).formatToParts(ud)
                .find(({type}) => type === key).value
        
        const getDay = () =>
        {
            const adj = d.getUTCDay() - firstDay % 7
            return adj >= 0 ? adj : 7 + adj
        }

        const getWeek = () => Math.ceil(getDaysInYear(
                new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getDate()-getDay()+(7-minimalDays)))/7)

        const dateTimeTokenFunctions: {[token in DateTimeToken]: (length: number) => number | string } =
        {
            Y: l => d.getUTCFullYear(),
            y: l => d.getUTCFullYear(),
            M: l => d.getUTCMonth()+1,
            N: l => ud.toLocaleString(locale, {timeZone, month: 'long'}).substring(0, l),
            n: l => ud.toLocaleString(locale, {timeZone, month: toRepValue(l)}),
            D: l => d.getUTCDate(),
            d: l => getDaysInYear(d),
            W: l => getDay() + 1,
            w: l => getDay(),
            V: l => ud.toLocaleString(locale, {timeZone, weekday: 'long'}).substring(0, l),
            v: l => ud.toLocaleString(locale, {timeZone, weekday: toRepValue(l)}),
            j: l => getWeek(),
        
            H: l => d.getUTCHours(),
            h: l => (d.getUTCHours() % 12) || 12,
            K: l => d.getUTCHours() || 24,
            k: l => d.getUTCHours() % 12,
            i: l => d.getUTCMinutes(),
            s: l => d.getUTCSeconds(),
            S: l => d.getUTCMilliseconds(),
            A: l => d.getUTCHours() < 12 ? ['A', 'AM', 'A.M.'][Math.min(l-1, 2)] : ['P', 'PM', 'P.M.'][Math.min(l-1, 2)],
            a: l => d.getUTCHours() < 12 ? ['a', 'am', 'a.m.'][Math.min(l-1, 2)] : ['p', 'pm', 'p.m.'][Math.min(l-1, 2)],
            p: l => ud.toLocaleString(locale, {timeZone, dayPeriod: toRepValue(l)}),
            e: l => getIntlData('era', toRepValue(l)),
            
            Z: l => Math.trunc(utcOffset / 60),
            T: l => Math.abs(utcOffset) % 60,
        
            z: l => getIntlData('timeZoneName', l > 1 ? 'long' : 'short'),
            g: l => getIntlData('timeZoneName', l > 1 ? 'longGeneric' : 'shortGeneric'),
        
            Q: l => Math.floor(d.getUTCMonth()/4)+1,
        
            u: l => Math.floor(ud.getTime()/1000)
        }

        const opts: BaseFormatterProperties = {...this, ...options}
        return format.replace(reDateTimeToken, (_, escaped, tokens, mod) =>
        {
            const token = tokens.charAt(0)
            const length = tokens.length
            if (escaped) return escaped
            let output = dateTimeTokenFunctions[token](length)
            if (typeof output === 'string') return output
            const isMilli = token === 'S'
            if (isMilli) output /= 1000
            let encodedOutput = this.encode(output, {
                ...options,
                minimumIntegerLength: length,
                minimumFractionLength: (isMilli ? 4 : 0),
                maximumFractionLength: (isMilli ? 4 : null),
                signDisplay: token === 'Z' ? 'always' : 'auto'
            })
            if (isMilli) encodedOutput = encodedOutput.split(opts.radixCharacter)[1]
            return token === 'y'
                ? encodedOutput.substring((encodedOutput.length-length)-1)
                : encodedOutput
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

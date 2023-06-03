/*
 * base-formatter
 * Copyright (C) 2023 2sh <contact@2sh.me>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Decimal from 'decimal.js'

// Basing options on:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat

/**
 * - 'auto': Only show the radix character with the fraction.
 * - 'always': Always show the radix character.
 */
export type RadixDisplay =
      'auto'
    | 'always'

/**
 * - 'auto': sign display for negative numbers only, including negative zero.
 * - 'always': always display sign.
 * - 'exceptZero': sign display for positive and negative numbers, but not zero.
 * - 'negative': sign display for negative numbers only, excluding negative zero.
 * - 'never': never display sign.
 */
export type SignDisplay =
      'auto'
    | 'always'
    | 'exceptZero'
    | 'negative'
    | 'never'

/**
 * - 'ceil': Round towards positive infinity.
 * - 'floor': Round towards negative infinity.
 * - 'expand': Round away from zero.
 * - 'trunc': Round towards zero.
 * - 'halfCeil': Values above or equal to the half-increment round like ceil, otherwise like floor.
 * - 'halfFloor': Values above the half-increment round like ceil, otherwise like floor.
 * - 'halfExpand': Values above or equal to the half-increment round like expand, otherwise like trunc.
 * - 'halfTrunc': Values above the half-increment round like expand, otherwise like trunc.
 * - 'halfEven': Like halfExpand, except that on the half-increment values round towards the nearest even digit.
 * - 'halfOdd': Like halfExpand, except that on the half-increment values round towards the nearest odd digit.
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
 * - 'standard': Plain number formatting.
 * - 'scientific': Return the order-of-magnitude for formatted number.
 * - 'engineering': Return the exponent of ten when divisible by three.
 */
export type Notation =
      'standard'
    | 'scientific'
    | 'engineering'

/**
 * - 'always': Always display the group separators.
 * - 'min2': Display grouping separators when there are at least 2 digits in a group.
 * - false: Do not display grouping separators.
 * - true: alias for 'always'
 */
export type UseGrouping =
      false
    | true
    | 'always'
    | 'min2'

/**
 * The properties of the base class
 */
interface Properties
{
    /**
     * The radix character, or "decimal" point/mark/separator, such as the point in 0.5)
     */
    radixCharacter: string
    /**
     * The negative sign, such as a minus(-)
     */
    negativeSign: string
    /**
     * The positive sign, such as a plus(+)
     */
    positiveSign: string
    /**
     * The grouping separator, such as the commas in 100,000,000
     */
    groupingSeparator: string
    /**
     * The grouping length, the distance between grouping separators, e.g. with a length of 2: 1,00,00,00
     */
    groupingLength: number
    /**
     * The digit separator, if specified, will be places between every digit without a grouping separator
     */
    digitSeparator: string
    /**
     * The scientific notation character, such as the e in 1.342e3
     */
    scientificNotationCharacter: string
    /**
     * The integer pad character, padding the left side of the integer.
     * By default the specific character for zero,
     * but could also be a ' ' space char for example
     */
    integerPadCharacter: string | null // the digit zero char if not string
    /**
     * The fraction pad character, padding the right side of the fraction.
     * By default the specific character for zero, but could also be a ' ' space char for example
     */
    fractionPadCharacter: string | null


    /**
     * When to display the radix character
     */
    radixDisplay: RadixDisplay
    /**
     * When to display the sign
     */
    signDisplay: SignDisplay
    /**
     * How numbers are to be rounded
     */
    roundingMode: RoundingMode
    /**
     * The precision of the number, the number of significant digits.
     */
    precision: number
    /**
     * If specified, the exact number of fraction Digits
     */
    fractionDigits: number | null
    /**
     * The minimum number of fraction digits to use.
     * A value with a smaller number of fraction digits than this number will be
     * right-padded with zeros or the specified fraction pad character.
     */
    minimumFractionDigits: number
    /**
     * The maximum number of fraction digits to use.
     * If not specified, the maximum number of fraction digits is determined by the precision.
     */
    maximumFractionDigits: number | null
    /**
     * The minimum number of integer digits to use.
     * A value with a smaller number of integer digits than this number will be
     * left-padded with zeros or the specified integer pad character.
     */
    minimumIntegerDigits: number
    /**
     * The formatting that should be displayed for the number.
     */
    notation: Notation
    /**
     * When numbers are to be grouped.
     */
    useGrouping: UseGrouping
}
/**
 * The options of the Base class, for adjusting the base settings or encoding formatting.
 */
export type Options = Partial<Properties>

/**
 * The numeral output of the encode method if the base digits have not been specified.
 */
export type NumeralOutput =
{
    /**
     * Whether the number is negative.
     */
    isNegative: boolean,
    /**
     * The integer part of the number
     */
    integer: number[],
    /**
     * The fraction part of the number
     */
    fraction: number[],
    /**
     * The exponent of the number
     */
    exponent: number
}

function createPadArray(amount: Decimal, character: string): string[]
{
    return Array(amount.toNumber()).fill(character) as string[]
}

const zero = new Decimal(0)

const numbers = '0123456789'
const asciiUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const asciiLowercase = 'abcdefghijklmnopqrstuvwxyz'
const allDigits = numbers + asciiUppercase + asciiLowercase

/**
 * The Base class which encodes and decodes from the chosen base.
 */
export default class Base<Digits extends string | number>
{
    public readonly digits: string[] | null
    public readonly base: number
    public readonly options: Properties
    private readonly reValid: RegExp | null
    private readonly roundingModes: {
        [mode in RoundingMode]: (value: Decimal, isNegative: boolean, index: number, values: (Decimal | null)[]) => boolean
    }
    private readonly lnBase: Decimal
    private readonly lnBase3: Decimal
    private readonly baseZero: string

    /**
     * @param digits - A string of digits or a base number
     *   If the digits argument is a string, the output of the encode method will be a formatted
     *   string, and if a number, the output of the encode method will be an object
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

        this.options = {
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
                + u(this.options.negativeSign)
                + u(this.options.positiveSign)
            + ']?'
            
            const pattern = '^'
            + signPattern
            + '['
                + uDigits
                + u(this.options.digitSeparator)
                + u(this.options.groupingSeparator)
            + ']+'
            + '(?:'
                + u(this.options.radixCharacter)
                + '[' + uDigits + ']*'
            + ')?'
            + '(?:'
                + u(this.options.scientificNotationCharacter)
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
    
    public static digitsByBase(base: number, options?: Options)
    {
        if (base > allDigits.length) throw "Can't be higher than " + allDigits.length.toString() + " digits"
        return new Base([...allDigits].slice(0, base).join(''), options)
    }

    public static binary(options?: Options) { return Base.digitsByBase(2, options) }
    public static octal(options?: Options) { return Base.digitsByBase(8, options) }
    public static decimal(options?: Options) { return Base.digitsByBase(10, options) }
    public static hexadecimal(options?: Options) { return Base.digitsByBase(16, options) }
    public static dozenal(options?: Options)
        { return new Base(numbers + '↊↋', {radixCharacter: ';', ...options}) }
    public static dozenalInitials(options?: Options)
        { return new Base(numbers + 'TE', {radixCharacter: ';', ...options}) }
    public static dozenalRoman(options?: Options)
        { return new Base(numbers + 'XE', {radixCharacter: ';', ...options}) }
    public static duodecimal(options?: Options) { return Base.digitsByBase(12, options) }
    public static vigesimal(options?: Options) { return new Base(numbers + "ABCDEFGHJK", options) } // skipping over I
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
    public static base58(options?: Options)
    {
        const digits = (numbers + asciiUppercase + asciiLowercase)
            .replace('I', '')
            .replace('l', '')
            .replace('O', '')
            .replace('0', '')
        return new Base(digits, options)
    }
    public static sexagesimal(options?: Options) { return Base.digitsByBase(60, options) }
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
    public static base62(options?: Options) { return Base.digitsByBase(62, options) }
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


    private calculateExponent(value: Decimal, isEngineering = false): Decimal
    {
        if (value.equals(0)) return value
        return value.ln().dividedBy(isEngineering ? this.lnBase3 :this.lnBase).floor().times(isEngineering ? 3 : 1)
    }

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

    private encodeInteger(value: (Decimal | string)[], opts: Properties): string
    {
        return value
            .map(n => this.encodeDigit(n))
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

    private encodeDigit(value: Decimal | string): string
    {
        if (this.digits === null) throw 'No digits'
        if (typeof value === 'string') return value
        return this.digits[value.toNumber()]
    }

    private decodeDigit(value: string): number
    {
        if (this.digits === null) throw 'No digits'
        const digitIndex = this.digits.indexOf(value)
        if (!(digitIndex >= 0)) throw 'Invalid digit'
        return digitIndex
    }

    public encode(numberValue: number | string | Decimal, options?: Options): Digits extends number ? NumeralOutput : string
    public encode(numberValue: number | string | Decimal, options?: Options): NumeralOutput | string
    {
        const opts: Properties = {...this.options, ...options}
        if (typeof opts.integerPadCharacter !== "string")
            opts.integerPadCharacter = this.baseZero
        if (typeof opts.fractionPadCharacter !== "string")
            opts.fractionPadCharacter = this.baseZero
        if (opts.fractionDigits !== null)
        {
            opts.maximumFractionDigits = opts.fractionDigits
            opts.minimumFractionDigits = opts.fractionDigits
        }
        opts.minimumFractionDigits = opts.maximumFractionDigits
            ? Math.min(opts.minimumFractionDigits, opts.maximumFractionDigits)
            : opts.minimumFractionDigits
        
        const decVal = new Decimal(numberValue)
        let isNegative = decVal.isNegative()
        const absVal = decVal.absoluteValue()
        
        const exponent = this.calculateExponent(absVal, opts.notation === 'engineering')
        
        const makeExponential = opts.notation !== 'standard' && !exponent.equals(0)
        const expValue = makeExponential ? (absVal.dividedBy(Decimal.pow(this.base, exponent))) : absVal

        const precisionExponent = makeExponential ? exponent : zero

        const decPrecision = new Decimal(opts.precision)
        const maxFractLengthByPrecision = (precisionExponent.greaterThan(0)
            ? decPrecision.minus(precisionExponent)
            : decPrecision) || zero
        const maxFractionalLength = (typeof opts.maximumFractionDigits == "number"
            ? Decimal.min(opts.maximumFractionDigits, maxFractLengthByPrecision)
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
                if (this.roundingModes[opts.roundingMode](value, isNegative, i, baseVal))
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
                (opts.minimumIntegerDigits && opts.minimumIntegerDigits > roundedIntVal.length
                ? [...createPadArray((new Decimal(opts.minimumIntegerDigits)).minus(roundedIntVal.length), opts.integerPadCharacter), ...roundedIntVal]
                : roundedIntVal), opts)
            
            const encodedFractVal =
                (opts.minimumFractionDigits > roundedFractVal.length
                    ? [...roundedFractVal, ...createPadArray(new Decimal(opts.minimumFractionDigits-roundedFractVal.length), opts.fractionPadCharacter)]
                    : roundedFractVal)
                .map(n => this.encodeDigit(n))
                .join('')
            
            const signSymbol = isNegative ? opts.negativeSign : opts.positiveSign
            const outputSignSymbol = 
                (opts.signDisplay == "always" && signSymbol)
                || (opts.signDisplay == "exceptZero" && !decVal.isZero() && signSymbol)
                || (opts.signDisplay == "negative" && decVal.lessThan(0) && signSymbol)
                || (opts.signDisplay == "never" && '')
                || opts.signDisplay == "auto" && isNegative ? signSymbol : ''
            
            const encodedExponent = makeExponential && !exponent.equals(0)
                ? (opts.scientificNotationCharacter + (this.encode(exponent, {...this.options, notation: 'standard', fractionDigits: 0, minimumIntegerDigits: 0}) as string))
                : ''
            
            return outputSignSymbol
                + encodedIntVal
                + (encodedFractVal || opts.radixDisplay === 'always' ? (opts.radixCharacter + encodedFractVal) : '')
                + encodedExponent
        }
        else
        {
            return {
                isNegative,
                integer: roundedIntVal.map(v => v.toNumber()),
                fraction: roundedFractVal.map(v => v.toNumber()),
                exponent: makeExponential ? exponent.toNumber() : 0
            }
        }
    }

    private calculateValue(isNegative: boolean, encodedNumber: number[], integerLength: number, exponent: number): number
    {
        const largestExponent = integerLength - 1
        return encodedNumber.reduce((a, c, i) => a + c * Math.pow(this.base, largestExponent-i), 0)
            * Math.pow(this.base, exponent) * (isNegative ? -1 : 1)
    }

    public decode(encodedValue: string | NumeralOutput, options?: Options): number
    {
        if (typeof encodedValue !== "string")
        {
            return this.calculateValue(encodedValue.isNegative,
                [...encodedValue.integer, ...encodedValue.fraction],
                encodedValue.integer.length, encodedValue.exponent)
        }

        const opts: Properties = {...this.options, ...options}

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

        const radixCharIndex = cleanedValue.indexOf(opts.radixCharacter)

        const integerLength = radixCharIndex >= 0 ? radixCharIndex : cleanedValue.length

        return this.calculateValue(isNegative,
            [...cleanedValue.replace(opts.radixCharacter, '')].map((d) => this.decodeDigit(d)),
            integerLength, exponent)
    }

    public isNumber(value: string): boolean
    {
        if (this.reValid === null) throw 'No digits defined for isNumber check'
        return this.reValid.test(value)
    }
}

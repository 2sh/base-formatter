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

export type SignDisplay =
      'auto'
    | 'always'
    | 'exceptZero'
    | 'negative'
    | 'never'

export type DecimalDisplay =
      'auto' // if fraction
    | 'always'

export type Notation = // todo: look into 'compact' and whether to implement them
      'standard'
    | 'scientific'
    | 'engineering'

export type UseGrouping =
      false
    | true
    | 'always'
    | 'min2'

type Properties =
{
    radixCharacter: string
    negativeSign: string
    positiveSign: string
    groupingSeparator: string
    groupingLength: number
    digitSeparator: string
    scientificNotationCharacter: string
    integerPadCharacter: string | null // the digit zero char if not string
    fractionPadCharacter: string | null

    // formatting
    decimalDisplay: DecimalDisplay
    signDisplay: SignDisplay
    roundingMode: RoundingMode
    precision: number
    fractionDigits: number | null // exact number of fraction Digits
    minimumFractionDigits: number
    maximumFractionDigits: number | null // if not number, no limit other than precision
    minimumIntegerDigits: number // zero padding
    notation: Notation
    useGrouping: UseGrouping
}
type Options = Partial<Properties>

function createPadArray(amount: Decimal, character: string): string[]
{
    return Array(amount.toNumber()).fill(character)
}

const zero = new Decimal(0)

const numbers = '0123456789'
const asciiUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const asciiLowercase = 'abcdefghijklmnopqrstuvwxyz'

export default class Base
{
    public readonly digits: string[]
    public readonly base: number
    public readonly options: Properties
    private readonly lnBase: Decimal
    private readonly lnBase3: Decimal
    private readonly reValid: RegExp
    private readonly roundingModes: {
        [mode in RoundingMode]: (value: Decimal, isNegative: boolean, index: number, values: (Decimal | null)[]) => boolean
    }

    constructor(digits: string[] | string, options?: Options)
    {
        this.digits = typeof digits === 'string' ? [...digits] : digits
        this.base = this.digits.length
        this.lnBase = new Decimal(this.base).ln()
        this.lnBase3 = new Decimal(Math.pow(this.base, 3)).ln()
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

            decimalDisplay: 'auto',
            signDisplay: 'auto',
            roundingMode: 'halfTrunc',
            precision: 32,
            fractionDigits: null,
            minimumFractionDigits: 0,
            maximumFractionDigits: null,
            minimumIntegerDigits: 0,
            notation: 'standard',
            useGrouping: false,

            ...options
        }

        const u = (v: string): string => v ? '\\u' + v.charCodeAt(0).toString(16).padStart(4, '0') : ''
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
        this.reValid = new RegExp(pattern)
        
        const halfBase = new Decimal(this.base).dividedBy(2)
        this.roundingModes = {
            expand: () => true,
            trunc: () => false,
            ceil: (_, isNegative) => !isNegative,
            floor: (_, isNegative) => isNegative,
            halfExpand: (value) => value.greaterThanOrEqualTo(halfBase),
            halfTrunc: (value) => value.greaterThan(halfBase),
            halfCeil: (value, isNegative) => value.greaterThanOrEqualTo(halfBase) ? !isNegative : isNegative,
            halfFloor: (value, isNegative) => value.greaterThan(halfBase) ? isNegative : !isNegative,
            halfEven: (value, _, i, values) => value.equals(halfBase)
                ? values[values[i-1] == null ? i-2 : i-1]!.modulo(2).equals(1)
                : value.greaterThan(halfBase),
            halfOdd: (value, _, i, values) => value.equals(halfBase)
                ? values[values[i-1] == null ? i-2 : i-1]!.modulo(2).equals(0)
                : value.greaterThan(halfBase),
        }
    }

    static byBase(base: number, options?: Options)
    {
        return new Base(
            (numbers + asciiUppercase + asciiLowercase).slice(0, base),
            options)
    }

    static binary(options?: Options) { return Base.byBase(2, options) }
    static octal(options?: Options) { return Base.byBase(8, options) }
    static decimal(options?: Options) { return Base.byBase(10, options) }
    static hexadecimal(options?: Options) { return Base.byBase(16, options) }
    static dozenal(options?: Options)
        { return new Base(numbers + '↊↋', {radixCharacter: ';', ...options}) }
    static dozenalInitials(options?: Options)
        { return new Base(numbers + 'TE', {radixCharacter: ';', ...options}) }
    static dozenalRoman(options?: Options)
        { return new Base(numbers + 'XE', {radixCharacter: ';', ...options}) }
    static duodecimal(options?: Options) { return Base.byBase(12, options) }
    static vigesimal(options?: Options) { return new Base(numbers + "ABCDEFGHJK", options) } // skipping over I
    static base57(options?: Options)
    {
        const digits = (numbers + asciiUppercase + asciiLowercase)
            .replace('I', '')
            .replace('l', '')
            .replace('1', '')
            .replace('O', '')
            .replace('0', '')
        return new Base(digits, options)
    }
    static base58(options?: Options)
    {
        const digits = (numbers + asciiUppercase + asciiLowercase)
            .replace('I', '')
            .replace('l', '')
            .replace('O', '')
            .replace('0', '')
        return new Base(digits, options)
    }
    static sexagesimal(options?: Options) { return Base.byBase(60, options) }
    static cuneiform(options?: Options)
    {
        const ones = [...'𒑊𒐕𒐖𒐗𒐘𒐙𒐚𒐛𒐜𒐝']
        const tens = ['',...'𒌋𒑱𒌍𒐏𒐐']
        const digits = tens.map(t => ones.map(o => t + o)).flat()
        return new Base(digits,
        {
            radixCharacter: ';',
            integerPadCharacter: ' ',
            fractionPadCharacter: ' ',

            ...options
        })
    }
    static base62(options?: Options) { return Base.byBase(62, options) }
    static domino(options?: Options)
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


    private calculateExponent(value: Decimal, isEngineering: boolean = false): Decimal
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
                        && (opts.useGrouping == "min2" || array.length > i+1))
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
        if (typeof value === 'string') return value
        return this.digits[value.toNumber()]
    }

    private decodeDigit(value: string): number
    {
        const digitIndex = this.digits.indexOf(value)
        if (!(digitIndex >= 0)) throw 'Invalid digit'
        return digitIndex
    }

    public encode(numberValue: number | string | Decimal, options?: Options): string
    {
        const opts: Properties = {...this.options, ...options}
        if (typeof opts.integerPadCharacter !== "string")
            opts.integerPadCharacter = this.digits[0]
        if (typeof opts.fractionPadCharacter !== "string")
            opts.fractionPadCharacter = this.digits[0]
        if (opts.fractionDigits !== null)
        {
            opts.maximumFractionDigits = opts.fractionDigits
            opts.minimumFractionDigits = opts.fractionDigits
        }
        opts.minimumFractionDigits = opts.maximumFractionDigits
            ? Math.min(opts.minimumFractionDigits, opts.maximumFractionDigits)
            : opts.minimumFractionDigits
        
        const decVal = new Decimal(numberValue)
        const isNegative = decVal.isNegative()
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
            else if (isRounded)
            {
                isRemainder = this.roundingModes[opts.roundingMode](value, isNegative, i, baseVal)
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
            || isNegative ? signSymbol : ''
        
        const encodedExponent = makeExponential && !exponent.equals(0)
            ? (opts.scientificNotationCharacter + this.encode(exponent, {...options, notation: 'standard', fractionDigits: 0}))
            : ''
        
        const outputValue = outputSignSymbol
        + encodedIntVal
        + (encodedFractVal || opts.decimalDisplay === 'always' ? (opts.radixCharacter + encodedFractVal) : '')
        + encodedExponent
        
        return outputValue
    }

    decode(encodedValue: string, options?: Options): number
    {
        const opts: Properties = {...this.options, ...options}

        const isNegative = encodedValue.startsWith(opts.negativeSign)

        const notationIndex = encodedValue.indexOf(opts.scientificNotationCharacter)

        const exponent = notationIndex >= 0 ? this.decode(encodedValue.slice(notationIndex+1)) : 0
        const intFractValue = notationIndex >= 0 ? encodedValue.slice(0,notationIndex) : encodedValue

        const cleanedValue = intFractValue
            .replaceAll(opts.positiveSign, '')
            .replaceAll(opts.negativeSign, '')
            .replaceAll(opts.groupingSeparator, '')
            .replaceAll(opts.digitSeparator, '')
            .trim()

        const radixCharIndex = cleanedValue.indexOf(opts.radixCharacter)
        const largestExponent = (radixCharIndex >= 0 ? radixCharIndex : cleanedValue.length) - 1

        let decodedValue = cleanedValue
            .replace(opts.radixCharacter, '')
            .split('')
            .map((d) => this.decodeDigit(d))
            .reduce((a, c, i) => a + c * Math.pow(this.base, largestExponent-i), 0)

        return decodedValue * Math.pow(this.base, -exponent)
    }

    isNumber(value: string): boolean
    {
        return this.reValid.test(value)
    }
}

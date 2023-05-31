/*
 * num-radix
 * Copyright (C) 2023 2sh <contact@2sh.me>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Decimal from 'decimal.js'

// Basing options on:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat

type Options =
{
    radixCharacter?: string
    negativeSign?: string
    positiveSign?: string
    groupingSeparator?: string
    groupingLength?: number
    digitSeparator?: string
    scientificNotationCharacter?: string
    integerPadCharacter?: string | null // the digit zero char if not string
    fractionPadCharacter?: string | null

    // formatting
    decimalDisplay?: 'auto' | 'always' // auto: if fraction
    signDisplay?: 'auto' | 'always' | 'exceptZero' | 'negative' | 'never'
    roundingMode?: 'ceil' | 'floor' | 'trunc' | 'halfExpand' // todo: add more and make sure the implemented ones are correct
    precision?: number
    fractionDigits?: number | null // exact number of fraction Digits
    minimumFractionDigits?: number
    maximumFractionDigits?: number | null // if not number, no limit other than precision
    minimumIntegerDigits?: number // zero padding
    notation?: 'standard' | 'scientific' | 'engineering' | 'compact' // todo: engineering and compact
    useGrouping?: false | true | "always" | 'min2'
}

function createPadArray(amount: Decimal, character: string): string[]
{
    return Array(amount.toNumber()).fill(character)
}

const numbers = '0123456789'
const asciiUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const asciiLowercase = 'abcdefghijklmnopqrstuvwxyz'

export default class NumRadix
{
    public readonly digits: string[]
    public readonly base: number
    public readonly options: Options
    private readonly lnBase: Decimal
    private readonly reValid: RegExp

    constructor(digits: string[] | string, options?: Options)
    {
        this.digits = typeof digits === 'string' ? [...digits] : digits
        this.base = this.digits.length
        this.lnBase = (new Decimal(this.base)).ln()
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

        const u = (v: string): string => v ? '\\u' + v.charCodeAt(0).toString(16).padStart(4, '0') : ''
        const uDigits = this.digits.map(d => u(d)).join('')
        const digitPattern = '[' + uDigits + ']+'
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
            + digitPattern
        + ')?'
        + '(?:'
            + u(this.options.scientificNotationCharacter)
            + signPattern
            + digitPattern
        + ')?'
        + '$'
        this.reValid = new RegExp(pattern)
    }

    static byBase(base: number, options?: Options)
    {
        return new NumRadix(
            (numbers + asciiUppercase + asciiLowercase).slice(0, base),
            options)
    }

    static binary(options?: Options) { return new NumRadix('01', options) }
    static octal(options?: Options) { return new NumRadix(numbers.slice(0,8), options)}
    static decimal(options?: Options) { return new NumRadix(numbers, options) }
    static hexadecimal(options?: Options) { return new NumRadix(numbers + "ABCDEF", options) }
    static dozenal(options?: Options)
        { return new NumRadix(numbers + '↊↋', {radixCharacter: ';', ...options}) }
    static dozenalInitials(options?: Options)
        { return new NumRadix(numbers + 'TE', {radixCharacter: ';', ...options}) }
    static dozenalRoman(options?: Options)
        { return new NumRadix(numbers + 'XE', {radixCharacter: ';', ...options}) }
    static duodecimal(options?: Options)
        { return new NumRadix(numbers + 'AB', {...options}) }
    static vigesimal(options?: Options) { return new NumRadix(numbers + "ABCDEFGHJK", options) }
    static base57(options?: Options)
    {
        const digits = (numbers + asciiUppercase + asciiLowercase)
            .replace('I', '')
            .replace('l', '')
            .replace('1', '')
            .replace('O', '')
            .replace('0', '')
        return new NumRadix(digits, options)
    }
    static base58(options?: Options)
    {
        const digits = (numbers + asciiUppercase + asciiLowercase)
            .replace('I', '')
            .replace('l', '')
            .replace('O', '')
            .replace('0', '')
        return new NumRadix(digits, options)
    }
    static cuneiform(options?: Options)
        {
            const ones = [...'𒑊𒐕𒐖𒐗𒐘𒐙𒐚𒐛𒐜𒐝']
            const tens = ['',...'𒌋𒑱𒌍𒐏𒐐']
            const digits = tens.map(t => ones.map(o => t + o)).flat()
            return new NumRadix(digits,
            {
                radixCharacter: ';',
                integerPadCharacter: ' ',
                fractionPadCharacter: ' ',

                ...options
            })
        }
    static base62(options?: Options)
        { return new NumRadix(numbers + asciiUppercase + asciiLowercase, options) }
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
        return new NumRadix(chars,
        {
            radixCharacter: '🁢',
            negativeSign: '🀰',
            ...options
        })
    }

    private calculateExponent(value: Decimal): Decimal
    {
        if (value.equals(0)) return value
        return value.ln().dividedBy(this.lnBase).floor()
    }

    private convertIntegerToRadix(value: Decimal): Decimal[]
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

    private encodeInteger(value: (Decimal | string)[], opts: Options): string
    {
        return value
            .map(n => this.encodeDigit(n))
            .reverse()
            .reduce((acc, cur, i, array) =>
            {
                if (i > 0)
                {
                    if (opts.useGrouping
                        && (i % opts.groupingLength!) == 0
                        && (opts.useGrouping !== "min2" || array.length > i+1))
                    {
                        acc.push(opts.groupingSeparator!)
                    }
                    else
                    {
                        acc.push(opts.digitSeparator!)
                    }
                }
                acc.push(cur)
                return acc
            }, [] as string[])
            .reverse()
            .join('')
    }

    private convertFractionalToRadix(value: Decimal, precision: Decimal): Decimal[]
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

    public encode(numberValue: number | string | Decimal, options?: Options)
    {
        const opts: Options = {...this.options, ...options}
        if (typeof opts.integerPadCharacter !== "string")
            opts.integerPadCharacter = this.digits[0]
        if (typeof opts.fractionPadCharacter !== "string")
            opts.fractionPadCharacter = this.digits[0]
        if (opts.fractionDigits !== null)
        {
            opts.maximumFractionDigits = opts.fractionDigits
            opts.minimumFractionDigits = opts.fractionDigits
        }
        opts.minimumFractionDigits = Math.min(opts.minimumFractionDigits, opts.maximumFractionDigits)
        
        const decVal = new Decimal(numberValue)
        const isNegative = decVal.isNegative()
        const absVal = decVal.absoluteValue()
        
        const exponent = this.calculateExponent(absVal)

        const decPrecision = new Decimal(opts.precision!)
        const maxFractLengthByPrecision = (exponent.greaterThan(0)
            ? decPrecision.minus(exponent)
            : decPrecision) || new Decimal(0)
        const maxFractionalLength = (typeof opts.maximumFractionDigits == "number"
            ? Decimal.min(opts.maximumFractionDigits, maxFractLengthByPrecision)
            : maxFractLengthByPrecision)
        
        const makeExponential = opts.notation === 'scientific' && !exponent.equals(0)
        const expValue = makeExponential ? (absVal.dividedBy(Decimal.pow(this.base, exponent))) : absVal

        const intVal = expValue.floor()
        const fractVal = expValue.minus(intVal)
        
        const baseIntVal = this.convertIntegerToRadix(intVal)
        const baseFractVal = this.convertFractionalToRadix(fractVal, maxFractLengthByPrecision)

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
                if (opts.roundingMode === 'halfExpand')
                    isRemainder = value.greaterThanOrEqualTo(this.base/2)
                else if (opts.roundingMode === 'ceil')
                    isRemainder = !isNegative
                else if (opts.roundingMode === 'floor')
                    isRemainder = isNegative
                // trunc, no remainder
            }

            if (isRemainder)
                value = new Decimal(0)

            if (!value.isZero())
                onlyZeros = false
            
            baseVal[i] = value
            
            if (isRounded || (onlyZeros && baseIntVal.length < i))
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
            (opts.minimumFractionDigits! > roundedFractVal.length
                ? [...roundedFractVal, ...createPadArray(new Decimal(opts.minimumFractionDigits!-roundedFractVal.length), opts.fractionPadCharacter)]
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
        
        const encodedExponent = !exponent.equals(0) ? (opts.scientificNotationCharacter! + 
            this.encode(exponent, {...options, notation: 'standard', fractionDigits: 0})) : ''
        
        const outputValue = outputSignSymbol
        + encodedIntVal
        + (encodedFractVal || opts.decimalDisplay === 'always' ? (opts.radixCharacter! + encodedFractVal) : '')
        + (makeExponential ? encodedExponent : '')
        
        return outputValue
    }

    decode(encodedValue: string, options?: Options): number
    {
        const opts: Options = {...this.options, ...options}

        const isNegative = encodedValue.startsWith(opts.negativeSign)

        const notationIndex = encodedValue.indexOf(opts.scientificNotationCharacter!)

        const exponent = notationIndex >= 0 ? this.decode(encodedValue.slice(notationIndex+1)) : 0
        const intFractValue = notationIndex >= 0 ? encodedValue.slice(0,notationIndex) : encodedValue

        const cleanedValue = intFractValue
            .replaceAll(opts.positiveSign, '')
            .replaceAll(opts.negativeSign, '')
            .replaceAll(opts.groupingSeparator, '')
            .replaceAll(opts.digitSeparator, '')
            .trim()

        const radixCharIndex = cleanedValue.indexOf(opts.radixCharacter!)
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

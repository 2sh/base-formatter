import Decimal from 'decimal.js'

// Using options from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat

type Options = {
    decimalSeparator?: string
    negativeSymbol?: string
    positiveSymbol?: string
    thousandsSeparator?: string
    exponentSymbol?: string
    padSymbol?: string | null // the digit zero char if not string

    // out of norm changes
    decimalDisplay?: 'auto' | 'always' // auto: if fraction
    signDisplay?: 'auto' | 'always' | 'exceptZero' | 'negative' | 'never'
    roundingMode?: 'ceil' | 'floor' | 'trunc' | 'halfExpand' // todo: add more and make sure the implemented ones are correct
    useGrouping?: false | true | "always" | 'min2' // todo: make sure min2 is implemented correct

    // format
    precision?: number
    fractionDigits?: number | null // exact number of fraction Digits
    minimumFractionDigits?: number // todo: make sure this is working
    maximumFractionDigits?: number | null // if not number, no limit other than precision
    minimumIntegerDigits?: number // zero padding
    notation?: 'standard' | 'scientific' | 'engineering' | 'compact' // todo: engineering and compact
}

function zeroFilledArray(amount: Decimal): Decimal[]
{
    return Array(amount.toNumber()).fill(new Decimal(0))
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

    constructor(digits: string[] | string, options?: Options)
    {
        this.digits = typeof digits === 'string' ? digits.split('') : digits 
        this.base = digits.length
        this.lnBase = (new Decimal(this.base)).ln()
        this.options = {
            decimalSeparator: '.',
            negativeSymbol: '-',
            positiveSymbol: '+',
            thousandsSeparator: ',',
            exponentSymbol: 'e',
            padSymbol: null,

            decimalDisplay: 'auto',
            signDisplay: 'auto',
            roundingMode: 'halfExpand',
            useGrouping: false,

            precision: 32,
            fractionDigits: null,
            minimumFractionDigits: 0,
            maximumFractionDigits: null,
            minimumIntegerDigits: 0,
            notation: 'standard',

            ...options
        }
    }

    static byBase(base: number, options?: Options)
    {
        return new NumRadix(
            (numbers + asciiUppercase + asciiLowercase).slice(0, base),
            options)
    }

    static bin(options?: Options) { return new NumRadix('01', options) }
    static oct(options?: Options) { return new NumRadix(numbers.slice(0,8), options)}
    static dec(options?: Options) { return new NumRadix(numbers, options) }
    static hex(options?: Options) { return new NumRadix(numbers + "ABCDEF", options) }
    static hexLc(options?: Options) { return new NumRadix(numbers + "abcdef", options) }
    static doz(options?: Options)
        { return new NumRadix(numbers + '↊↋', {decimalSeparator: ';', ...options}) }
    static dozAscii(options?: Options)
        { return new NumRadix(numbers + 'TE', {decimalSeparator: ';', ...options}) }
    static dozRoman(options?: Options)
        { return new NumRadix(numbers + 'XE', {decimalSeparator: ';', ...options}) }
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
    static base62(options?: Options)
        { return new NumRadix(numbers + asciiUppercase + asciiLowercase, options) }

    private calculateExponent(value: Decimal): Decimal
    {
        if (value.equals(0)) return value
        return value.ln().dividedBy(this.lnBase).floor()
    }

    private convertInteger(value: Decimal): Decimal[]
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

    private convertFractional(value: Decimal, precision: Decimal): Decimal[]
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

    private convertDigit(value: Decimal): string
    {
        return this.digits[value.toNumber()]
    }

    public encode(numberValue: number | string | Decimal, options?: Options)
    {
        const opts: Options = {...this.options, ...options}
        if (typeof opts.padSymbol !== "string")
            opts.padSymbol = this.digits[0]
        if (opts.fractionDigits !== null)
        {
            opts.minimumFractionDigits = opts.fractionDigits
            opts.maximumFractionDigits = opts.fractionDigits
        }
        
        const decVal = new Decimal(numberValue)
        const isNegative = decVal.isNegative()
        const absVal = decVal.absoluteValue()
        
        const exponent = this.calculateExponent(absVal)

        const decPrecision = new Decimal(opts.precision!)
        const maxFractLengthByPrecision = (exponent.greaterThan(0)
            ? decPrecision.minus(exponent)
            : decPrecision) || 0
        const maxFractionalLength = (typeof opts.maximumFractionDigits == "number"
            ? Decimal.min(opts.maximumFractionDigits, maxFractLengthByPrecision)
            : maxFractLengthByPrecision)
        
        const makeExponential = opts.notation === 'scientific' && !exponent.equals(0)
        const expValue = makeExponential ? (absVal.dividedBy(Decimal.pow(this.base, exponent))) : absVal

        const intVal = expValue.floor()
        const fractVal = expValue.minus(intVal)
        
        const baseIntVal = this.convertInteger(intVal)
        const baseFractVal = this.convertFractional(fractVal, maxFractLengthByPrecision)

        const baseVal: (Decimal|null)[] = [
            ...baseIntVal,
            null,
            ...baseFractVal
        ]

        const roundingIndex = maxFractionalLength.plus(baseIntVal.length)
        let isRemainder = false
        for(let i=baseVal.length-1; i>=0; i--)
        {
            if(baseVal[i] === null) continue
            const isRounded = roundingIndex.lessThan(i)
            
            if (isRemainder)
            {
                baseVal[i] = baseVal[i]!.plus(1)
                isRemainder = baseVal[i]!.greaterThanOrEqualTo(this.base)
            }

            if (!isRemainder && isRounded)
            {
                if (opts.roundingMode === 'halfExpand')
                    isRemainder = baseVal[i]!.greaterThanOrEqualTo(this.base/2)
                else if (opts.roundingMode === 'ceil')
                    isRemainder = !isNegative
                else if (opts.roundingMode === 'floor')
                    isRemainder = isNegative
                // trunc, no remainder
            }

            if (isRemainder)
                baseVal[i] = new Decimal(0)
            
            if (isRounded || (!isRemainder && baseIntVal.length <= i && (baseVal[i]!.equals(0))))
                baseVal.pop()
            else
                break
        }
        if (isRemainder) baseVal.unshift(new Decimal(1))
        
        const nullPos = baseVal.findIndex((e) => e == null)
        const roundedIntVal = baseVal.slice(0, nullPos) as Decimal[]
        const roundedFractVal = baseVal.slice(nullPos+1) as Decimal[]

        const convertedIntVal =
            (opts.minimumIntegerDigits && opts.minimumIntegerDigits > roundedIntVal.length
                ? zeroFilledArray((new Decimal(opts.minimumIntegerDigits)).minus(roundedIntVal.length)).concat(roundedIntVal)
                : roundedIntVal)
            .map(n => this.convertDigit(n))
            .reverse()
            .reduce((acc, cur, i, array) =>
            {
                const isMin2 = opts.useGrouping === "min2"
                if (opts.useGrouping && i > 0 && (i % 3) == 0 && (!isMin2 || array.length > i)) acc.push(opts.thousandsSeparator!)
                acc.push(cur)
                return acc
            }, [] as string[])
            .reverse()
            .join('')
        
        const convertedFractVal =
            (opts.minimumFractionDigits! > roundedFractVal.length
                ? roundedFractVal.concat(zeroFilledArray(new Decimal(opts.minimumFractionDigits!-roundedFractVal.length)))
                : roundedFractVal)
            .map(n => this.convertDigit(n))
            .join('')
        
        const signSymbol = isNegative ? opts.negativeSymbol : opts.positiveSymbol
        const outputSignSymbol = 
            (opts.signDisplay == "always" && signSymbol)
            || (opts.signDisplay == "exceptZero" && !decVal.isZero() && signSymbol)
            || (opts.signDisplay == "negative" && decVal.lessThan(0) && signSymbol)
            || (opts.signDisplay == "never" && '')
            || isNegative ? signSymbol : ''
        
        return outputSignSymbol
            + convertedIntVal
            + (convertedFractVal || opts.decimalDisplay === 'always' ? (opts.decimalSeparator! + convertedFractVal) : '')
            + (makeExponential ? opts.exponentSymbol! + exponent : '')
    }
}
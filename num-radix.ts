import Decimal from 'decimal.js'

// Using options from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat

type Options = {
    radixCharacter?: string
    negativeSign?: string
    positiveSign?: string
    thousandsSeparator?: string
    eNotationCharacter?: string
    integerPadCharacter?: string | null // the digit zero char if not string
    fractionPadCharacter?: string | null

    // out of norm changes
    decimalDisplay?: 'auto' | 'always' // auto: if fraction
    signDisplay?: 'auto' | 'always' | 'exceptZero' | 'negative' | 'never'
    roundingMode?: 'ceil' | 'floor' | 'trunc' | 'halfExpand' // todo: add more and make sure the implemented ones are correct
    useGrouping?: false | true | "always" | 'min2' // todo: make sure min2 is implemented correct

    // format
    precision?: number
    fractionDigits?: number | null // exact number of fraction Digits
    minimumFractionDigits?: number
    maximumFractionDigits?: number | null // if not number, no limit other than precision
    minimumIntegerDigits?: number // zero padding
    notation?: 'standard' | 'scientific' | 'engineering' | 'compact' // todo: engineering and compact
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

    constructor(digits: string[] | string, options?: Options)
    {
        this.digits = typeof digits === 'string' ? digits.split('') : digits 
        this.base = digits.length
        this.lnBase = (new Decimal(this.base)).ln()
        this.options = {
            radixCharacter: '.',
            negativeSign: '-',
            positiveSign: '+',
            thousandsSeparator: ',',
            eNotationCharacter: 'e',
            integerPadCharacter: null,
            fractionPadCharacter: null,

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
        { return new NumRadix(numbers + '↊↋', {radixCharacter: ';', ...options}) }
    static dozAscii(options?: Options)
        { return new NumRadix(numbers + 'TE', {radixCharacter: ';', ...options}) }
    static dozRoman(options?: Options)
        { return new NumRadix(numbers + 'XE', {radixCharacter: ';', ...options}) }
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

    private convertDigit(value: Decimal | string): string
    {
        if (typeof value === 'string') return value
        return this.digits[value.toNumber()]
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
        
        const nullPos = baseVal.findIndex((e) => e == null)
        const roundedIntVal = baseVal.slice(0, nullPos) as Decimal[]
        const roundedFractVal = baseVal.slice(nullPos+1) as Decimal[]

        const convertedIntVal =
            (opts.minimumIntegerDigits && opts.minimumIntegerDigits > roundedIntVal.length
                ? [...createPadArray((new Decimal(opts.minimumIntegerDigits)).minus(roundedIntVal.length), opts.integerPadCharacter), ...roundedIntVal]
                : roundedIntVal)
            .map(n => this.convertDigit(n))
            .reverse()
            .reduce((acc, cur, i, array) =>
            {
                const isMin2 = opts.useGrouping === "min2"
                if (opts.useGrouping && i > 0 && (i % 3) == 0 && (!isMin2 || array.length > i+1)) acc.push(opts.thousandsSeparator!)
                acc.push(cur)
                return acc
            }, [] as string[])
            .reverse()
            .join('')
        
        const convertedFractVal =
            (opts.minimumFractionDigits! > roundedFractVal.length
                ? [...roundedFractVal, ...createPadArray(new Decimal(opts.minimumFractionDigits!-roundedFractVal.length), opts.fractionPadCharacter)]
                : roundedFractVal)
            .map(n => this.convertDigit(n))
            .join('')
        
        const signSymbol = isNegative ? opts.negativeSign : opts.positiveSign
        const outputSignSymbol = 
            (opts.signDisplay == "always" && signSymbol)
            || (opts.signDisplay == "exceptZero" && !decVal.isZero() && signSymbol)
            || (opts.signDisplay == "negative" && decVal.lessThan(0) && signSymbol)
            || (opts.signDisplay == "never" && '')
            || isNegative ? signSymbol : ''
        
        return outputSignSymbol
            + convertedIntVal
            + (convertedFractVal || opts.decimalDisplay === 'always' ? (opts.radixCharacter! + convertedFractVal) : '')
            + (makeExponential ? opts.eNotationCharacter! + exponent : '')
    }
}
import type { Options, RoundingMode } from '../src/base-formatter'

import test from 'tape'

import Base from '../src/base-formatter'

const decimal = Base.decimal()

type FormattingTests = [number, string, Options][]
const eVal = 1.6021766208e-19
const testVal2 = 0.123456789
const testVal3 = 123456789
const testVal4 = 6789

const formattingTests: FormattingTests = [
    [eVal, '2e-19', {notation: 'scientific', maximumFractionDigits: 0}],
    [eVal, '1.6e-19', {notation: 'scientific', maximumFractionDigits: 1}],
    [eVal, '1.6e-19', {notation: 'scientific', maximumFractionDigits: 2}],
    [eVal, '1.60e-19', {notation: 'scientific', minimumFractionDigits: 2, maximumFractionDigits: 2}],
    [eVal, '1.60e-19', {notation: 'scientific', fractionDigits: 2}],
    [eVal, '1.602e-19', {notation: 'scientific', maximumFractionDigits: 3}],
    [eVal, '1.6022e-19', {notation: 'scientific', maximumFractionDigits: 4}],
    [eVal, '1.60218e-19', {notation: 'scientific', maximumFractionDigits: 5}],
    [eVal, '1.602177E-19', {notation: 'scientific', maximumFractionDigits: 6, scientificNotationCharacter: 'E'}],
    [testVal2, '0.12346', {maximumFractionDigits: 5}],
    [testVal2, '0.1235', {maximumFractionDigits: 4}],
    [testVal2, '0.124', {maximumFractionDigits: 3}],
    [testVal2, '0.12', {maximumFractionDigits: 2}],
    [testVal2, '+0.1', {maximumFractionDigits: 1, signDisplay: 'always'}],
    [testVal2, '0', {maximumFractionDigits: 0}],
    [testVal2, '1.', {maximumFractionDigits: 0, roundingMode: 'ceil', radixDisplay: 'always'}],
    [testVal2, '0000.12345678900000', {minimumFractionDigits: 14, minimumIntegerDigits:4}],
    [testVal2, '   0.123456789     ', {minimumFractionDigits: 14, minimumIntegerDigits:4,
        integerPadCharacter: ' ', fractionPadCharacter: ' '}],
    [testVal2, '   0.12345678900000', {minimumFractionDigits: 14, minimumIntegerDigits:4,
        integerPadCharacter: ' '}],
    [testVal2, '0000.123456789     ', {minimumFractionDigits: 14, minimumIntegerDigits:4,
        fractionPadCharacter: ' '}],
    [testVal3, '123,456,789', {useGrouping: true}],
    [testVal3, '123,456,789', {useGrouping: 'always'}],
    [testVal3, '1234,56789', {useGrouping: true, groupingLength: 5}],
    [123456.789, '123.456,789', {useGrouping: true, radixCharacter: ',', groupingSeparator: '.'}],
    [testVal3, '1.2346e8', {notation: 'scientific', maximumFractionDigits: 4}],
    [testVal3, '123.4568e6', {notation: 'engineering', maximumFractionDigits: 4}],
    [3456789, '3-4-5-6,7-8-9', {useGrouping: 'min2', digitSeparator: '-'}],
    [testVal4, '6,789', {useGrouping: true}],
    [testVal4, '6,789', {useGrouping: 'always'}],
    [testVal4, '6789', {useGrouping: 'min2'}],
    [testVal4, '6-7-8-9', {useGrouping: 'min2', digitSeparator: '-'}],
    [-0, '-0', {}],
    [3, '3', {signDisplay: 'negative'}],
    [-0, '0', {signDisplay: 'negative'}],
    [-3, '-3', {signDisplay: 'negative'}],
    [3, 'P_3', {signDisplay: 'exceptZero', positiveSign: 'P_'}],
    [-0, '0', {signDisplay: 'exceptZero'}],
    [-3, 'N_3', {signDisplay: 'exceptZero', negativeSign: 'N_'}],
]

test('formatting', (t) =>
{
    formattingTests.forEach(([value, expected, opts]) =>
    {
        t.equal(decimal.encode(value, opts), expected)
    })
    
    t.end()
})

const dozenal = Base.dozenal()
const domino = Base.domino()
const base120Numerals = new Base(120)

const complexInput = 346355345633
const complexOutput = base120Numerals.encode(complexInput, {notation: 'scientific', maximumFractionDigits: 8})

test('encoding', (t) =>
{
    t.equal(dozenal.encode(51240, {radixDisplay: 'always'}), '257↊0;')
    t.equal(dozenal.encode(51240.45345, {maximumFractionDigits: 2}), '257↊0;55')
    t.equal(dozenal.encode(144.5), '100;6')
    t.equal(dozenal.encode(288.25, {signDisplay: 'always'}), '+200;3')
    t.equal(dozenal.encode(143.75), '↋↋;9')
    t.equal(dozenal.encode(51240.3333333333, {maximumFractionDigits: 8}), '257↊0;4')
    t.equal(dozenal.encode(51240.6666666666, {maximumFractionDigits: 8}), '257↊0;8')
    t.equal(domino.encode(51234.2345334554, {maximumFractionDigits: 8}), '🁨🁵🁕🁢🀹🁠🁻🁤🁭🀲🁀🁻')
    t.deepEqual(base120Numerals.encode(-1440.5), {isNegative: true, integer: [12, 0], fraction: [60], exponent: 0})
    t.deepEqual(complexOutput, {isNegative: false, integer: [ 13 ], fraction: [ 110, 37, 14, 66, 113 ], exponent: 5})

    t.end()
})

test('decoding', (t) =>
{
    t.equal(Math.floor(base120Numerals.decode(complexOutput)), complexInput)
    t.equal(dozenal.decode('100;6  '), 144.5)
    t.equal(dozenal.decode('84;4↊e6'), 299801088)
    t.end()
})

const decimalWithSep = Base.decimal({digitSeparator: '-'})

test('isNumber', (t) =>
{
    t.ok(dozenal.isNumber('-100;6'))
    t.ok(dozenal.isNumber('34,484;4↊e6'))
    t.ok(dozenal.isNumber('+00257↊0;55'))
    t.ok(domino.isNumber('🁨🁵🁕🁢🀹🁠🁻🁤🁭🀲🁀🁻'))
    t.ok(decimalWithSep.isNumber('1-2,2-3-4'))
    t.end()
})

const testNumbers1 =
                   [5.5, 2.5, 1.75, 1.25, 1.0, -1.0, -1.25, -1.75, -2.5, -5.5]
const roundingModesExpected1: [RoundingMode, string[]][] = [
    ['ceil',      ['6', '3', '2',  '2',  '1', '-1', '-1',  '-1',  '-2', '-5']], // towards +
    ['floor',     ['5', '2', '1',  '1',  '1', '-1', '-2',  '-2',  '-3', '-6']], // towards -
    ['expand',    ['6', '3', '2',  '2',  '1', '-1', '-2',  '-2',  '-3', '-6']], // away from 0
    ['trunc',     ['5', '2', '1',  '1',  '1', '-1', '-1',  '-1',  '-2', '-5']], // towards 0
    ['halfCeil',  ['6', '3', '2',  '1',  '1', '-1', '-1',  '-2',  '-2', '-5']], // half to +
    ['halfFloor', ['5', '2', '2',  '1',  '1', '-1', '-1',  '-2',  '-3', '-6']], // half to -
    ['halfExpand',['6', '3', '2',  '1',  '1', '-1', '-1',  '-2',  '-3', '-6']], // half away from 0
    ['halfTrunc', ['5', '2', '2',  '1',  '1', '-1', '-1',  '-2',  '-2', '-5']], // half towards 0
    ['halfEven',  ['6', '2', '2',  '1',  '1', '-1', '-1',  '-2',  '-2', '-6']], // half to even
    ['halfOdd',   ['5', '3', '2',  '1',  '1', '-1', '-1',  '-2',  '-3', '-5']], // half to odd
]

const testNumbers2 =
                   [1.8, 1.5, 1.2, 0.8, 0.5, 0.2, -0.2, -0.5, -0.8, -1.2, -1.5, -1.8]
const roundingModesExpected2: [RoundingMode, string[]][] = [
    ['ceil',      ['2', '2', '2', '1', '1', '1',  '0',  '0',  '0', '-1', '-1', '-1']], // towards +
    ['floor',     ['1', '1', '1', '0', '0', '0', '-1', '-1', '-1', '-2', '-2', '-2']], // towards -
    ['expand',    ['2', '2', '2', '1', '1', '1', '-1', '-1', '-1', '-2', '-2', '-2']], // away from 0
    ['trunc',     ['1', '1', '1', '0', '0', '0',  '0',  '0',  '0', '-1', '-1', '-1']], // towards 0
    ['halfCeil',  ['2', '2', '1', '1', '1', '0',  '0',  '0', '-1', '-1', '-1', '-2']], // half to +
    ['halfFloor', ['2', '1', '1', '1', '0', '0',  '0', '-1', '-1', '-1', '-2', '-2']], // half to -
    ['halfExpand',['2', '2', '1', '1', '1', '0',  '0', '-1', '-1', '-1', '-2', '-2']], // half away from 0
    ['halfTrunc', ['2', '1', '1', '1', '0', '0',  '0',  '0', '-1', '-1', '-1', '-2']], // half towards 0
    ['halfEven',  ['2', '2', '1', '1', '0', '0',  '0',  '0', '-1', '-1', '-2', '-2']], // half to even
    ['halfOdd',   ['2', '1', '1', '1', '1', '0',  '0', '-1', '-1', '-1', '-1', '-2']], // half to odd
]

test('rounding modes', (t) =>
{
    roundingModesExpected1.forEach(([roundingMode, expectedResults]) =>
    {
        testNumbers1.forEach((n, i) =>
        {
            t.equal(decimal.encode(n, {roundingMode, fractionDigits: 0}), expectedResults[i])
        })
    })
    roundingModesExpected2.forEach(([roundingMode, expectedResults]) =>
    {
        testNumbers2.forEach((n, i) =>
        {
            t.equal(decimal.encode(n, {roundingMode, fractionDigits: 0}), expectedResults[i])
        })
    })
    t.end()
})
import type { BaseFormatterOptions, RoundingMode } from '../src/base-formatter'

import test from 'tape'

import { BaseFormatter, BaseConverter } from '../src/base-formatter'

const decimal = BaseFormatter.decimal()

type FormattingTests = [number, string, BaseFormatterOptions][]
const eVal = 1.6021766208e-19
const testVal2 = 0.123456789
const testVal3 = 123456789
const testVal4 = 6789

const formattingTests: FormattingTests = [
    [eVal, '2e-19', {notation: 'scientific', maximumFractionLength: 0}],
    [eVal, '1.6e-19', {notation: 'scientific', maximumFractionLength: 1}],
    [eVal, '1.6e-19', {notation: 'scientific', maximumFractionLength: 2}],
    [eVal, '1.60e-19', {notation: 'scientific', minimumFractionLength: 2, maximumFractionLength: 2}],
    [eVal, '1.602e-19', {notation: 'scientific', maximumFractionLength: 3}],
    [eVal, '1.6022e-19', {notation: 'scientific', maximumFractionLength: 4}],
    [eVal, '1.60218e-19', {notation: 'scientific', maximumFractionLength: 5}],
    [eVal, '1.602177E-19', {notation: 'scientific', maximumFractionLength: 6, scientificNotationCharacter: 'E'}],
    [testVal2, '0.12346', {maximumFractionLength: 5}],
    [testVal2, '0.1235', {maximumFractionLength: 4}],
    [testVal2, '0.124', {maximumFractionLength: 3}],
    [testVal2, '0.12', {maximumFractionLength: 2}],
    [testVal2, '+0.1', {maximumFractionLength: 1, signDisplay: 'always'}],
    [testVal2, '0', {maximumFractionLength: 0}],
    [testVal2, '1.', {maximumFractionLength: 0, roundingMode: 'ceil', radixDisplay: 'always'}],
    [testVal2, '0000.12345678900000', {minimumFractionLength: 14, minimumIntegerLength:4}],
    [testVal2, '   0.123456789     ', {minimumFractionLength: 14, minimumIntegerLength:4,
        integerPadCharacter: ' ', fractionPadCharacter: ' '}],
    [testVal2, '   0.12345678900000', {minimumFractionLength: 14, minimumIntegerLength:4,
        integerPadCharacter: ' '}],
    [testVal2, '0000.123456789     ', {minimumFractionLength: 14, minimumIntegerLength:4,
        fractionPadCharacter: ' '}],
    [testVal3, '123,456,789', {useGrouping: true}],
    [testVal3, '123,456,789', {useGrouping: 'always'}],
    [testVal3, '1234,56789', {useGrouping: true, groupingLength: 5}],
    [123456.789, '123.456,789', {useGrouping: true, radixCharacter: ',', groupingSeparator: '.'}],
    [testVal3, '1.2346e8', {notation: 'scientific', maximumFractionLength: 4}],
    [testVal3, '123.4568e6', {notation: 'engineering', maximumFractionLength: 4}],
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

const dozenal = BaseFormatter.dozenal()
const domino = BaseFormatter.domino()
const base120Numerals = new BaseConverter(120)

const complexInput = 346355345633
const complexOutput = base120Numerals.encode(complexInput, {notation: 'scientific', maximumFractionLength: 8})

test('encoding', (t) =>
{
    t.equal(dozenal.encode(51240, {radixDisplay: 'always'}), '257↊0;')
    t.equal(dozenal.encode(51240.45345, {maximumFractionLength: 2}), '257↊0;55')
    t.equal(dozenal.encode(144.5), '100;6')
    t.equal(dozenal.encode(288.25, {signDisplay: 'always'}), '+200;3')
    t.equal(dozenal.encode(143.75), '↋↋;9')
    t.equal(dozenal.encode(51240.3333333333, {maximumFractionLength: 8}), '257↊0;4')
    t.equal(dozenal.encode(51240.6666666666, {maximumFractionLength: 8}), '257↊0;8')
    t.equal(domino.encode(51234.2345334554, {maximumFractionLength: 2}), '🁨🁵🁕🁢🀹🁠')
    t.deepEqual(base120Numerals.encode(-1440.5), {isNegative: true, integer: [12, 0], fraction: [60], exponent: 0})
    t.deepEqual(complexOutput, {isNegative: false, integer: [ 13 ], fraction: [ 110, 37, 14, 66, 113 ], exponent: 5})

    t.end()
})

test('decoding', (t) =>
{
    t.equal(Math.floor(base120Numerals.decode(complexOutput)), complexInput)
    t.equal(dozenal.decode('100;6  '), 144.5)
    t.equal(dozenal.decode('257↊0;6'), 51240.5)
    t.equal(domino.decode('🁨🁵🁕🁢🁆'), 51234.5)
    t.equal(base120Numerals.decode({ isNegative: false, integer: [ 3 ], fraction: [ 80, 96, 24, 41, 57 ], exponent: 3 }), 6347544.345625)
    t.end()
})

const decimalWithSep = BaseFormatter.decimal({digitSeparator: '-'})

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
            t.equal(decimal.encode(n, {roundingMode, minimumFractionLength: 0, maximumFractionLength: 0}), expectedResults[i])
        })
    })
    roundingModesExpected2.forEach(([roundingMode, expectedResults]) =>
    {
        testNumbers2.forEach((n, i) =>
        {
            t.equal(decimal.encode(n, {roundingMode, minimumFractionLength: 0, maximumFractionLength: 0}), expectedResults[i])
        })
    })
    t.end()
})


const testDate = new Date(2023, 8, 14, 22, 4, 14, 542)
const testDate2 = new Date(2022, 2, 25, 0, 5, 13, 163)
const testDate3 = new Date(2000, 4, 12, 6, 7, 8, 912)

test('datetime', (t) =>
{
    t.equal(decimal.encodeDateTime(testDate, 'YYYYY-MMM-DDDD'), '02023-009-0014')
    t.equal(dozenal.encodeDateTime(testDate, 'YYYYY-MMM-DDDD'), '01207-009-0012')
    t.equal(dozenal.encodeDateTime(testDate, 'n', undefined, 'en-US'), 'S')
    t.equal(dozenal.encodeDateTime(testDate, 'nn', undefined, 'en-US'), 'Sep')
    t.equal(dozenal.encodeDateTime(testDate, 'nnn', undefined, 'en-US'), 'September')
    t.equal(dozenal.encodeDateTime(testDate, 'NN', undefined, 'en-US'), 'Se')
    t.equal(dozenal.encodeDateTime(testDate, 'D'), '12')
    t.equal(dozenal.encodeDateTime(testDate, 'DDDDD'), '00012')
    t.equal(dozenal.encodeDateTime(testDate2, 'ddd'), '071')

    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 12, 0, 5, 13, 163), 'W', undefined, 'en-US'), '7')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 13, 0, 5, 13, 163), 'W', undefined, 'en-US'), '1')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 14, 0, 5, 13, 163), 'W', undefined, 'en-US'), '2')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 15, 0, 5, 13, 163), 'W', undefined, 'en-US'), '3')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 16, 0, 5, 13, 163), 'W', undefined, 'en-US'), '4')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 17, 0, 5, 13, 163), 'W', undefined, 'en-US'), '5')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 18, 0, 5, 13, 163), 'W', undefined, 'en-US'), '6')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 19, 0, 5, 13, 163), 'W', undefined, 'en-US'), '7')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 20, 0, 5, 13, 163), 'W', undefined, 'en-US'), '1')

    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 12, 0, 5, 13, 163), 'W', undefined, 'en-GB'), '6')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 13, 0, 5, 13, 163), 'W', undefined, 'en-GB'), '7')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 14, 0, 5, 13, 163), 'W', undefined, 'en-GB'), '1')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 15, 0, 5, 13, 163), 'W', undefined, 'en-GB'), '2')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 16, 0, 5, 13, 163), 'W', undefined, 'en-GB'), '3')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 17, 0, 5, 13, 163), 'W', undefined, 'en-GB'), '4')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 18, 0, 5, 13, 163), 'W', undefined, 'en-GB'), '5')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 19, 0, 5, 13, 163), 'W', undefined, 'en-GB'), '6')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 20, 0, 5, 13, 163), 'W', undefined, 'en-GB'), '7')
    t.equal(dozenal.encodeDateTime(new Date(2022, 2, 21, 0, 5, 13, 163), 'W', undefined, 'en-GB'), '1')

    t.equal(dozenal.encodeDateTime(testDate2, 'W', undefined, 'en-US'), '6')
    t.equal(dozenal.encodeDateTime(testDate2, 'W', undefined, 'en-GB'), '5')
    t.equal(dozenal.encodeDateTime(testDate2, 'w', undefined, 'en-GB'), '4')
    t.equal(dozenal.encodeDateTime(testDate2, 'v', undefined, 'de-DE'), 'F')
    t.equal(dozenal.encodeDateTime(testDate2, 'vv', undefined, 'de-DE'), 'Fr')
    t.equal(dozenal.encodeDateTime(testDate2, 'vvv', undefined, 'de-DE'), 'Freitag')
    t.equal(dozenal.encodeDateTime(testDate2, 'VVVV', undefined, 'de-DE'), 'Frei')
    t.equal(dozenal.encodeDateTime(testDate2, 'j'), '10')
    t.equal(dozenal.encodeDateTime(testDate2, 'H'), '0')
    t.equal(dozenal.encodeDateTime(testDate2, 'h'), '10')
    t.equal(dozenal.encodeDateTime(testDate2, 'K'), '20')
    t.equal(dozenal.encodeDateTime(testDate2, 'k'), '0')
    t.equal(dozenal.encodeDateTime(testDate2, 'i'), '5')
    t.equal(dozenal.encodeDateTime(testDate2, 'ss'), '11')
    t.equal(dozenal.encodeDateTime(testDate2, 'SSSS'), '1↋58')
    t.equal(dozenal.encodeDateTime(testDate, 'A', undefined, 'en-US'), 'P')
    t.equal(dozenal.encodeDateTime(testDate2, 'AA', undefined, 'de-DE'), 'AM')
    t.equal(dozenal.encodeDateTime(testDate, 'aaa', undefined, 'en-US'), 'p.m.')
    t.equal(dozenal.encodeDateTime(testDate2, 'aa', undefined, 'de-DE'), 'am')
    t.equal(dozenal.encodeDateTime(testDate2, 'p', 'America/New_York', 'en-US'), 'in the evening')
    t.equal(dozenal.encodeDateTime(testDate3, 'Y-M-D H:i:s ZZTT', 'America/New_York'), '11↊8-5-10 1:7:8 -0400')
    t.equal(dozenal.encodeDateTime(testDate3, 'Y-M-D H:i:s ZZ:TT', 'Europe/London'), '11↊8-5-10 6:7:8 +01:00')
    t.equal(dozenal.encodeDateTime(testDate3, 'Q'), '2')
    t.equal(dozenal.encodeDateTime(testDate3, 'u'), '228↊507↋8')
    t.equal(dozenal.encodeDateTime(testDate3, 'e'), 'A')
    t.equal(dozenal.encodeDateTime(testDate3, 'ee'), 'AD')
    t.equal(dozenal.encodeDateTime(testDate3, 'eee'), 'Anno Domini')

    t.end()
})

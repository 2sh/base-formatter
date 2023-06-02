import type { Options } from '../src/base-formatter'

import test from 'tape'

import Base from '../src/base-formatter'

const decimal = Base.decimal()
//const dozenal = Base.dozenal()
//const domino = Base.domino()

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
    [eVal, '1.602177e-19', {notation: 'scientific', maximumFractionDigits: 6}],
    [testVal2, '0.12346', {maximumFractionDigits: 5}],
    [testVal2, '0.1235', {maximumFractionDigits: 4}],
    [testVal2, '0.124', {maximumFractionDigits: 3}],
    [testVal2, '0.12', {maximumFractionDigits: 2}],
    [testVal2, '+0.1', {maximumFractionDigits: 1, signDisplay: 'always'}],
    [testVal2, '0', {maximumFractionDigits: 0}],
    [testVal2, '1.', {maximumFractionDigits: 0, roundingMode: 'ceil', decimalDisplay: 'always'}],
    [testVal2, '0000.12345678900000', {minimumFractionDigits: 14, minimumIntegerDigits:4}],
    [testVal3, '123,456,789', {useGrouping: true}],
    [testVal3, '123,456,789', {useGrouping: 'always'}],
    [testVal3, '1.2346e8', {notation: 'scientific', maximumFractionDigits: 4}],
    [testVal3, '123.4568e6', {notation: 'engineering', maximumFractionDigits: 4}],
    [3456789, '3-4-5-6,7-8-9', {useGrouping: 'min2', digitSeparator: '-'}],
    [testVal4, '6,789', {useGrouping: true}],
    [testVal4, '6,789', {useGrouping: 'always'}],
    [testVal4, '6789', {useGrouping: 'min2'}],
    [testVal4, '6-7-8-9', {useGrouping: 'min2', digitSeparator: '-'}],
]

test('formatting', (t) =>
{
    formattingTests.forEach(([value, expected, opts]) =>
    {
        t.equal(decimal.encode(value, opts), expected)
    })
    
    t.end()
})
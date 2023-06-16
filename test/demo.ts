import type { RoundingMode } from '../src/base-formatter'

import Decimal from 'decimal.js'

import Base from '../src/base-formatter'

const base = Base.decimal()
//const base = Base.hexadecimal()
//const base = Base.base62()
//const base = Base.dozenal()
//const base = Base.duodecimal()
//const base = Base.cuneiform()
//const base = Base.domino()

// Base Demonstration

console.log()
console.log("Multiplication Table")
const size = Math.min(20, base.base+1)
for (let a=1; a<size; a++)
{
	let line = ""
	for (let b=1; b<size; b++)
	{
		const n = a * b
		if (b > 1)
			line += ' '
		line += base.encode(n, {minimumIntegerLength: 2})
	}
	console.log(line)
}
console.log()

console.log("Rounding Modes")
const roundingModes: RoundingMode[] = ['expand', 'trunc', 'ceil', 'floor', 'halfCeil', 'halfFloor', 'halfExpand', 'halfTrunc', 'halfEven', 'halfOdd']
const testNumbers = [5.5, 2.5, 1.75, 1.25, 1.0, -1.0, -1.25, -1.75, -2.5, -5.5]
const baseTestNumber = testNumbers.map(v => base.encode(v, {minimumFractionLength: 1, maximumFractionLength: 1}))

console.log('numbers'.padStart(11, ' ') + ':', ...baseTestNumber)
roundingModes.forEach(mode =>
{
	console.log(mode.padStart(11, ' ') + ':', ...testNumbers.map((v, i) => base.encode(v,
	{
		minimumFractionLength: 0, maximumFractionLength: 0,
		roundingMode: mode,
	}).padEnd(baseTestNumber[i].length, ' ')))
})
console.log()

console.log("Mathematical Constants")
console.log(" π =", base.encode(Math.PI, {minimumFractionLength: 14, maximumFractionLength: 14}))
console.log(" τ =", base.encode(2*Math.PI, {minimumFractionLength: 13, maximumFractionLength: 13}))
console.log(" e =", base.encode(Math.E, {minimumFractionLength: 12, maximumFractionLength: 12}))
console.log("√2 =", base.encode(Math.sqrt(2), {minimumFractionLength: 11, maximumFractionLength: 11}))
console.log(" ϕ =", base.encode((1+Math.sqrt(5))/2, {minimumFractionLength: 10, maximumFractionLength: 10}))

console.log()

console.log("Physical Constants")
console.log(" c =", base.encode(299792458, {useGrouping: true}), "m/s")
console.log(" c =", base.encode(299792458, {notation: 'scientific', minimumFractionLength: 2, maximumFractionLength: 2}), "m/s")
console.log(" c =", base.encode(299792458, {notation: 'engineering', minimumFractionLength: 2, maximumFractionLength: 2}), "m/s")
console.log(" e =", base.encode(1.6021766208e-19, {notation: 'scientific', minimumFractionLength: 8, maximumFractionLength: 8}), "C")
console.log(" G =", base.encode(6.6743e11, {notation: 'scientific', minimumFractionLength: 4, maximumFractionLength: 4}), "m^3 kg^-1 s^-2")
console.log(" h =", base.encode(6.62607015e-34, {notation: 'scientific', minimumFractionLength: 8, maximumFractionLength: 8}), "m^2 kg/s")
console.log()

console.log("Other")
console.log("5e-1 =", base.encode(5e-1, {notation: 'scientific', maximumFractionLength: 3}))
console.log(" 1/3 =", base.encode(1/3, {minimumIntegerLength: 3, minimumFractionLength: 3}))
console.log()

console.log("Fractions")
const fractions = [
	[1, 2], [1, 3], [2, 3], [1, 4], [3, 4],
	[1, 5], [1, 6], [5, 6], [1, 8], [3, 8], [7, 8], [4, 9],
	[1, 10], [3, 10], [1, 12], [1, 16], [1, 32]]
fractions.forEach(([num, dem]) =>
{
	console.log(
		(num.toString() + '/' + dem.toString()).padStart(4, ' '),
		'=',
		base.encode(new Decimal(num).dividedBy(dem), {maximumFractionLength: 8}))
})
console.log()

console.log("Date & Time")
console.log('Local:', base.encodeDateTime(Date.now(), 'YYYY-MM-DD HH:ii:ss ZZ:TT'))
console.log('UTC:  ', base.encodeDateTime(Date.now(), 'YYYY-MM-DD HH:ii:ss ZZ:TT', 'UTC'))
console.log('XMAS: ', base.encodeDateTime(new Date('2023-12-25'), 'YYYY-MM-DD'))
console.log()

for(let i=-20; i<20; i++)
{
	console.log(base.encodeDateTime(new Date(2014, 0, i), 'YYYY-MM-DD ddd VVV jj'))
}

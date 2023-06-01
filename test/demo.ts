import type { RoundingMode } from '../src/base-formatter'

import Decimal from 'decimal.js'

import Base from '../src/base-formatter'

//const base = Base.decimal()
//const base = Base.hexadecimal()
//const base = Base.base62()
//const base = Base.dozenal()
const base = Base.duodecimal()
//const base = Base.cuneiform()
//const base = Base.domino()

// Base Demonstration

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
		line += base.encode(n, {minimumIntegerDigits: 2})
	}
	console.log(line)
}
console.log()

console.log("Rounding Modes")
const roundingModes: RoundingMode[] = ['expand', 'trunc', 'ceil', 'floor', 'halfCeil', 'halfFloor', 'halfExpand', 'halfTrunc', 'halfEven', 'halfOdd']
const testNumbers = [5.5, 2.5, 1.75, 1.25, 1.0, -1.0, -1.25, -1.75, -2.5, -5.5]
const baseTestNumber = testNumbers.map(v => base.encode(v, {fractionDigits: 1}))

console.log('numbers'.padStart(12, ' ') + ':', ...baseTestNumber)
roundingModes.forEach(mode =>
{
	console.log(mode.padStart(12, ' ') + ':', ...testNumbers.map((v, i) => base.encode(v,
	{
		fractionDigits: 0,
		roundingMode: mode,
	}).padEnd(baseTestNumber[i].length, ' ')))
})
console.log()

console.log("Mathematical Constants")
console.log("π  =", base.encode(Math.PI, {fractionDigits: 14}))
console.log("τ  =", base.encode(2*Math.PI, {fractionDigits: 13}))
console.log("e  =", base.encode(Math.E, {fractionDigits: 12}))
console.log("√2 =", base.encode(Math.sqrt(2), {fractionDigits: 11}))
console.log("ϕ  =", base.encode((1+Math.sqrt(5))/2, {fractionDigits: 10}))
console.log()

console.log("Physical Constants")
console.log("c  =", base.encode(299792458, {useGrouping: true}), "m/s")
console.log("c  =", base.encode(299792458, {notation: 'scientific', fractionDigits: 2}), "m/s")
console.log("c  =", base.encode(299792458, {notation: 'engineering', fractionDigits: 2}), "m/s")
console.log("e  =", base.encode(1.6021766208*10**-19, {notation: 'scientific', fractionDigits: 8}), "C")
console.log()

console.log("Fractions")
for (let i=2; i<size; i++)
{
	console.log('1/' + i.toString().padStart(2, '0') + ' = '
		+ base.encode((new Decimal(1)).dividedBy(i), {fractionDigits: 4}))
}
console.log()

console.log("Date & Time")

const dateString = (date: Date, iso: boolean) =>
{   const u = iso ? 'UTC' : ''
    const p = [
        date[`get${u}FullYear`](),
        date[`get${u}Month`]() + 1,
        date[`get${u}Date`](),
        date[`get${u}Hours`](),
        date[`get${u}Minutes`](),
        date[`get${u}Seconds`](),
    ].map(i => base.encode(i, {minimumIntegerDigits: 2}))
    return `${p[0]}-${p[1]}-${p[2]} ${p[3]}:${p[4]}:${p[5]}`
}

const d = new Date()
console.log('Local: ' + dateString(d, false))
console.log('UTC:   ' + dateString(d, true))

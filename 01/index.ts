export {} // why

const path = './01/input.txt'
const file = Bun.file(path)
const text = await file.text()
const lines = text.split('\n')

const values1 = lines.map((line) => {
  const characters = line.split('')
  const digits: string[] = []
  for (const [index, character] of characters.entries()) {
    if (!isNaN(parseInt(character))) {
      digits.push(character)
    }
  }
  return Number(digits.at(0)! + digits.at(-1)!)
})
const sum1 = values1.reduce((sum, val) => sum + val, 0)

const values2 = lines.map((line) => {
  const regex =
    /(?=(zero))|(?=(one))|(?=(two))|(?=(three))|(?=(four))|(?=(five))|(?=(six))|(?=(seven))|(?=(eight))|(?=(nine))|[0-9]/g
  const lut: Record<string, number> = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
  }

  const matches = [...line.matchAll(regex)]
    .flat()
    .filter((item) => item)
    .map((item) => (item in lut ? lut[item] : item))
    .map(String)

  return Number(matches.at(0)! + matches.at(-1)!)
})
const sum2 = values2.reduce((sum, val) => sum + val, 0)

console.log({ sum1, sum2 })

export {} // why

const path = './03/input.txt'
const file = Bun.file(path)
const text = await file.text()
const lines = text.split('\n')

function getAllNumberStartIndices(
  text: string
): { number: number; charIndex: number }[] {
  const regex = /[0-9]+/g
  const indices: { number: number; charIndex: number }[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    indices.push({ number: Number(match[0]), charIndex: match.index })
  }
  return indices
}

class IndexedNumber {
  private static nextId: number = 0
  public id: number
  public used: boolean = false

  constructor(
    public number: number,
    public x: number,
    public y: number
  ) {
    this.id = IndexedNumber.nextId++
  }

  public get coveredXes() {
    return [...Array(String(this.number).length).keys()].map(
      (offset) => this.x + offset
    )
  }

  public use() {
    this.used = true
  }
}

const indexedNumbers = lines
  .map(getAllNumberStartIndices)
  .map((lineIndexedNumbers, index) =>
    lineIndexedNumbers.map((lineIndexedNumber) => ({
      ...lineIndexedNumber,
      lineIndex: index,
    }))
  )
  .flat()
  .map((item) => new IndexedNumber(item.number, item.charIndex, item.lineIndex))

const grid: (IndexedNumber | null)[][] = lines.map((line) =>
  line.split('').map((char) => null)
)
for (const indexedNumber of indexedNumbers) {
  for (const xIndex of indexedNumber.coveredXes) {
    grid[indexedNumber.y][xIndex] = indexedNumber
  }
}

const symbols = lines.flatMap((line, lineIndex) => {
  const nonSymbolRegex = /\.|[0-9]/
  return line
    .split('')
    .map((char, index) => [index, char, !nonSymbolRegex.test(char)] as const)
    .filter(([index, char, isSymbol]) => isSymbol)
    .map(([index, char, isSymbol]) => ({
      x: index,
      y: lineIndex,
      symbol: char,
    }))
})

function getNeighbours(x: number, y: number) {
  return [
    { y: y - 1, x: x - 1 },
    { y: y - 1, x: x },
    { y: y - 1, x: x + 1 },

    { y: y, x: x - 1 },
    // { y: y, x: x}, // don't count the symbol itself
    { y: y, x: x + 1 },

    { y: y + 1, x: x - 1 },
    { y: y + 1, x: x },
    { y: y + 1, x: x + 1 },
  ]
}

function getUniqueIndexedNumberNeighbours(x: number, y: number) {
  const indexedNumbers = getNeighbours(x, y)
    .map(({ x, y }) => grid[y]?.[x])
    .filter((item) => item) as IndexedNumber[]

  return Object.values(
    Object.fromEntries(indexedNumbers.map((num) => [num.id, num]))
  )
}

for (const symbol of symbols) {
  for (const { x, y } of getNeighbours(symbol.x, symbol.y)) {
    grid[y]?.[x]?.use()
  }
}

const sum1 = indexedNumbers
  .filter((number) => number.used)
  .reduce((sum, num) => sum + num.number, 0)

class Component {
  constructor(
    public symbol: string,
    public x: number,
    public y: number
  ) {}

  public get isGear(): boolean {
    return this.symbol === '*' && this.neighbours.length === 2
  }

  public get neighbours(): IndexedNumber[] {
    return getUniqueIndexedNumberNeighbours(this.x, this.y)
  }

  public get ratio(): number {
    return this.neighbours.reduce(
      (product, neighbour) => product * neighbour.number,
      1
    )
  }
}

const sum2 = symbols
  .map((symbol) => new Component(symbol.symbol, symbol.x, symbol.y))
  .filter((component) => component.isGear)
  .reduce((sum, gear) => sum + gear.ratio, 0)

console.log({ sum1, sum2 })

export {} // why

const path = './04/input.txt'
const file = Bun.file(path)
const text = await file.text()
const lines = text.split('\n')

function union<T>(a: Set<T>, b: Set<T>) {
  return new Set([...a].filter((item) => b.has(item)))
}

class Card1 {
  public winningNumbers: Set<number>
  public numbers: Set<number>

  constructor(
    public cardNumberer: number,
    line: string
  ) {
    const mapLineToNumbers = (line: string) =>
      line
        .split(/ +/)
        .filter((token) => token.length > 0)
        .map(Number)
    const [winningNumbers, numbers] = line
      .split(': ')[1]
      .split(' | ')
      .map(mapLineToNumbers)
    this.winningNumbers = new Set(winningNumbers)
    this.numbers = new Set(numbers)
  }

  public get matches(): Set<number> {
    return union(this.numbers, this.winningNumbers)
  }

  public get score(): number {
    return this.matches.size === 0 ? 0 : Math.pow(2, this.matches.size - 1)
  }
}

const sum1 = lines
  .map((line, index) => new Card1(index, line))
  .reduce((sum, card) => sum + card.score, 0)
console.log(sum1)

class Card2 {
  public winningNumbers: Set<number>
  public numbers: Set<number>

  constructor(
    public id: number,
    line: string
  ) {
    const mapLineToNumbers = (line: string) =>
      line
        .split(/ +/)
        .filter((token) => token.length > 0)
        .map(Number)
    const [winningNumbers, numbers] = line
      .split(': ')[1]
      .split(' | ')
      .map(mapLineToNumbers)
    this.winningNumbers = new Set(winningNumbers)
    this.numbers = new Set(numbers)
  }

  public get matches(): Set<number> {
    return union(this.numbers, this.winningNumbers)
  }
}

const card2s = lines.map((line, index) => new Card2(index + 1, line))

const cardCounts: Record<number, number> = Object.fromEntries(
  card2s.map((card) => [card.id, 1])
)

for (const card of card2s) {
  const idsToAddTo = [...Array(card.matches.size).keys()].map(
    (offset) => offset + 1 + card.id
  )
  for (const idToAddTo of idsToAddTo) {
    cardCounts[idToAddTo] += cardCounts[card.id]
  }
}

const sum2 = Object.values(cardCounts).reduce((sum, count) => sum + count, 0)
console.log(sum2)

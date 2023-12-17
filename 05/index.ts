const path = './05/input.txt'
const file = Bun.file(path)
const text = await file.text()

class Range {
  constructor(
    /** Inclusive start */
    public start: number,
    /** Exclusive end */
    public end: number
  ) {}

  public get length(): number {
    return this.end - this.start
  }

  public toString(): string {
    return `[${this.start}, ${this.end})`
  }

  public overlap(range: Range): Range | null {
    if (range.start >= this.end || range.end <= this.start) {
      return null
    }
    return new Range(
      Math.max(this.start, range.start),
      Math.min(this.end, range.end)
    )
  }

  public nextTo(range: Range): boolean {
    return this.end === range.start || this.start === range.end
  }

  public join(range: Range): Range {
    if (this.end === range.start) {
      return new Range(this.start, range.end)
    }
    if (this.start === range.end) {
      return new Range(range.start, this.end)
    }
    throw new Error("Can't join ranges that aren't next to each other.")
  }
}

class Mapping {
  constructor(
    /** Inclusive start */
    private sourceStart: number,
    /** Inclusive start */
    private destinationStart: number,
    private rangeLength: number
  ) {}

  /** Exclusive end */
  private get sourceEnd(): number {
    return this.sourceStart + this.rangeLength
  }
  /** Exclusive end */
  private get destinationEnd(): number {
    return this.destinationStart + this.rangeLength
  }

  public get sourceRange(): Range {
    return new Range(this.sourceStart, this.sourceEnd)
  }

  public get destinationRange(): Range {
    return new Range(this.destinationStart, this.destinationEnd)
  }

  public toString(): string {
    return `<MappingRange ${this.sourceRange} => ${this.destinationRange}>`
  }

  public inSource(sourceNumber: number): boolean {
    return this.sourceStart <= sourceNumber && sourceNumber < this.sourceEnd
  }

  public map(sourceNumber: number): number {
    if (!this.inSource(sourceNumber)) {
      throw new Error(`${sourceNumber} not in ${this}`)
    }
    return sourceNumber - this.sourceStart + this.destinationStart
  }
}

class MappingSet {
  constructor(
    public name: string,
    public mappings: Mapping[]
  ) {}

  public static fromSection(section: string): MappingSet {
    const lines = section.split('\n')
    const name = lines[0].split(' ')[0]
    const mappings = lines
      .slice(1)
      .map((line) => line.split(' ').map(Number) as [number, number, number])
      .map(
        ([destinationStart, sourceStart, rangeLength]) =>
          new Mapping(sourceStart, destinationStart, rangeLength)
      )
      .toSorted((a, b) => a.sourceRange.start - b.sourceRange.start)

    return new MappingSet(name, mappings)
  }

  public mapValue(sourceValue: number): number {
    return (
      this.mappings
        .find((mapping) => mapping.inSource(sourceValue))
        ?.map(sourceValue) ?? sourceValue
    )
  }

  public mapRange(sourceRange: Range): Range[] {
    let remainder = sourceRange
    const mappedRanges: Range[] = []
    for (const mapping of this.mappings) {
      if (mapping.sourceRange.end <= remainder.start) {
        continue
      }
      if (remainder.end <= mapping.sourceRange.start) {
        continue
      }
      if (remainder.start < mapping.sourceRange.start) {
        // add a non-mapped range
        mappedRanges.push(new Range(remainder.start, mapping.sourceRange.start))
        remainder = new Range(mapping.sourceRange.start, remainder.end)
      }
      if (remainder.length === 0) break

      if (remainder.length <= mapping.sourceRange.length) {
        if (
          remainder.start < mapping.sourceRange.start ||
          remainder.start >= mapping.sourceRange.end
        ) {
          console.warn('WHAT')
        }
        const start =
          mapping.destinationRange.start +
          (remainder.start - mapping.sourceRange.start)
        const end = start + remainder.length
        mappedRanges.push(new Range(start, end))
        remainder = new Range(remainder.end, remainder.end)
        break
      }
      const start =
        mapping.destinationRange.start +
        (remainder.start - mapping.sourceRange.start)
      mappedRanges.push(new Range(start, mapping.destinationRange.end))
      remainder = new Range(mapping.sourceRange.end, remainder.end)
    }
    if (remainder.length > 0) {
      mappedRanges.push(remainder)
    }

    // console.log(mappedRanges.length)

    return mappedRanges
  }
}

// RE: 0 1 2 3 4 5 6 7 8
// O1:   1 2
// O2:         4 5
// O3:             6 7 8 9

const mappingSets = text
  .split('\n\n')
  .slice(1)
  .map((section) => MappingSet.fromSection(section))

function chunk<T>(arr: T[], size: number) {
  const chunked = [[]] as T[][]
  for (const item of arr) {
    if (chunked.at(-1)!.length === size) {
      chunked.push([])
    }
    chunked.at(-1)!.push(item)
  }
  return chunked
}

const seeds = text.split('\n')[0].split(': ')[1].split(' ').map(Number)
let values = seeds
for (const mappingSet of mappingSets) {
  values = values.map((value) => mappingSet.mapValue(value))
}
const minValue1 = Math.min(...values)

const seedRanges = (chunk(seeds, 2) as [number, number][]).map(
  ([start, length]) => new Range(start, start + length)
)

let ranges = seedRanges
for (const mappingSet of mappingSets) {
  ranges = ranges
    .flatMap((range) => {
      const mappedRange = mappingSet.mapRange(range)
      console.log(range.toString(), mappedRange.toString())
      return mappedRange
    })
    .toSorted((a, b) => a.start - b.start)
    .reduce((ranges, range) => {
      if (ranges.length === 0) return [range]
      if (ranges.at(-1)!.end === range.start) {
        const other = ranges.pop()!
        ranges.push(range.join(other))
      } else {
        ranges.push(range)
      }
      return ranges
    }, [] as Range[])
  console.log(ranges.length)
}
const minValue2 = Math.min(...ranges.map((range) => range.start))
// TODO: Replace map with every value with a range-based system.
console.log({ minValue1, minValue2 })

export {} // why

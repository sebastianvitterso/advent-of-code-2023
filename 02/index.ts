export {} // why

const path = './02/input.txt'
const file = Bun.file(path)
const text = await file.text()
const games = text.split('\n')

// 12 red, 13 green, 14 blue

const colors = ['red', 'green', 'blue'] as const
type Color = (typeof colors)[number]
type Set = Record<Color, number>

const maxes: Set = { red: 12, green: 13, blue: 14 }

const gameSets = games.map((game) => {
  const gameInfo = game.split(': ')[1]
  const sets: Set[] = gameInfo.split('; ').map(
    (set) =>
      Object.fromEntries(
        set.split(', ').map((colorCount) => {
          const [count, color] = colorCount.split(' ')
          return [color as Color, Number(count)]
        })
      ) as Set
  )
  return sets
})

const gamePlayabilities = gameSets.map((sets) => {
  const setPlayabilities = sets.map((set) =>
    colors.every((color: Color) => (set[color] ?? 0) <= maxes[color])
  )
  return setPlayabilities.every((playable) => playable)
})
const playableGameIndices = gamePlayabilities
  .map((playability, index) => [index, playability] as [number, boolean])
  .filter(([index, playability]) => playability)
  .map(([index, playability]) => index + 1)
const sum1 = playableGameIndices.reduce((sum, val) => sum + val, 0)

const minimumCubeSets = gameSets.map((sets) => {
  const minCubeSet = Object.fromEntries(
    colors.map((color) => [
      color,
      Math.max(...sets.map((set) => set[color] ?? 0)),
    ])
  )

  return minCubeSet as Set
})
const cubeSetProducts = minimumCubeSets.map(
  (set) => set.red * set.green * set.blue
)
const sum2 = cubeSetProducts.reduce((sum, val) => sum + val, 0)

console.log({ sum1, sum2 })

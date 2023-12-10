const path = "./01/input.txt"
const file = Bun.file(path)
const text = await file.text()
console.log(file)


export {}
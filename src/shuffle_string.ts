import { cuid } from '@adonisjs/core/helpers'
import Rand, { PRNG } from 'rand-seed'

export const seedRand = (seed: string): number => {
  const rand = new Rand(seed, PRNG.xoshiro128ss)
  return rand.next()
}

export const seedRandRange = (min: number, max: number, seed: string | number): number => {
  const seededRandom = typeof seed === 'string' ? seedRand(seed) : seed

  return Math.floor(seededRandom * (max - min) + min)
}

const shuffle = (array: string[], seed: number) => {
  let currentIndex = array.length
  let temporaryValue: string
  let randomIndex: number

  seed = seed || 1

  const random = () => {
    var x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(random() * currentIndex)
    currentIndex -= 1
    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

export const shuffleString = (data: string, seed?: string): string => {
  const selectedSeed = seed ?? cuid()

  const dataLength = data.length

  if (dataLength < 10) {
    return data
  }

  const splittedData = [...data.split('')]

  const intSeed = seedRand(selectedSeed)

  const newLength = seedRandRange(Math.ceil(dataLength / 2), dataLength, intSeed)

  return shuffle(splittedData, intSeed).slice(0, newLength).join('')
}

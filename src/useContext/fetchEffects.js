import { constants } from './constants'

const reduceData = (fullData) => {
  const {
    species,
    varieties,
    capture_rate,
    forms,
    past_types,
    is_default,
    location_area_encounters,
    game_indices,
    base_experience,
    types,
    stats,
    held_items,
    evolution_chain,
    sprites,
    moves,
    ...rest } = fullData

  const { other: { dream_world, home, }, versions, ...restSprites } = sprites
  const official = sprites.other["official-artwork"]

  const formattedSprites = { ...restSprites, dream_world, home, official }

  const { genera, flavor_text_entries, egg_groups, color, generation, growth_rate, habitat, shape } = species

  const power = stats.reduce((acum, value) => acum + value.base_stat, 0)

  const generaEN = genera.filter(item => item.language.name === "en")
  const subTitle = generaEN[0]?.genus || ""

  const descriptionEN = flavor_text_entries.filter(item => item.language.name === "en")
  const description = descriptionEN[0].flavor_text.replace("\f", '. ')

  const formattedStats = stats.map(({ stat, base_stat }) => ({ name: stat.name, value: base_stat }))

  const eggs = egg_groups.map(egg => egg.name)


  const typesRaw = types.map(item => item.type.name)

  const formattedMoves = moves?.map(item => ({
    name: item.move?.name,
    learnLvl: item.version_group_details[0]?.level_learned_at,
    learnMethod: item.version_group_details[0]?.move_learn_method.name,
  }))

  const extra = {
    sprites: formattedSprites,
    generation: constants().ROMAN_NUMBERS[generation.name.replace("generation-", '')],
    power,
    subTitle,
    capture_rate,
    description,
    color: color.name,
    egg_groups: eggs,
    types: typesRaw,
    stats: formattedStats,
    evolution_chain: evolution_chain?.chain,
    growth_rate,
    habitat,
    moves: formattedMoves,
    shape: shape?.name
  }

  return { ...rest, ...extra }
}

const getFullData = basicData => {
  return basicData.map(async (pokemon) => {
    // specie
    const fetch_specie = await fetch(pokemon.species.url)
    const specieResult = await fetch_specie.json()

    // evolution chain
    const evolutionUrl = specieResult.evolution_chain?.url

    if (evolutionUrl) {
      const fetch_evolution_chain = await fetch(evolutionUrl)
      const evolution_chain = await fetch_evolution_chain.json()

      const fullData = await { ...pokemon, species: specieResult, evolution_chain }

      return await reduceData(fullData)
    }

    const fullData = await { ...pokemon, species: specieResult }

    return await reduceData(fullData)
  })
}

export const getAll = async (items, fn) => {
  const promises = await items.map(item => fn(item.url))

  const result = await Promise.all(
    await promises.map(async data => {
      const res = await data
      return res.json()
    }))

  const fullData = await Promise.all(getFullData(result))

  return fullData
}

export const getSeries = async (items, fn) => {
  let result = []
  const data = await items.reduce((acc, item) => {
    acc = acc.then(() => fn(item).then(res => result.push(res)))
    return acc
  }, Promise.resolve())

  return data
}

export const getSplits = async (items, chunkSize) => {
  const result = []

  for (let i = 0; i < items.length; i += chunkSize) {
    result.push(items.slice(i, i + chunkSize))
  }

  return result
}

export const getChunks = async (items, fn, setFilters, chunkSize = 10) => {
  let result = []

  const splits = await getSplits(items, chunkSize)

  await getSeries(splits, async chunk => {
    const all = await getAll(chunk, fn)

    result.push(...all)
    setFilters(result)
  })

  return result
}

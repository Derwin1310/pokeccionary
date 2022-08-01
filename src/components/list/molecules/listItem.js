import React, { useContext } from 'react'
import { contextApi } from '/src/useContext'
import { FemaleSprite, ListImg, Stats, Types } from '../atoms'
import { formatHeight, formatWeight, Tooltip } from '/src/helpers'

export function ListItem() {
  const {
    pokemons,
    options: { op_color, op_units },
    effects: { handleCardData },
  } = useContext(contextApi)

  const handleClick = data => () => {
    window.scrollTo(0, 0)
    handleCardData(data)
  }

  const fixName = name => name.split("-").join(" ")

  return (
    <ul className='pokelist'>
      {pokemons.map(pokemon => {
        const { sprites, id, name, height, weight, types, stats, subTitle } = pokemon
        const typeColor = op_color ? types[0] + " active-colors" : ''

        return (
          <li
            key={id}
            onClick={handleClick(pokemon)}
            className={`pokeitem grid-rows highlight ${typeColor}`}
          >
            <figure className="sprites__figure">
              <ListImg sprites={sprites} />
              <FemaleSprite sprite={sprites.front_female} />
            </figure>

            <p className='pokeitem__id'>{id}</p>
            <div className='pokeitem__name'>
              <Tooltip text={subTitle}>
                <p>{fixName(name)}</p>
              </Tooltip>
            </div>
            <p className='pokeitem__height'>{formatHeight(height, op_units)}</p>
            <p className='pokeitem__weight'>{formatWeight(weight, op_units)}</p>
            <Types types={types} typeColor={typeColor} />
            <Stats stats={stats} />
          </li>
        )
      })}
    </ul>
  )
}

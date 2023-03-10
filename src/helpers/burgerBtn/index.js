import React, { useContext } from 'react'
import { contextApi } from '/src/useContext'
import './style.sass'

export function BurgerBtn() {
  const { toggle, effects: { handleToggle } } = useContext(contextApi)

  return (
    <button className={`hamburger ${toggle ? 'hamburger--is-active' : ''}`} onClick={handleToggle}>
      <div className='hamburger__div' />
      <div className='hamburger__div' />
      <div className='hamburger__div' />
    </button>
  )
}

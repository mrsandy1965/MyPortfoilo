import { navLinks } from '#constants'
import React from 'react'

const  Navbar = () => {
  return (
    <nav>
        <div>
            <img src="/images/logo.svg" alt="logo" />
            <p className='font-bold'>Sandesh's Portfoilo</p>
            <ul>
                {navLinks.map((item)=><li key={item.id}><p>{item.name}</p></li> )}
            </ul>
        </div>
    </nav>
  )
}

export default Navbar

import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { navIcons, navLinks } from '#constants'

const  Navbar = () => {
    const [currentTime , setCurrentTime] = useState(dayjs().format('ddd D MMM h:mm:ss A'))
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(dayjs().format('ddd D MMM h:mm:ss A'))
        }, 1000)

        return () => clearInterval(timer)
    }, [])
  return (
    <nav>


        <div>
            <img src="/images/logo.svg" alt="logo" />
            <p className='font-bold'>Sandesh's Portfoilo</p>
            <ul>
                {navLinks.map((item)=><li key={item.id}><p>{item.name}</p></li> )}
            </ul>
        </div>


        <div>
            <ul>
                {navIcons.map((item)=><li key={item.id}><img src={item.img} className='icon-hover' alt={`icon-${item.id}`} /></li> )}
            </ul>
            <time>{currentTime}</time>
        </div>
    </nav>
  )
}

export default Navbar

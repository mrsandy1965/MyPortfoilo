import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { navIcons, navLinks } from '#constants'
import useWindowStore from '#store/window';

const  Navbar = () => {
    const {openWindow } = useWindowStore();
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
            <img src="/images/logo.svg" alt="logo" className='w-5 h-5'/>
            <p className='font-bold'>Sandesh's Portfoilo</p>
            <ul>
                {navLinks.map((item)=>(
                    <li key={item.id}>
                        <button 
                            type="button"
                            onClick={() => openWindow(item.type)}
                            className="text-sm cursor-pointer hover:underline transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-sm"
                        >
                            {item.name}
                        </button>
                    </li> 
                ))}
            </ul>
        </div>


        <div>
            <ul>
                {navIcons.map((item)=><li key={item.id}><img src={item.img} className='icon-hover w-4 h-4' alt={`icon-${item.id}`} /></li> )}
            </ul>
            <time>{currentTime}</time>
        </div>
    </nav>
  )
}

export default Navbar

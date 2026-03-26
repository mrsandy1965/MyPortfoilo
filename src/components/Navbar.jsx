import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { navIcons, navLinks } from '#constants'
import useWindowStore from '#store/window';

const useBattery = () => {
  const [battery, setBattery] = useState(null);
  useEffect(() => {
    if (!navigator.getBattery) return;
    navigator.getBattery().then(b => {
      const update = () => setBattery({ level: Math.round(b.level * 100), charging: b.charging });
      update();
      b.addEventListener('levelchange', update);
      b.addEventListener('chargingchange', update);
      return () => { b.removeEventListener('levelchange', update); b.removeEventListener('chargingchange', update); };
    });
  }, []);
  return battery;
};

const useNetwork = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);
  return isOnline;
};

const Navbar = () => {
    const { openWindow } = useWindowStore();
    const battery = useBattery();
    const isOnline = useNetwork();
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
                {navIcons.map((item, index) => (
                    <li key={item.id}>
                        <img 
                            src={item.img} 
                            className='icon-hover w-4 h-4 cursor-pointer' 
                            alt={`icon-${item.id}`} 
                            onClick={index === navIcons.length - 1 ? () => {
                                if (!document.fullscreenElement) {
                                    document.documentElement.requestFullscreen();
                                } else if (document.exitFullscreen) {
                                    document.exitFullscreen();
                                }
                            } : undefined}
                        />
                    </li>
                ))}
            </ul>
            <span title={isOnline ? "Online" : "Offline"} className="cursor-pointer" style={{ fontSize: '0.9rem', opacity: 0.85 }}>
                {isOnline ? '🛜' : '⚠️'}
            </span>
            {battery && (
              <span title={`Battery: ${battery.level}%`} style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                {battery.charging ? '⚡' : '🔋'} {battery.level}%
              </span>
            )}
            <time>{currentTime}</time>
        </div>
    </nav>
  )
}

export default Navbar

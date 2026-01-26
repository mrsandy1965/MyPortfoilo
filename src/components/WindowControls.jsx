import React from 'react'
import useWindowStore from '#store/window'

const WindowControls = ({target}) => {
    const {closeWindow} = useWindowStore()
  return (
    <div className="window-controls">
        <button 
            type="button" 
            className='close' 
            onClick={() => closeWindow(target)}
            aria-label="Close window"
        />
        <button 
            type="button" 
            className='minimize'
            aria-label="Minimize window"
        />
        <button 
            type="button" 
            className='maximize'
            aria-label="Maximize window"
        />
    </div>
  )
}

export default WindowControls
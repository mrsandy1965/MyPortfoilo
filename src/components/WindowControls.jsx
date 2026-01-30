import React from 'react'
import useWindowStore from '#store/window'

const WindowControls = ({target}) => {
    const {closeWindow, minimizeWindow} = useWindowStore()
    
    const handleClose = (e) => {
        e.stopPropagation()
        closeWindow(target)
    }
    
    const handleMinimize = (e) => {
        e.stopPropagation()
        minimizeWindow(target)
    }
    
  return (
    <div className="window-controls">
        <button 
            type="button" 
            className='close' 
            onClick={handleClose}
            aria-label="Close window"
        />
        <button 
            type="button" 
            className='minimize'
            onClick={handleMinimize}
            aria-label="Minimize window"
        />
        <button 
            type="button" 
            className='maximize'
            aria-label="Maximize window (disabled)"
            disabled
        />
    </div>
  )
}

export default WindowControls
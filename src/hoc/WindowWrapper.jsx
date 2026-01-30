import useWindowStore from "#store/window";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";
import { useLayoutEffect, useRef, useState, useEffect } from "react";

// Register the Draggable plugin
gsap.registerPlugin(Draggable);

// Window size constraints
const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;

const WindowWrapper = (Component , windowKey) => {
    const Wrapped = (props)=> {
        const {focusWindow, windows, setWindowSize} = useWindowStore()
        const windowData = windows[windowKey]
        const ref = useRef(null)
        
        const {isOpen, zIndex, isMinimized, width: storedWidth, height: storedHeight} = windowData || { isOpen: false, zIndex: 1000 }
        
        // Local state for resizing
        const [dimensions, setDimensions] = useState({
            width: storedWidth || 800,
            height: storedHeight || 600
        })
        const [isResizing, setIsResizing] = useState(false)
        const [resizeDirection, setResizeDirection] = useState(null)
        
        // Update local dimensions when stored dimensions change
        useEffect(() => {
            if (storedWidth && storedHeight) {
                setDimensions({ width: storedWidth, height: storedHeight })
            }
        }, [storedWidth, storedHeight])
        
        // All hooks must be called unconditionally before any early returns
        useGSAP(()=>{
            const currElement = ref.current;
            if(!currElement || !isOpen) return;
            currElement.style.display = "block";
            gsap.fromTo(currElement,{
                opacity:0,
                scale:0.8,
                y:40
            },{
                opacity:1,
                scale:1,
                y:0,
                duration:0.3,
                ease:"power3.out"
            })
        },[isOpen])

        useGSAP(()=>{
            const currElement = ref.current;
            if(!currElement || !isOpen) return;
            const header = currElement.querySelector('.window-header')
            const [instance] = Draggable.create(currElement, {
                trigger: header || currElement,
                bounds: "body",
                type: "x,y",
                edgeResistance: 0.65,
                cursor: "default",
                onClick: () => {
                    focusWindow(windowKey)
                },
                onPress: () => {
                    focusWindow(windowKey)
                }
            })
            return ()=> instance.kill();
        },[isOpen, focusWindow, windowKey])

        // Resize handlers
        const handleResizeStart = (direction) => (e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsResizing(true)
            setResizeDirection(direction)
        }

        const dimensionsRef = useRef(dimensions)

        // Keep ref in sync with state
        useEffect(() => {
            dimensionsRef.current = dimensions
        }, [dimensions])

        useEffect(() => {
            if (!isResizing || !ref.current) return

            const handleMouseMove = (e) => {
                if (!resizeDirection) return

                const rect = ref.current.getBoundingClientRect()
                const curDims = dimensionsRef.current
                let newWidth = curDims.width
                let newHeight = curDims.height

                // Calculate new dimensions based on resize direction
                if (resizeDirection.includes('e')) {
                    newWidth = Math.max(MIN_WIDTH, e.clientX - rect.left)
                }
                if (resizeDirection.includes('s')) {
                    newHeight = Math.max(MIN_HEIGHT, e.clientY - rect.top)
                }
                if (resizeDirection.includes('w')) {
                    const delta = rect.left - e.clientX
                    const potentialWidth = curDims.width + delta
                    if (potentialWidth >= MIN_WIDTH) {
                        newWidth = potentialWidth
                        // Use GSAP to set x position (compatible with Draggable)
                        gsap.set(ref.current, { x: `+=${-delta}` })
                    }
                }
                if (resizeDirection.includes('n')) {
                    const delta = rect.top - e.clientY
                    const potentialHeight = curDims.height + delta
                    if (potentialHeight >= MIN_HEIGHT) {
                        newHeight = potentialHeight
                        // Use GSAP to set y position (compatible with Draggable)
                        gsap.set(ref.current, { y: `+=${-delta}` })
                    }
                }

                setDimensions({ width: newWidth, height: newHeight })
            }

            const handleMouseUp = () => {
                setIsResizing(false)
                setResizeDirection(null)
                // Save dimensions to store from ref to ensure latest values
                const { width, height } = dimensionsRef.current
                setWindowSize(windowKey, width, height)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            document.body.style.userSelect = 'none'

            return () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
                document.body.style.userSelect = ''
            }
        }, [isResizing, resizeDirection, windowKey, setWindowSize])

        useLayoutEffect(()=>{
            const currElement = ref.current;
            if(!currElement) return;
            currElement.style.display = (isOpen && !isMinimized) ? "block" : "none";
            
        },[isOpen, isMinimized])
        
        // Early returns come AFTER all hooks
        if (!windowData) return null;
        if (!isOpen || isMinimized) return null;

        const resizeHandleStyle = "absolute bg-transparent hover:bg-blue-500/20 transition-colors"
        const getCursor = (dir) => {
            const cursors = {
                'n': 'ns-resize', 's': 'ns-resize',
                'e': 'ew-resize', 'w': 'ew-resize',
                'ne': 'nesw-resize', 'sw': 'nesw-resize',
                'nw': 'nwse-resize', 'se': 'nwse-resize'
            }
            return cursors[dir] || 'default'
        }

        return (<section 
            id={windowKey} 
            ref={ref} 
            style={{
                zIndex,
                width: `${dimensions.width}px`,
                height: `${dimensions.height}px`,
            }} 
            className="absolute overflow-hidden"
            onClick={() => focusWindow(windowKey)}
        >
            <Component {...props} />
            
            {/* Resize handles */}
            <>
                {/* Edges */}
                <div className={`${resizeHandleStyle} top-0 left-0 right-0 h-1`} 
                     onMouseDown={handleResizeStart('n')} style={{cursor: getCursor('n')}} />
                <div className={`${resizeHandleStyle} bottom-0 left-0 right-0 h-1`} 
                     onMouseDown={handleResizeStart('s')} style={{cursor: getCursor('s')}} />
                <div className={`${resizeHandleStyle} top-0 bottom-0 left-0 w-1`} 
                     onMouseDown={handleResizeStart('w')} style={{cursor: getCursor('w')}} />
                <div className={`${resizeHandleStyle} top-0 bottom-0 right-0 w-1`} 
                     onMouseDown={handleResizeStart('e')} style={{cursor: getCursor('e')}} />
                
                {/* Corners */}
                <div className={`${resizeHandleStyle} top-0 left-0 w-2 h-2`} 
                     onMouseDown={handleResizeStart('nw')} style={{cursor: getCursor('nw')}} />
                <div className={`${resizeHandleStyle} top-0 right-0 w-2 h-2`} 
                     onMouseDown={handleResizeStart('ne')} style={{cursor: getCursor('ne')}} />
                <div className={`${resizeHandleStyle} bottom-0 left-0 w-2 h-2`} 
                     onMouseDown={handleResizeStart('sw')} style={{cursor: getCursor('sw')}} />
                <div className={`${resizeHandleStyle} bottom-0 right-0 w-2 h-2`} 
                     onMouseDown={handleResizeStart('se')} style={{cursor: getCursor('se')}} />
            </>
        </section>)
    }
    Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || "Component"})`
    return Wrapped;
};
export default WindowWrapper;
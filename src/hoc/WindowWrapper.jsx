import useWindowStore from "#store/window";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";
import { useLayoutEffect, useRef } from "react";

// Register the Draggable plugin
gsap.registerPlugin(Draggable);

const WindowWrapper = (Component , windowKey) => {
    const Wrapped = (props)=> {
        const {focusWindow,windows} = useWindowStore()
        const windowData = windows[windowKey]
        const ref = useRef(null)
        
        const {isOpen, zIndex} = windowData || { isOpen: false, zIndex: 1000 }
        
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

        useLayoutEffect(()=>{
            const currElement = ref.current;
            if(!currElement) return;
            currElement.style.display = isOpen ? "block" : "none";
            
        },[isOpen])
        
        // Early returns come AFTER all hooks
        if (!windowData) return null;
        if (!isOpen) return null;

        return (<section id={windowKey} ref={ref} style={{zIndex}} className="absolute" >
            <Component {...props} />
        </section>)
    }
    Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || "Component"})`
    return Wrapped;
};
export default WindowWrapper;
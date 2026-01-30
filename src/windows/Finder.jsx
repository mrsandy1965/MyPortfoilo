import { WindowControls } from "#components"
import WindowWrapper from "#hoc/WindowWrapper"
import { Search } from "lucide-react"
import useLocationStore from '#store/location'
import useContentStore from '#store/content'
import clsx from "clsx"
import useWindowStore from "#store/window"
import { useState, useEffect, useRef } from "react"

const Finder = () => {
    const {activeLocation, setActiveLocation} = useLocationStore()
    const {openWindow } = useWindowStore();
    const { locations } = useContentStore(); // Use dynamic content
    const [sidebarWidth, setSidebarWidth] = useState(256); // Default 256px
    const [isResizing, setIsResizing] = useState(false);

    const openItem = (item)=>{
        if(!item.fileType || !item.kind) {
            console.warn("Invalid item type or kind", item);
            return;
        }
        if(item.fileType === 'pdf') return openWindow("resume")
        if(item.kind === 'folder') return setActiveLocation(item)
        if(['fig','url'].includes(item.fileType) && item.href) return window.open(item.href, '_blank', 'noopener,noreferrer')  
        
        openWindow(`${item.fileType}${item.kind}`,item)
    }

    // Sidebar resize handlers
    const isResizingRef = useRef(false);

    const handleMouseDown = (e) => {
        setIsResizing(true);
        isResizingRef.current = true;
        e.preventDefault();
    };

    // Add/remove mouse event listeners for resize
    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e) => {
             // We can check ref here if we want extra safety, but since we bind only when isResizing is true...
             // The user asked to define them inline.
             
            const finderWindow = document.getElementById('finder');
            if (!finderWindow) return;
            
            const windowRect = finderWindow.getBoundingClientRect();
            const windowLeft = windowRect.left;
            const windowWidth = windowRect.width;
            const newWidth = e.clientX - windowLeft;
            
            // Limit width between 150px and 50% of window width (max 400px)
            const maxWidth = Math.min(windowWidth * 0.5, 400);
            if (newWidth >= 150 && newWidth <= maxWidth) {
                setSidebarWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            isResizingRef.current = false;
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing]);

    const renderList = (name, items)=> (
        <div>
            <h3>{name}</h3>
            <ul>
                {items.map((item)=>(<li key={item.id} onClick={()=>{setActiveLocation(item)}} className={clsx(item.id===activeLocation.id ? 'active':'not-active')}>
                    <img src={item.icon} className="w-4" alt={item.name}  />
                    <p className="text-sm font-medium truncate">{item.name}</p>
                </li>))}
            </ul>
        </div>
    )
  return (
    <>
    <div className="window-header">
        <WindowControls target="finder"/>
        <Search className="icon"/>
    </div>

    <div className="bg-white flex h-full" style={{ '--sidebar-width': `${sidebarWidth}px` }}>
        <div className="sidebar">
            {renderList("Favorites", locations ? Object.values(locations) : [])}
            {renderList("My Projects", locations?.work?.children || [])}
        </div>
        
        {/* Resize Handle */}
        <div
            className={clsx(
                "w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors flex-none",
                isResizing && "bg-blue-500"
            )}
            onMouseDown={handleMouseDown}
            title="Drag to resize sidebar"
        />

        <ul className="content">
            {(activeLocation?.children || []).map((item)=>(
                <li key={item.id} 
                    onClick={(e)=>{
                        e.stopPropagation();
                        return openItem(item)}} 
                    >
                        <img src={item.icon} alt={item.name} />
                        <p>{item.name}</p>
                </li>
                ))}
        </ul>
    </div>
    
    </>
  )
}
const FinderWindow = WindowWrapper(Finder,"finder")
export default FinderWindow

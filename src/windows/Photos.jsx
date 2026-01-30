import { WindowControls } from "#components";
import WindowWrapper from "#hoc/WindowWrapper";
import { gallery as initialGallery, photosLinks } from "#constants";
import { useState, useMemo, useEffect } from "react";
import useWindowStore from "#store/window";
import clsx from "clsx";
import { Search, Heart, Tag, X } from "lucide-react";

const Photos = () => {
    const [activeAlbum, setActiveAlbum] = useState(1); // Default to first album
    const [searchTerm, setSearchTerm] = useState("");
    const [galleryData, setGalleryData] = useState(initialGallery);
    const [contextMenu, setContextMenu] = useState(null);
    const [showTagModalId, setShowTagModalId] = useState(null);
    const [sidebarWidth, setSidebarWidth] = useState(256); // Default 256px (w-64)
    const [isResizing, setIsResizing] = useState(false);
    const { openWindow } = useWindowStore();

    const currentAlbumTag = photosLinks.find(item => item.id === activeAlbum)?.tag || 'all';

    // Derived state for the modal image - ensures we always have the latest data
    const modalImage = useMemo(() => {
        if (!showTagModalId) return null;
        return galleryData.find(img => img.id === showTagModalId);
    }, [galleryData, showTagModalId]);

    // Filter images based on active album and search
    // ... (existing filter logic remains same, just ensuring context is clear)
    const filteredImages = useMemo(() => {
        let filtered = galleryData;

        // Filter by album/tag
        if (currentAlbumTag === 'all') {
            filtered = galleryData;
        } else if (currentAlbumTag === 'favorites') {
            filtered = galleryData.filter(img => img.isFavorite);
        } else {
            filtered = galleryData.filter(img => img.tags.includes(currentAlbumTag));
        }

        // Filter by search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(img => 
                img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        return filtered;
    }, [galleryData, currentAlbumTag, searchTerm]);

    const handleImageClick = (item) => {
        const imageData = {
            id: item.id,
            name: item.title,
            imageUrl: item.img,
        };
        openWindow("imgfile", imageData);
    };

    const handleContextMenu = (e, item) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            image: item
        });
    };

    const toggleFavorite = (imageId) => {
        setGalleryData(prev => prev.map(img => 
            img.id === imageId ? { ...img, isFavorite: !img.isFavorite } : img
        ));
        setContextMenu(null);
    };

    const openTagModal = (image) => {
        setShowTagModalId(image.id);
        setContextMenu(null);
    };

    const toggleTag = (imageId, tag) => {
        setGalleryData(prev => prev.map(img => {
            if (img.id === imageId) {
                const tags = img.tags.includes(tag)
                    ? img.tags.filter(t => t !== tag)
                    : [...img.tags, tag];
                return { ...img, tags };
            }
            return img;
        }));
    };

    // Close context menu on click outside
    const handleClickOutside = () => {
        setContextMenu(null);
    };

    // ... (resize handlers remain same)
    
    // Sidebar resize handlers
    const handleMouseDown = (e) => {
        setIsResizing(true);
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!isResizing) return;
        
        // Get the Photos window's left position
        const photosWindow = document.getElementById('photos');
        if (!photosWindow) return;
        
        const windowRect = photosWindow.getBoundingClientRect();
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
    };

    // Add/remove mouse event listeners for resize
    useEffect(() => {
        const moveHandler = (e) => handleMouseMove(e);
        const upHandler = () => handleMouseUp();
        
        if (isResizing) {
            document.addEventListener('mousemove', moveHandler);
            document.addEventListener('mouseup', upHandler);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }
        
        return () => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing]);

    return (
        <>
            <div className="window-header">
                <WindowControls target="photos" />
                <h2 className="font-bold text-sm flex-1 text-center">Photos</h2>
                
                {/* Search Bar */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search photos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            <div 
                className="bg-white flex h-full" 
                onClick={handleClickOutside}
                style={{ '--sidebar-width': `${sidebarWidth}px` }}
            >
                {/* Sidebar */}
                <div className="sidebar">
                    <div>
                        <h3>Albums</h3>
                        <ul>
                            {photosLinks.map((item) => (
                                <li 
                                    key={item.id} 
                                    className={clsx(
                                        activeAlbum === item.id ? 'active' : 'not-active',
                                        'cursor-pointer'
                                    )}
                                    onClick={() => setActiveAlbum(item.id)}
                                >
                                    <img src={item.icon} className="w-4" alt={item.title} />
                                    <p className="text-sm font-medium truncate">{item.title}</p>
                                    <span className="text-xs text-gray-500 ml-auto">
                                        {item.tag === 'all' 
                                            ? galleryData.length 
                                            : item.tag === 'favorites'
                                            ? galleryData.filter(img => img.isFavorite).length
                                            : galleryData.filter(img => img.tags.includes(item.tag)).length
                                        }
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
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

                {/* Gallery Grid */}
                <div className="flex-1 p-6 bg-gray-50 flex flex-col">
                    <div className="flex-none">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">
                                {photosLinks.find(item => item.id === activeAlbum)?.title || 'Library'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {filteredImages.length} {filteredImages.length === 1 ? 'photo' : 'photos'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {filteredImages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <p className="text-lg font-medium">No photos found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {filteredImages.map((item) => (
                                <div
                                    key={item.id}
                                    className="group relative aspect-square cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-200"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleImageClick(item);
                                    }}
                                    onContextMenu={(e) => handleContextMenu(e, item)}
                                >
                                    <img
                                        src={item.img}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                    {/* Overlay with info */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                            <p className="font-medium text-sm truncate">{item.title}</p>
                                            <p className="text-xs text-gray-300">{item.date}</p>
                                        </div>
                                    </div>
                                    {/* Favorite indicator */}
                                    {item.isFavorite && (
                                        <div className="absolute top-2 right-2">
                                            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    </div>
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[180px]"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => toggleFavorite(contextMenu.image.id)}
                    >
                        <Heart className={clsx("w-4 h-4", contextMenu.image.isFavorite && "fill-red-500 text-red-500")} />
                        {contextMenu.image.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                    <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => openTagModal(contextMenu.image)}
                    >
                        <Tag className="w-4 h-4" />
                        Manage Tags
                    </button>
                    <hr className="my-1" />
                    <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => handleImageClick(contextMenu.image)}
                    >
                        Open
                    </button>
                </div>
            )}

            {/* Tag Management Modal */}
            {modalImage && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setShowTagModalId(null)}
                >
                    <div
                        className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Manage Tags</h3>
                            <button
                                onClick={() => setShowTagModalId(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{modalImage.title}</p>
                        <div className="space-y-2">
                            {photosLinks.filter(link => link.tag !== 'all' && link.tag !== 'favorites').map((album) => {
                                const hasTag = modalImage.tags.includes(album.tag);
                                return (
                                    <label
                                        key={album.id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={hasTag}
                                            onChange={() => toggleTag(modalImage.id, album.tag)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <img src={album.icon} className="w-5 h-5" alt={album.title} />
                                        <span className="text-sm font-medium">{album.title}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const PhotosWindow = WindowWrapper(Photos, "photos");
export default PhotosWindow;


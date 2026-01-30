import { INITIAL_Z_INDEX, WINDOW_CONFIG } from "#constants"
import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

const useWindowStore = create(immer((set) => ({
    // Merge default config with admin since we can't easily modify the constant import directly without a refactor
    // Ideally WINDOW_CONFIG should have included it, but we can patch it here or assume we updated the constant.
    // Let's modify the store initialization to include admin if it's missing in constants, 
    // BUT actually, I should just modify the constant file or the store initialization.
    // The previous file view showed WINDOW_CONFIG is imported. I should probably add it there.
    // Wait, I can't modify #constants/index.js easily if it's a huge list. 
    // I already have the WINDOW_CONFIG in the previous file.
    // Let's check where WINDOW_CONFIG is defined. It is in constants/index.js

    // I will use replace_file_content on constants/index.js instead to add the admin window config.
    // That is cleaner.

    windows: WINDOW_CONFIG,
    nextZIndex: INITIAL_Z_INDEX + 1,
    openWindow: (windowKey, data = null) => set((state) => {
        const win = state.windows[windowKey]
        if (!win) return;
        win.isOpen = true
        win.isMinimized = false
        win.zIndex = state.nextZIndex
        win.data = data ?? win.data
        state.nextZIndex++
    }),
    closeWindow: (windowKey, data = null) => set((state) => {
        const win = state.windows[windowKey]
        if (!win) return;
        win.isOpen = false
        win.isMinimized = false
        win.isMaximized = false
        win.zIndex = INITIAL_Z_INDEX
        win.data = null
    }),
    minimizeWindow: (windowKey) => set((state) => {
        const win = state.windows[windowKey]
        if (!win) return;
        win.isMinimized = true
    }),
    toggleMaximize: (windowKey) => set((state) => {
        const win = state.windows[windowKey]
        if (!win) return;
        win.isMaximized = !win.isMaximized
    }),
    setWindowSize: (windowKey, width, height) => set((state) => {
        const win = state.windows[windowKey]
        if (!win) return;
        if (width !== undefined) win.width = width
        if (height !== undefined) win.height = height
    }),
    focusWindow: (windowKey, data = null) => set((state) => {
        const win = state.windows[windowKey]
        if (!win) return;
        win.zIndex = state.nextZIndex++;
    }),

})))
export default useWindowStore
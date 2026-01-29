import { INITIAL_Z_INDEX, WINDOW_CONFIG } from "#constants"
import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

const useWindowStore = create(immer((set) => ({
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
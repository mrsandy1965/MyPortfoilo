const { locations } = require("#constants");
const { create } = require("zustand");
const DEFAULT_LOCATION = locations.work


const useLocationStore = create(immer((set)=>({
    activeLocation : DEFAULT_LOCATION,

    setActiveLocation:(location=null)=>set((state)=>{state.activeLocation = location}),

    resetAtiveLocation:()=>set((state)=>{state.activeLocation = DEFAULT_LOCATION})
})))

export default useLocationStore;
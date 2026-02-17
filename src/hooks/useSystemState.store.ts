
import {create} from "zustand";

interface SystemStore {
    colorMode: string;
    setColorMode: (state: string) => void
}

export const useSystemStore = create<SystemStore>((set) => ({
    colorMode: "dark",
    setColorMode: (state: string) => set({ colorMode: state })
}))
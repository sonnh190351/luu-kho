import type {JSX} from "react";

export interface TabItem {
    icon: JSX.Element,
    title: string,
    index: number
}

export interface TabGroup {
    name: string,
    items: TabItem[]
}

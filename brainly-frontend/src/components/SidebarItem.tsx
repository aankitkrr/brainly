import { ReactElement } from "react";

interface sidebarProps{
    text : string, 
    icon : ReactElement
}

export function SidebarItem({text , icon} : sidebarProps){
    return <div className="flex text-gray-600 py-2 cursor-pointer hover:bg-slate-100 rounded max-w-48 pl-4
    transition-all duration-150">
        <div className="pr-4">
        {icon}
        </div>
        <div>
        {text}
        </div>
    </div>
}
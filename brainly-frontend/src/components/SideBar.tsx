import { TwitterIcon } from "../icons/TwitterIcon"
import { YoutubeIcon } from "../icons/YoutubeIcon"
import { LogoIcon } from "../icons/Logo"
import { SidebarItem } from "./SidebarItem"
import { Button } from "./button"
import { useNavigate } from "react-router-dom"

export const SideBar = () => {
    const navigate = useNavigate();
    
    const logOut = async() => {
        localStorage.removeItem('token');
        navigate("/");
    }

    const redirect = async() => {
        navigate("/");
    }

    return <div className="h-screen bg-white w-60 fixed left-0 top-0 pl-4 flex flex-col ">
        <div className="flex text-2xl pt-8 items-center ">
            <div className="flex flex-wrap pl-3 p-1 hover:scale-110 transition-transform duration-300 ease-in-out hover:text-purple-700 cursor-pointer"  onClick={redirect} >
                <div className="pr-2 text-purple-600">
                    <LogoIcon size="xl" />
                </div>
                Brainly
            </div>
        </div>
        
        <div className="pt-8 pl-4 justify-center h-8/10 ">
            <SidebarItem text="Twitter" icon={<TwitterIcon size="lg"/>} />
            <SidebarItem text="Youtube" icon={<YoutubeIcon size="lg"/>} />
        </div>

        <div className="pl-15">
          <Button variant="primary" size="sm" text="sign out" onClick={logOut}/>  
        </div>
    </div>
}

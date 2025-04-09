import { useNavigate } from "react-router-dom"
import { Button } from "../components/button"
import { LogoIcon } from "../icons/Logo";

export const LandingPage = () => {
    const navigate = useNavigate();

    const signin = async() => {
        navigate("/signin")
    }
    const signup = async() => {
        navigate("/signup")
    }
    const redirect = async() => {
        const token = localStorage.getItem("token");
        if(token){
            navigate("/dashboard");
        }else{
            alert("sorry you are not signed In")
            navigate("/signin")
        }
    }


    return <>
        <div className=" bg-gray-800 text-white h-25 text-3xl justify-center items-center flex " >
            <div className="flex hover:scale-120 transition-transform duration-300 ease-in-out cursor-pointer hover:text-gray-200 ">
                <div className="text-purple-500">
                <LogoIcon  size = "xl"/>
                </div>
                <h1 className="pl-1" >
                    Brainly
                </h1>
            </div>
        </div>

        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-5 ">
            <div className= " flex absolute top-0 right-0 ">
                <div className="m-4 " >
                    <Button size = "lg" text = "Signin" variant ="secondary" onClick={signin} />
                </div>
                <div className= "m-4 ">
                    <Button size = "lg" text = "SignUp" variant ="secondary" onClick = {signup} />
                </div>
            </div>
            <div className= " text-center max-w-5xl text-3xl hover:scale-105 transition-all duration-200 ease-in-out hover:text-purple-300  ">
                Second Brain is a platform where you can store your instant thoughts of tweet links, Youtube Links, or any form of Texts
            </div>
            <div className= "absolute top-40 right-20">
                <p> Are you LoggedIn ?? </p>
                <p className="hover:scale-103 cursor-pointer hover:transition-all duration-200 ease-in-out hover:text-purple-300 " onClick={redirect}> Go to your dashboard </p>
            </div>

        </div>
    </>
}
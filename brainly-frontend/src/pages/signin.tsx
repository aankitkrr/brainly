import { useRef, useState } from "react";
import { Button } from "../components/button";
import { InputBox } from "../components/Input";
import axios from "axios";
import { Backend_URL } from "../config";
import { useNavigate } from "react-router-dom";

export function SignIn(){
    const navigate = useNavigate();
    const usernameRef = useRef<any>("");
    const passwordRef = useRef<any>("");
    const [error, setError] = useState<string | null>(null);

    const redirect = async () => {
        navigate("/signup");
    }

    async function signin(){
        const username = usernameRef.current.value;
        const password = passwordRef.current.value;
        try{
            const response = await axios.post(Backend_URL + "/api/v1/signin", {
                username,
                password
            })
            
            const jwttoken = response.data.token;
            localStorage.setItem("token", jwttoken);
            navigate("/dashboard");
        }catch(e : any){
            if(e.response.status == 403){
                setError(e.response.data.message);
            }
        }
    }

    return <div className="h-screen w-screen bg-gray-800 flex justify-center items-center">
        <div className="bg-white rounded shadow-2xl min-w-86 p-8">
            <InputBox reference = {usernameRef} placeholder="UserName"  />
            <InputBox reference={passwordRef} placeholder="Password" error = {error}/>
            <div onClick={signin} className="flex justify-center pt-2">
                <Button loading = {false} text = "Sign In" variant = "primary" size = "md" fullwidth = {true}/>
            </div>
            <div className="flex flex-box justify-center pt-3 text-sm ">
                <p>New User? </p>
                <p className="pl-2 underline hover:text-blue-600 cursor-pointer " onClick={redirect} > SignUp</p>
            </div>


        </div>
    </div>
}
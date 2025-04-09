import { useRef, useState } from "react";
import { Button } from "../components/button";
import { InputBox } from "../components/Input";
import axios from "axios";
import { Backend_URL } from "../config";
import { useNavigate } from "react-router-dom";

export function SignUp(){
    const usernameRef = useRef<any>("");
    const passwordRef = useRef<any>("");
    const navigate = useNavigate();
    const [error, setError] = useState<{ username?: string; password?: string }>({});

    const redirect = async () => {
        navigate("/signin");
    }

    async function signup(){
        const username = usernameRef.current.value;
        const password = passwordRef.current.value;
        try{
            await axios.post(Backend_URL + "/api/v1/signup", {
                username,
                password
            })
            navigate("/signin")
            alert("Signed Up successfully, Please sign In")
        }catch(e : any){
            if(e.response?.status === 400 && e.response.data.message){
                setError({
                    username : e.response?.data.message?.username?._errors?.[0],
                    password : e.response?.data.message?.password?._errors?.[0]
                })
            }else if(e.response.status == 411){
                setError({
                    username : "User already exists"
                })
            }else{
                setError({
                    username : "Something Went Wrong....!"
                })
            }
        }
    }

    return <div className="h-screen w-screen bg-gray-800 flex justify-center items-center">
        <div className="bg-white rounded shadow-2xl min-w-86 p-8">
            <InputBox reference = {usernameRef} placeholder="UserName" error = {error.username} />
            <InputBox  reference = {passwordRef} placeholder="Password" error = {error.password} />
            <div className="flex justify-center pt-4">
                <Button loading = {false} text = "Sign Up" variant = "primary" size = "md" fullwidth = {true} onClick={signup}/>
            </div>
            <div className="flex flex-box justify-center pt-3 text-sm ">
                <p>Existing User? </p>
                <p className="pl-2 underline hover:text-blue-600 cursor-pointer " onClick={redirect} > Signin</p>
            </div>

        </div>
    </div>
}
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom"
import { Backend_URL } from "../config";
import { useEffect, useState } from "react";
import { CardComponent } from "../components/Card";
import { LogoIcon } from "../icons/Logo";

export const SharedPage = () =>{
    const { shareLink } = useParams();
    const [content, setContents] = useState([]);

    useEffect(() => {
        const getPosts = async () => {
            try{
                const response =  await axios.get(`${Backend_URL}/api/v1/brain/${shareLink}`);
                response.data;
                setContents(response.data.content);
            }catch(e : any){
                console.log(e)
            }
        }

        getPosts();
    }, [shareLink]);

    const navigate = useNavigate();
    const redirect = async() => {
        navigate("/");
    }

    return <div className="min-h-screen  bg-gray-800">
        <div className=" text-white h-20 text-3xl flex justify-center items-center ">
            <div className=" flex flex-wrap hover: cursor-pointer p-1 hover:scale-110 transition-all ease-in-out duration-200 hover:text-gray-200 "  onClick={redirect}>
                <div className=" text-purple-500 ">
                <LogoIcon  size = "xl"/>
                </div>
                <h1 className="pl-1 " >
                    Brainly
                </h1>
            </div>
        </div>
        
        <div className=" bg-slate-800 w-full flex flex-wrap justify-evenly min-h-screen">
            {content.map(({type, title, link }) => 
                <div className="pl-4 pr-4 pt-4 pb-5 hover:scale-101 transition-all ease-in-out duration-200 hover:text-gray-900  ">
                    <CardComponent type = {type} link = {link} title = {title} cardVariant = "sharedpage" />
                </div>
            )}
        </div>
    </div>
}
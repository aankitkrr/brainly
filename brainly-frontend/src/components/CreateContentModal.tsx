import { useRef, useState } from "react";
import { CrossIcon } from "../icons/CrossIcon"
import { InputBox } from "./Input"
import { Button } from "./button"
import axios from "axios";
import { Backend_URL } from "../config";

interface contentProps{
    open : any;
    onClose : any;
    onCreatedContent : () => void;
}

//controlled component - onclick onclose will be called in dashboard.tsx and from there open will be set to false and open is used here to render the contentModal
enum ContentType{
    Youtube = "youtube",
    Twitter = "twitter"
}

export const CreateContentModal = ({open, onClose, onCreatedContent} : contentProps) => {

    const titleRef = useRef<HTMLInputElement>(null);
    const linkRef = useRef<HTMLInputElement>(null);
    const [type, setType] = useState(ContentType.Youtube);

    async function addContent() {
        const title = titleRef.current?.value;
        const link = linkRef.current?.value;

        await axios.post(`${Backend_URL}/api/v1/content` , { link, type, title } , {
            headers : {
                "Authorization" : localStorage.getItem("token")
            }
        })
        
        onCreatedContent()
        onClose();
    }

    return <>
        {open && <div>
            <div className="w-screen h-screen bg-slate-500 opacity-70 fixed top-0 left-0 flex justify-center"></div>

            <div className="w-screen h-screen fixed top-0 left-0 flex justify-center">
                <div className="flex justify-center flex-col w-100">
                    <span className="bg-white rounded opacity-100 p-4">
                        <div className="flex justify-end">
                            <div onClick={onClose} className="cursor-pointer" >
                                <CrossIcon size = "md"/>
                            </div>
                        </div>
                        <div>
                            <InputBox reference = {titleRef} placeholder = {"Title"}/>
                            <InputBox reference = {linkRef} placeholder = {"Link"}/>
                        </div>
                        <div className="flex p-2 justify-around items-center">
                            <h1> Type  </h1>
                            <Button text = "Youtube" 
                                size = "md" 
                                variant = {type === ContentType.Youtube ? "primary" : "secondary"} 
                                onClick={ () =>{
                                    setType(ContentType.Youtube)
                                }
                            }/>

                            <Button text = " Twitter " 
                                size = "md" 
                                variant = {type === ContentType.Twitter ? "primary" : "secondary"} 
                                onClick={ () =>{
                                    setType(ContentType.Twitter)
                                }}
                            />
                        </div>

                        <div className="flex justify-center">
                            <Button onClick={addContent} variant="primary" size = "md" text = "Submit" />
                        </div>

                    </span>
                </div>
            </div>
        </div>}

    </>
}
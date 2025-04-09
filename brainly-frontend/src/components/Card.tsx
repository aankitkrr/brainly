import { CrossIcon } from "../icons/CrossIcon";
import { LinkIcon } from "../icons/LinkIcon";

interface cardProps{
    cardVariant : "dashboard" | "sharedpage"
    title : string;
    link : string;
    type : "twitter" | "youtube";
    onDelete ?: (id : string) => void
    id ?: string;
}

export const CardComponent = ({title, link, type, cardVariant, onDelete, id} : cardProps) => {

    async function handleDelete() {
        onDelete && id && onDelete(id);
      }

    return <>
        <div className="p-4 bg-gray-100 rounded-md border-gray-200 min-h-52 min-w-82 max-w-82 border shadow-md flex flex-col items-start self-start ">
            <div className="flex justify-between w-full ">
                <div className="flex items-center text-md justify-center">
                    <div className="text-gray-500 pr-2 hover:cursor-pointer">
                        <a href={link} target="_blank">
                            <LinkIcon size = "lg"/>
                        </a>
                    </div>
                    {title}
                </div>
                {cardVariant === "dashboard" && <div className="flex items-center">
                    <div className="text-gray-500 hover: cursor-pointer " onClick = {handleDelete} >
                        <CrossIcon size = "lg" />
                    </div>
                </div>}
            </div>
                <div className="pt-4 w-full">
                    {type === "youtube" && <iframe className ="w-full" src={link?.replace("watch", "embed").replace("?v=", "/").replace("youtu.be", "www.youtube.com")} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> }
                    
                    {type === "twitter" && ( 
                        <div className="max-h-[400px] overflow-auto w-full">
                        <blockquote className="twitter-tweet bg-white p-4 rounded-lg">
                        <a href={link.replace("x.com", "twitter.com")}></a> 
                        </blockquote> 
                        </div>
                )}
            </div>
        </div>
    </>
}
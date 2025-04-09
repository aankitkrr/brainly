import '../App.css'
import { Button } from '../components/button'
import { CardComponent } from '../components/Card'
import { PlusIcon } from '../icons/PlusIcon'
import { ShareIcon } from '../icons/ShareIcon'
import { CreateContentModal } from '../components/CreateContentModal'
import { useEffect, useState } from "react"
import { SideBar } from '../components/SideBar'
import { Backend_URL } from '../config'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [contents, setContents] = useState<any[]>([]);
  
  
  useEffect(() => {
    const loggedIn = localStorage.getItem('token');
    if (!loggedIn) {
      navigate("/signin");
    }
      fetchContents();

  }, [navigate]);

  
  const fetchContents = async () => {
    try {
      const response = await axios.get(`${Backend_URL}/api/v1/content`, {
        headers: {
          "Authorization": localStorage.getItem("token")
        }
      });
      setContents(response.data.content);
    } catch (e: any) {
      console.log(e.response);
    }
  };

  
  const copyToClipboard = async (text : string) => {
    try{
      await navigator.clipboard.writeText(text);
      alert("Link Copied to ClipBoard :) ");
    }catch(e : any){
      console.log(e.format());
      alert("Failed :(")
    }
  }


  const handleDeleteContent = async (id: string) => {
    setContents(prevContents => prevContents.filter(content => content._id !== id));
    try {
      await axios.delete(`${Backend_URL}/api/v1/content/${id}`, {
        headers: {
          "Authorization": localStorage.getItem("token"),
        },
      });
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("Failed to delete");
      fetchContents();
    }
  };


  return(
    <div>
      <SideBar />

      <div className='p-4 ml-60 min-h-screen bg-gray-800 border-l-2'>
        <CreateContentModal open = {modalOpen} 
        onClose={() => {
          setModalOpen(false)
        }} 
        onCreatedContent = {fetchContents}
        />

        <div className='flex justify-end mb-4'>
          <Button onClick = {() => { setModalOpen(true) }} 
            startIcon= {<PlusIcon size = "md"/>}
            size = "md" 
            variant = "primary" 
            text = "Add Content"
           />

          <Button size = "md" 
          variant = "secondary" 
          text = "Share Brain" 
          endIcon={<ShareIcon size = "md" />}
          onClick = {async () =>{
              const response = await axios.post(`${Backend_URL}/api/v1/brain/share`, {
                share : true
              }, {
                headers : {
                  Authorization : localStorage.getItem("token")
                }
              });
              const shareUrl = `http://localhost:5173/share/${response.data.hash}`;
              await copyToClipboard(shareUrl);
            }}
          />

        </div>
          <div className="flex gap-4 max-w-full flex-wrap justify-evenly items-start self-start p-6  ">
            {contents.map(({type, title, link, _id}) => 

              <div key={_id} className=" hover:scale-102 transition-all ease-in-out duration-200 hover:text-gray-900 rounded-lg pb-2 " >
                <CardComponent type = {type} 
                link = {link} 
                title = {title} 
                cardVariant = "dashboard" 
                onDelete={handleDeleteContent}
                id = {_id}
                />
              </div>

            )}
        </div>
      </div>
    </div>
  )
}

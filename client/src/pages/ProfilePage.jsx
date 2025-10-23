import React, { useState } from 'react'
import {useNavigate} from 'react-router-dom'
import assets from '../assets/assets';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const ProfilePage = () => {

  const {authUser, updateProfile} = useContext(AuthContext)     //authUser: the current logged-in user info, Function to updates profile

  const [selectedImg, setSelectedImg] = useState(null)

  //Redirects user back to home page after saving.
  const navigate =  useNavigate();

  const [name, setName] = useState(authUser.fullName)
  const [bio, setBio] = useState(authUser.bio)

  const handleSubmit = async (e)=>{

    //Stops the page from refreshing when form is submitted.
    e.preventDefault();

    //Checks if the user didn’t choose a new image. if not only update text fields
    if(!selectedImg){
      await updateProfile({fullName: name, bio});
      navigate('/')
      return;
    }

    //Creates a browser file reader
    const reader = new FileReader();
    //Converts the selected image into a Base64 string.
    reader.readAsDataURL(selectedImg);

    //Waits until file is read completely.
    reader.onload = async ()=>{
      const base64Image = reader.result;          //Stores the Base64 string of the image.
      await updateProfile({profilePic: base64Image, fullName: name, bio})           //Sends image + updated info to backend.
      navigate('/');
      return;
    }
  }

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className='text-lg'>Profile details</h3>
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input onChange={(e)=>setSelectedImg(e.target.files[0])} type="file" name="" id="avatar" accept='.png, .jpg, .jpeg' hidden/>
            <img src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon} alt="" className={`w-12 h-12 ${selectedImg && 'rounded-full'}`}/>
            upload profile image
          </label>
          <input onChange={(e)=>setName(e.target.value)} value={name} type="text" required placeholder='Your name' className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500' />
          <textarea onChange={(e)=>setBio(e.target.value)} value={bio} placeholder='Write profile bio' required className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" rows={4}></textarea>
          
          <button type='submit' className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer">Save</button>
        </form>
        <img className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImg && 'rounded-full'}`} src={authUser?.profilePic || assets.logo_icon} alt="" />
      </div>
    </div>
  )
}

export default ProfilePage
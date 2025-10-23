import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import {Toaster} from "react-hot-toast"
import { AuthContext } from '../context/AuthContext'

const App = () => {
  const { authUser } = useContext(AuthContext)
  return (
    <div className="min-h-screen w-full bg-[url('/bgImage.svg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Adds toast notifications globally */}
      <Toaster/>

      {/* <Routes> with <Route> Handles all navigation pages */}
      <Routes>
        <Route path='/' element={authUser ? <HomePage/> : <Navigate to="/login"/>}/>  {/* Protects from unauthorized access */}
        <Route path='/login' element={!authUser ? <LoginPage/> :  <Navigate to="/"/>}/> {/* Prevents logged-in users from seeing login again */}
        <Route path='/profile' element={authUser ? <ProfilePage/> : <Navigate to="/login"/>}/>  {/* Protects from unauthorized access */}
      </Routes>
    </div>
  )
}

export default App
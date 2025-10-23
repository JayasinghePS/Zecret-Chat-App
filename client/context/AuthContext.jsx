import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import toast from "react-hot-toast"; //showing success/error messages as small popup notifications
import { io } from "socket.io-client"

const backendURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendURL;

export const AuthContext = createContext();

export const AuthProvider = ({ children })=>{

    const [token, setToken] = useState(localStorage.getItem("token"))
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    // Check if user is authenticated and if so, set the user data and connect the socket
    const checkAuth = async ()=>{
        try {
            //verify if the saved token is valid.
           const {data} = await axios.get("/api/auth/check");
           if (data.success) {
            setAuthUser(data.user) //so app knows the user is logged in
            connectSocket(data.user) //open a live connection to the backend
           }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Login function to handle user authentication and socket connection
    const login = async (state, credentials)=>{    //Triggered when user submits the login/register
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials); //Calls backend with credentials and receives user info + JWT token
            if (data.success){
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token; //all future API calls include the token automatically
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Logout function to handle user logout and socket disconnection
    const logout = async () => {
        //Removes everything related to the user from React state and browser storage
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out successfully")
        socket.disconnect();
    }

    // Update profile funstion to handle user profile updates
    const updateProfile = async (body)=>{
        try {
            const {data} = await axios.put("/api/auth/update-profile", body);           //just send data as PUT request with updated data
            if(data.success){
                setAuthUser(data.user);
                toast.success("Profile updated successfully")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Connect socket function to handle socket connection and online users updates
    const connectSocket = (userData)=>{
        if(!userData || socket?.connected) return;
        const newSocket = io(backendURL, {
            query: {
                userId: userData._id,                   //Sends the logged-in userId as a query
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds)=>{
            setOnlineUsers(userIds);                    //When backend emits "getOnlineUsers" event, updates the onlineUsers list.
        })
    }

    useEffect(()=>{                                                 //Runs only once when app loads
        if(token){
            axios.defaults.headers.common["token"] = token;         //If a token exists, adds it to axios headers
        }
        checkAuth();
    },[])

    const value = {    //value given in <AuthContext.Provider value={value}>
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }

    //Provides all data and functions (authUser, login, logout, socket, etc.) to the rest of your app
    return (
        <AuthContext.Provider value={value}>
            {children}                                  
        </AuthContext.Provider>
    )
}
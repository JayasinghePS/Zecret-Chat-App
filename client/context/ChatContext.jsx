import { useContext } from "react";
import { useState } from "react";
import { createContext } from "react";
import { AuthContext } from "./AuthContext";
import { useEffect } from "react";


export const ChatContext = createContext();

export const ChatProvider = ({children})=>{

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const {socket, axios} = useContext(AuthContext);

    // function to get all users for sidebar
    const getUsers = async ()=>{
        try {
            //When chat UI loads, this fetches all users
            const {data} = await axios.get("/api/messages/users");
            if (data.success){
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)      //Also loads any unseen message counts
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // function to get messages for selected user
    const getMessages = async (userId)=>{
        try {
            //Fetches full chat history with a specific user (from DB)
            const {data} = await axios.get(`/api/messages/${userId}`);
            if (data.success){
                setMessages(data.messages)                  //triggers React to re-render the chat window
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // function to send message to selected user
    const sendMessage = async (messageData)=>{
        try {
            //Sends a message via HTTP to backend
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData)
            if(data.success){
                setMessages((prevMessages)=>[...prevMessages, data.newMessage])
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // function to subscribe to messages for selected user
    const subscribeToMessages = async () =>{
        if(!socket) return;

        //Listens for incoming real-time messages on this socket
        socket.on("newMessage", (newMessage)=>{

            //If the current open chat is with that sender
            if(selectedUser && newMessage.senderId === selectedUser._id){

                //Immediately appends message to chat. Calls backend to mark it “seen”
                newMessage.seen = true;
                setMessages((prevMessages)=> [...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }
            //If you’re chatting with someone else
            else{

                //Increments unseen count for that sender
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages, [newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 :1
                }))
            }
        })
    }

    // function to unsubscribe frommessages
    const unsubscribeFromMessages = ()=>{
        if(socket) socket.off("newMessage");
    }

    useEffect(()=>{
        subscribeToMessages();          //Subscribes again to message events
        return ()=> unsubscribeFromMessages();          //removes old socket listener to prevent duplicates
    },[socket, selectedUser])       //Every time socket or selectedUser changes

    const value = {
        messages, users, selectedUser, getUsers, getMessages, sendMessage, setSelectedUser, unseenMessages, setUnseenMessages
    }

    //Provides all chat data (messages, users, etc.) to the rest of the app
    return( 
    <ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>
    )
}
import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const socket = io(API_BASE_URL, {
    autoConnect: false,
    withCredentials: true,
});

export const connectSocket = (userObj) => {
    if (!socket.connected) {
        socket.connect();
    }
    
    // Join relevant rooms based on user object
    if (userObj) {
        socket.emit("join_room", `user_${userObj._id}`);
        socket.emit("join_room", `role_${userObj.role}`);
        
        if (userObj.locality) {
            socket.emit("join_room", `${userObj.role}_${userObj.locality}`);
        }
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

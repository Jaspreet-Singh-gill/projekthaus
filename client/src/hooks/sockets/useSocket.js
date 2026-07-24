import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../../store/authStore.js";

let socket = null;
const useSocket = () => {
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    if (user && !socket) {
      const socketUrl = import.meta.env.VITE_API_BASE_URL
        ? new URL(import.meta.env.VITE_API_BASE_URL).origin
        : "http://localhost:8000";

      socket = io(socketUrl, {
        withCredentials: true,
      });

      socket.on("connect", () => {
        setIsConnected(true);
        const userId = user._id;
        if (userId) {
          socket.emit("join_user_room", userId);
        }
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });
    }
    if (!user && socket) {
      socket.disconnect();
      socket = null;
      setIsConnected(false);
    }
  }, [user]);

  return { socket, isConnected };
};

export default useSocket;

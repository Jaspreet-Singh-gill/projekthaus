import dotenv from "dotenv";
import app from "./app/app.js";
import { connectDB } from "./db/database.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT;

const httpServer = http.createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(","),
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  socket.on("join_project_room", (projectId) => {
    socket.join(`project_${projectId}`);
    console.log(`Socket ${socket.id} joined project room project_${projectId}`);
  });

  socket.on("leave_project_room", (projectId) => {
    socket.leave(`project_${projectId}`);
    console.log(`Socket ${socket.id} left project room project_${projectId}`);
  });
  
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

connectDB()
  .then(() => {
    httpServer.listen(PORT || 3000, () => {
      console.log(`The server is listning at the port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(
      "An error has occured while connecting to the database ",
      error,
    );
    process.exit(1);
  });

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from './routes/message.route.js';
import userRoutes from "./routes/user.route.js";
import { JWT_SECRET, PORT } from "./db/env.js";
import { connectDB } from "./db/db.js";
import cookieParser from "cookie-parser";
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getOrCreatePrivateConversation, saveMessage, updateLastMessage } from "./services/message.service.js";

const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

}));
app.use(cookieParser());
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://chatapp-snowy-psi.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }

});

io.use((socket, next) => {
  try {
    const cookieHeader = socket.request.headers.cookie;
    if (!cookieHeader) {
      return next(new Error("No cookies"));
    }

    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map(c => c.split("="))
    );

    const token = cookies.token;
    if (!token) {
      return next(new Error("No token"));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;

    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
})

io.on("connection", (socket) => {
  console.log("Client connected", socket.userId);
  socket.join(socket.userId);
  socket.on("message", async (msg) => {

    const conversation = await getOrCreatePrivateConversation(msg.recieverId, socket.userId);

    if (msg.type === "text") {
      const message = await saveMessage(msg, conversation, socket);
      await updateLastMessage(message);
    };

    io.to(msg.recieverId).emit("recieve-message", {
      conversationId: conversation._id,
      senderId: socket.userId,
      type: msg.type,
      content: msg.content,
      createdAt: new Date(),
    });
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes)
app.use("/api/message", messageRoutes)



server.listen(PORT, () => {
  console.log("server is running on", PORT);
  connectDB();
});

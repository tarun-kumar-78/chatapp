import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from './routes/message.route.js';
import userRoutes from "./routes/user.route.js";
import { CLIENT_ID, CLIENT_SECRET, JWT_SECRET, PORT } from "./db/env.js";
import { connectDB } from "./db/db.js";
import cookieParser from "cookie-parser";
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getOrCreatePrivateConversation, saveMessage, updateLastMessage } from "./services/message.service.js";
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import session from 'express-session';
import generateToken from "./utils/generateToken.js";
import { createNewUser, getUserByEmail } from "./services/user.service.js";

const app = express();
app.use(session({
  secret: CLIENT_SECRET,
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  // console.log(profile);
  return done(null, profile);
}))

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google Redirect Callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  async (req, res) => {
    // Successful authentication, redirect to frontend/dashboard
    const userExist = await getUserByEmail(req.user.emails[0].value);
    if (userExist) {
      generateToken(userExist.id, res);
    } else {
      await createNewUser({ name: req.user.displayName, email: req.user.emails[0].value, authType: "Google" })
    }
    res.redirect("http://localhost:5173/")
  }
);

// Logout
app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:5173/login');
  });
});

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173", "https://chatapp-snowy-psi.vercel.app"],
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

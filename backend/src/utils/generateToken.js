import jwt from "jsonwebtoken";
import { JWT_SECRET, NODE_ENV } from "../db/env.js";

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
  res.cookie("token", token, {
    httpOnly: true, // Prevents JavaScript from accessing the cookie
    secure: true, // The cookie is sent only over HTTPS.
    sameSite: "none",
    maxAge: 60 * 60 * 1000, // cookie expiration time
  });
};

export default generateToken;
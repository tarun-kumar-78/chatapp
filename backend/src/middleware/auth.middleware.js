import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../db/env.js';
import { User } from '../models/user.model.js';

export const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token)
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded)
            return res.status(400).json({ message: "Invalid Token Provided" });
        const user = await User.findById(decoded.userId).select("-password");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        req.user = user;
        next();
    } catch (err) {
        console.log("Error in protected route middleware", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
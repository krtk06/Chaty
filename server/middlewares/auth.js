import jwt from 'jsonwebtoken'
import User from '../models/user.js';


export const protect = async (req,res,next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({success: false, message: "Not authorized, no token"})
    }
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const userId = decoded.id;

        const user = await User.findById(userId)

        if(!user){
            return res.json({success: false, message: "Not authorized, user not found"});
        }

        req.user = user;
        next()
    } catch (error) {
        res.status(401).json({success: false, message: "Not authorized, token failed"})

    }
}
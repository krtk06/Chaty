import User from "../models/user.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import Chat from "../models/Chat.js";

const generateToken = (id) =>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn: '30d'
    })
}

export const registerUser = async (req,res) =>{
    const {name,email,password} = req.body;

    try{
        const userExists = await User.findOne({email})

        if(userExists){
            return res.json({success :false,message: "User lready exists"})
        }

        const user = await User.create({name,email,password})

        const token = generateToken(user._id)

        res.json({success:true, token})
    } catch(error){
        return res.json({success: false, message: error.message})
    }
}



export const loginUser = async (req,res) =>{
    const {email,password} = req.body;

    try {
        const user = await User.findOne({email})
        if(user){
            const isMatch = await bcrypt.compare(password,user.password)

            if(isMatch){
                const token = generateToken(user._id);
                return res.json({success:true, token})
            }
        }

        return res.json({success: false, message: "Invalid email or password"})

    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}



export const getUser = async (req,res) =>{

    try {
        const user = req.user;
        return res.json({success: true, user})

    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}



export const updateUser = async (req, res) => {
    const { name, email, currentPassword, newPassword, avatar } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (name) user.name = name;
        if (email) {
            const existing = await User.findOne({ email, _id: { $ne: user._id } });
            if (existing) {
                return res.json({ success: false, message: "Email already in use" });
            }
            user.email = email;
        }
        if (avatar) user.avatar = avatar;

        if (newPassword) {
            if (!currentPassword) {
                return res.json({ success: false, message: "Current password is required" });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.json({ success: false, message: "Current password is incorrect" });
            }
            user.password = newPassword;
        }

        await user.save();

        return res.json({ success: true, message: "Profile updated successfully", user });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const getPublishedImages = async (req,res) => {
    try {
        const publishedImageMessages = await Chat.aggregate([
            {$unwind: "$messages"},
            {
                $match: {
                    "messages.isImage": true,
                    "messages.isPublished": true
                }
            },
            {
                $project: {
                    _id:0,
                    imageUrl: "$messages.content",
                    userName: "$userName",
                }
            }
        ])
        res.json({success: true, images:publishedImageMessages})

    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}
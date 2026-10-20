import User from "../models/user.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import Chat from "../models/Chat.js";
import ImageKit from "imagekit";
import { OAuth2Client } from 'google-auth-library';

const generateToken = (id) =>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn: '30d'
    })
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const registerUser = async (req,res) =>{
    const name = String(req.body.name || '').trim()
    const email = String(req.body.email || '').toLowerCase().trim()
    const password = String(req.body.password || '')

    try{
        if(!name || !email || !password){
            return res.json({ success: false, message: "Name, email and password are required" })
        }
        if(!EMAIL_RE.test(email)){
            return res.json({ success: false, message: "Please enter a valid email address" })
        }
        if(password.length < 8){
            return res.json({ success: false, message: "Password must be at least 8 characters" })
        }

        const userExists = await User.findOne({email})

        if(userExists){
            return res.json({success :false,message: "User already exists"})
        }

        const user = await User.create({name,email,password})

        const token = generateToken(user._id)

        return res.json({success:true, token})
    } catch(error){
        return res.json({success: false, message: error.message})
    }
}



export const loginUser = async (req,res) =>{
    const email = String(req.body.email || '').toLowerCase().trim()
    const password = String(req.body.password || '')

    try {
        if(!email || !password){
            return res.json({ success: false, message: "Email and password are required" })
        }

        const user = await User.findOne({email})
        if(!user || !user.password){
            return res.json({success: false, message: "Invalid email or password"})
        }

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.json({success: false, message: "Invalid email or password"})
        }

        const token = generateToken(user._id)
        return res.json({success:true, token})

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

const findOrCreateSocialUser = async ({ email, name, provider, providerId }) => {
    const normalizedEmail = String(email || '').toLowerCase().trim()
    const idField = provider === 'google' ? 'googleId' : 'appleId'

    // Look up by provider id first: Apple only includes the email in the
    // token on first authorization, so returning users have no email.
    let user = providerId ? await User.findOne({ [idField]: providerId }) : null
    if (!user) user = await User.findOne({ email: normalizedEmail })

    if (!user) {
        if (!normalizedEmail) throw new Error('No email returned by provider')
        user = await User.create({
            name: name || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            password: crypto.randomBytes(32).toString('hex'),
            authProvider: provider,
            ...(providerId ? { [idField]: providerId } : {}),
        })
    } else if (providerId && !user[idField]) {
        user[idField] = providerId
        if (user.authProvider === 'email') user.authProvider = provider
        await user.save()
    }
    return user
}

export const googleLogin = async (req, res) => {
    try {
        const { idToken, accessToken } = req.body
        if (accessToken) {
            const { default: axios } = await import('axios')
            const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            if (!profile?.email || profile.email_verified === false) {
                return res.json({ success: false, message: 'Google email not verified' })
            }
            const user = await findOrCreateSocialUser({
                email: profile.email,
                name: profile.name,
                provider: 'google',
                providerId: profile.sub,
            })
            return res.json({ success: true, token: generateToken(user._id) })
        }
        if (!idToken) return res.json({ success: false, message: 'Missing Google credential' })
        const clientId = process.env.GOOGLE_CLIENT_ID
        if (!clientId) return res.json({ success: false, message: 'Google sign-in is not configured (GOOGLE_CLIENT_ID missing)' })
        const client = new OAuth2Client(clientId)
        const ticket = await client.verifyIdToken({ idToken, audience: clientId })
        const payload = ticket.getPayload()
        if (!payload?.email || payload.email_verified === false) {
            return res.json({ success: false, message: 'Google email not verified' })
        }
        const user = await findOrCreateSocialUser({
            email: payload.email,
            name: payload.name,
            provider: 'google',
            providerId: payload.sub,
        })
        return res.json({ success: true, token: generateToken(user._id) })
    } catch (error) {
        return res.json({ success: false, message: error.message || 'Google sign-in failed' })
    }
}

let appleKeysCache = null
let appleKeysFetchedAt = 0
const getAppleKeys = async () => {
    const now = Date.now()
    if (appleKeysCache && now - appleKeysFetchedAt < 1000 * 60 * 60) return appleKeysCache
    const { default: axios } = await import('axios')
    const { data } = await axios.get('https://appleid.apple.com/auth/keys')
    appleKeysCache = data.keys
    appleKeysFetchedAt = now
    return appleKeysCache
}

export const appleLogin = async (req, res) => {
    try {
        const { idToken, user: appleUser } = req.body
        if (!idToken) return res.json({ success: false, message: 'Missing Apple credential' })
        const clientId = process.env.APPLE_CLIENT_ID
        if (!clientId) return res.json({ success: false, message: 'Apple sign-in is not configured (APPLE_CLIENT_ID missing)' })
        const decoded = jwt.decode(idToken, { complete: true })
        if (!decoded?.header?.kid) return res.json({ success: false, message: 'Invalid Apple token' })
        const keys = await getAppleKeys()
        const key = keys.find(k => k.kid === decoded.header.kid)
        if (!key) return res.json({ success: false, message: 'Unknown Apple signing key' })
        const publicKey = crypto.createPublicKey({ key, format: 'jwk' })
        const payload = jwt.verify(idToken, publicKey.export({ format: 'pem', type: 'spki' }), {
            algorithms: ['RS256'],
            issuer: 'https://appleid.apple.com',
            audience: clientId,
        })
        const email = payload.email || appleUser?.email
        const user = await findOrCreateSocialUser({
            email,
            name: appleUser?.name || payload.email?.split('@')[0],
            provider: 'apple',
            providerId: payload.sub,
        })
        return res.json({ success: true, token: generateToken(user._id) })
    } catch (error) {
        return res.json({ success: false, message: error.message || 'Apple sign-in failed' })
    }
}

export const updateUser = async (req, res) => {
    try {
        const user = req.user
        const { name, email, avatar, password, currentPassword } = req.body

        if (name !== undefined) {
            const trimmedName = String(name).trim()
            if (!trimmedName) return res.json({ success: false, message: 'Name cannot be empty' })
            user.name = trimmedName
        }

        if (email !== undefined) {
            const normalizedEmail = String(email).toLowerCase().trim()
            if (!EMAIL_RE.test(normalizedEmail)) {
                return res.json({ success: false, message: 'Please enter a valid email address' })
            }
            if (normalizedEmail !== user.email) {
                const emailTaken = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } })
                if (emailTaken) return res.json({ success: false, message: 'That email is already in use' })
                user.email = normalizedEmail
            }
        }

        if (avatar !== undefined) {
            user.avatar = String(avatar).trim()
        }

        if (password) {
            if (String(password).length < 8) {
                return res.json({ success: false, message: 'Password must be at least 8 characters' })
            }
            if (!currentPassword) {
                return res.json({ success: false, message: 'Enter your current password to change it' })
            }
            const isMatch = await bcrypt.compare(String(currentPassword), user.password || '')
            if (!isMatch) {
                return res.json({ success: false, message: 'Current password is incorrect' })
            }
            user.password = String(password)
        }

        await user.save()
        return res.json({ success: true, user })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
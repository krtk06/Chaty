import Chat from "../models/Chat.js"
import User from "../models/user.js"
import imagekit from "../configs/imageKit.js"
import openai from "../configs/openai.js"
import { parseDocument } from "../utils/documentParser.js"
import { generateImage, ImageProviderError } from "../utils/imageProviders.js"

const TEXT_COST = 1
const IMAGE_COST = 2
const DOCUMENT_COST = 2

const NOT_ENOUGH_CREDITS = { success: false, message: "You don't have enough credits to use this feature" }

const NETWORK_CODES = new Set([
    'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENETUNREACH', 'EHOSTUNREACH',
    'EAI_AGAIN', 'ENOTFOUND', 'EPIPE', 'ECONNABORTED',
])

const NETWORK_PATTERN = /ETIMEDOUT|ENETUNREACH|ECONNRESET|ECONNREFUSED|EAI_AGAIN|socket hang up|fetch failed|connection error|network error|timeout/i

// Turn scrappy network/SDK errors into a short, user-safe message.
const toUserMessage = (error, service = 'AI service') => {
    const code = error?.code || error?.cause?.code
    const text = String(error?.message || '')
    if (NETWORK_CODES.has(code) || NETWORK_PATTERN.test(text)) {
        return `Could not reach the ${service}. Please check your connection and try again.`
    }
    if (!text || text.length > 240) {
        return 'Something went wrong. Please try again.'
    }
    return text
}

// Atomically reserve credits before doing expensive work.
// Returns the updated user, or null when the balance is too low.
const spendCredits = async (userId, cost) => {
    return User.findOneAndUpdate(
        { _id: userId, credits: { $gte: cost } },
        { $inc: { credits: -cost } },
        { new: true }
    )
}

const refundCredits = async (userId, cost) => {
    try {
        await User.updateOne({ _id: userId }, { $inc: { credits: cost } })
    } catch (error) {
        console.error('Failed to refund credits:', error.message)
    }
}

// Build the model conversation from the full stored chat history.
// Image replies are included as text markers (the gateway may not accept
// remote image URLs as vision input).
const buildConversation = (messages) => (messages || []).map((message) => {
    if (message.isImage) {
        return { role: message.role, content: `[Generated image: ${message.content}]` }
    }
    if (message.isDocument) {
        return {
            role: message.role,
            content: `${message.content}${message.fileName ? ` (document: ${message.fileName})` : ''}`,
        }
    }
    return { role: message.role, content: message.content }
})

const assistantReply = (choices) => ({
    role: choices?.[0]?.message?.role || 'assistant',
    content: choices?.[0]?.message?.content || '',
    timestamp: Date.now(),
    isImage: false,
    isPublished: false,
})

// OpenCode Go routes requests by a stable session id; scope it to the chat.
const modelOptions = (chatId) => ({
    headers: { 'x-opencode-session': String(chatId) },
})

export const textMessageController = async(req,res) =>{
    const userId = req.user._id

    try {
        const prompt = String(req.body.prompt || '').trim()
        const { chatId } = req.body

        if(!prompt){
            return res.json({ success: false, message: "Prompt is required" })
        }

        const chat = await Chat.findOne({userId, _id:chatId})
        if(!chat){
            return res.json({ success: false, message: "Chat not found" })
        }

        const user = await spendCredits(userId, TEXT_COST)
        if(!user){
            return res.json(NOT_ENOUGH_CREDITS)
        }

        try {
            const {choices} = await openai.chat.completions.create({
                model: "mimo-v2.5",
                messages: [
                    ...buildConversation(chat.messages),
                    { role: "user", content: prompt },
                ],
            }, modelOptions(chatId));

            const reply = assistantReply(choices)

            chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false, isPublished: false })
            chat.messages.push(reply)
            await chat.save()

            return res.json({success:true, reply, credits: user.credits})
        } catch (error) {
            await refundCredits(userId, TEXT_COST)
            throw error
        }

    } catch (error) {
        return res.json({success:false,message:toUserMessage(error)})
    }
}



export const imageMessageController = async (req,res) =>{
    const userId = req.user._id;

    try {
        const prompt = String(req.body.prompt || '').trim()
        const { chatId } = req.body
        const isPublished = Boolean(req.body.isPublished ?? req.body.isPublic)

        if(!prompt){
            return res.json({ success: false, message: "Prompt is required" })
        }

        const chat = await Chat.findOne({userId,_id:chatId})
        if(!chat){
            return res.json({ success: false, message: "Chat not found" })
        }

        const user = await spendCredits(userId, IMAGE_COST)
        if(!user){
            return res.json(NOT_ENOUGH_CREDITS)
        }

        try {
            // Providers are tried in order (see utils/imageProviders.js); each one
            // can run out of quota on its own, so we fall through automatically.
            const generated = await generateImage(prompt)

            // Host the result on ImageKit so the URL is permanent and CDN served.
            const extension = (generated.mimeType || 'image/png').split('/')[1] || 'png'
            let imageUrl
            try {
                const uploadResponse = await imagekit.upload({
                    file: generated.buffer,
                    fileName: `${Date.now()}.${extension}`,
                    folder: "Chaty"
                })
                imageUrl = uploadResponse.url
            } catch (uploadError) {
                // Hosting failed but the image exists - keep it inline rather
                // than throwing the generation away.
                console.error('[image] ImageKit upload failed, storing inline:', uploadError.message)
                imageUrl = `data:${generated.mimeType || 'image/png'};base64,${generated.buffer.toString('base64')}`
            }

            const reply = {
                role: 'assistant',
                content: imageUrl,
                timestamp:Date.now(),
                isImage:true,
                isPublished
            }

            chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false, isPublished: false })
            chat.messages.push(reply)
            await chat.save()

            return res.json({success:true,reply, credits: user.credits, provider: generated.provider})
        } catch (error) {
            await refundCredits(userId, IMAGE_COST)
            if (error instanceof ImageProviderError) {
                return res.json({
                    success: false,
                    message: error.quota
                        ? "Image generation is unavailable right now - every configured image provider has reached its generation limit. Check your ImageKit/Gemini plan or try again later."
                        : "The image service could not generate that image. Please try again in a moment.",
                })
            }
            throw error
        }

    } catch (error) {
        return res.json({success:false,message:toUserMessage(error, 'image service')});
    }
}


export const documentMessageController = async (req, res) => {
    const userId = req.user._id

    try {
        const { chatId } = req.body
        const prompt = String(req.body.prompt || '').trim()
        const file = req.file

        if (!file) {
            return res.json({ success: false, message: "Please attach a document (PDF, Word, Excel, or text file)" })
        }

        const chat = await Chat.findOne({ userId, _id: chatId })
        if (!chat) {
            return res.json({ success: false, message: "Chat not found" })
        }

        let documentText
        try {
            documentText = await parseDocument(file)
        } catch (error) {
            return res.json({ success: false, message: error.message })
        }

        const user = await spendCredits(userId, DOCUMENT_COST)
        if (!user) {
            return res.json(NOT_ENOUGH_CREDITS)
        }

        try {
            const question = prompt || `Analyze this document: ${file.originalname}`

            const { choices } = await openai.chat.completions.create({
                model: "mimo-v2.5",
                messages: [
                    {
                        role: "system",
                        content: "You are a document analyst. Answer the user's question using the document content included in their message.",
                    },
                    ...buildConversation(chat.messages),
                    {
                        role: "user",
                        content: `${question}\n\n--- Document (${file.originalname}) ---\n${documentText}`,
                    },
                ],
            }, modelOptions(chatId))

            const reply = assistantReply(choices)

            chat.messages.push({
                role: "user",
                content: question,
                timestamp: Date.now(),
                isImage: false,
                isDocument: true,
                fileName: file.originalname,
                isPublished: false,
            })
            chat.messages.push(reply)
            await chat.save()

            return res.json({ success: true, reply, credits: user.credits })
        } catch (error) {
            await refundCredits(userId, DOCUMENT_COST)
            throw error
        }

    } catch (error) {
        return res.json({ success: false, message: toUserMessage(error) })
    }
}

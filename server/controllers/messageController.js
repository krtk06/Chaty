import axios from "axios"
import Chat from "../models/Chat.js"
import User from "../models/user.js"
import imagekit from "../configs/imageKit.js"
import openai from "../configs/openai.js"
import { parseDocument } from "../utils/documentParser.js"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let lastRequestTime = 0
const MIN_INTERVAL_MS = 6000

const waitForSlot = async () => {
  const now = Date.now()
  const wait = Math.max(0, MIN_INTERVAL_MS - (now - lastRequestTime))
  if (wait > 0) await sleep(wait)
  lastRequestTime = Date.now()
}

const createChatCompletionWithRetry = async (messages) => {
  let lastError
  for (let i = 0; i < 5; i++) {
    try {
      await waitForSlot()
      return await openai.chat.completions.create({
        model: "gemini-2.5-flash",
        messages,
      })
    } catch (error) {
      lastError = error
      if (error.status === 429) {
        const delay = Math.min(1000 * Math.pow(2, i), 15000)
        await sleep(delay)
        continue
      }
      throw error
    }
  }
  throw lastError
}

export const textMessageController = async(req,res) =>{
    try {
        const userId = req.user._id

        if(req.user.credits<1){
            return res.json({success:false,message:"You don't have enough credits to use this feature"})
        }

        const {chatId,prompt} = req.body

        const chat = await Chat.findOne({userId, _id:chatId})
        chat.messages.push({role: "user", content: prompt, timestamp : Date.now(), isImage:false})

        const response = await createChatCompletionWithRetry([
          { role: "user", content: prompt },
        ])

        const reply = {...response.choices[0].message,timestamp:Date.now(),isImage:false}
        res.json({success:true,reply})

        chat.messages.push(reply)
        await chat.save()

        await User.updateOne({_id:userId},{$inc:{credits:-1}})

    } catch (error) {
        const message = error.status === 429
          ? "AI service is busy. Your request is queued — please wait a moment and try again."
          : error.message
        res.json({success:false, message})
    }
}



export const imageMessageController = async (req,res) =>{
    try {
        const userId = req.user._id;

        if(req.user.credits<2){
            return res.json({success:false,message:"You don't have enough credits to use this feature"})
        }
        const {prompt,chatId,isPublished} = req.body

        const chat = await Chat.findOne({userId,_id:chatId})

        chat.messages.push({
            role: "user",
            content: prompt, 
            timestamp : Date.now(), 
            isImage:false
        });

        const encodedPrompt = encodeURIComponent(prompt)

        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/Chaty/${Date.now()}.png?tr=w-800,h-800`;
        const aiImageResponse = await axios.get(generatedImageUrl, { responseType: "arraybuffer" });

        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data,"binary").toString('base64')}`

        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "Chaty"
        })

        const reply = {
            role: 'assistant',
            content: uploadResponse.url,
            timestamp:Date.now(),
            isImage:true,
            isPublished
        }
        res.json({success:true,reply})

        chat.messages.push(reply)
        await chat.save()

        await User.updateOne({_id:userId},{$inc:{credits:-2}})

    } catch (error) {
        res.json({success:false,message:error.message});
    }
}

export const documentMessageController = async (req, res) => {
  try {
    const userId = req.user._id

    if (req.user.credits < 2) {
      return res.json({ success: false, message: "You don't have enough credits to use this feature" })
    }

    if (!req.file) {
      return res.json({ success: false, message: "No file uploaded" })
    }

    const { chatId, prompt } = req.body
    const { buffer, mimetype, originalname } = req.file

    const chat = await Chat.findOne({ userId, _id: chatId })

    chat.messages.push({
      role: "user",
      content: prompt || `Analyze this document: ${originalname}`,
      timestamp: Date.now(),
      isImage: false,
      isDocument: true,
      fileName: originalname,
    })

    const extractedText = await parseDocument(buffer, mimetype)

    const systemPrompt =
      "You are a document analysis assistant. The user has uploaded a document with the following content. " +
      "Analyze it thoroughly and answer the user's question about it. Be detailed and accurate."

    const docMessage = `Document filename: ${originalname}\n\nDocument content:\n${extractedText}${prompt ? `\n\nUser's question: ${prompt}` : '\n\nPlease summarize this document.'}`

    const response = await createChatCompletionWithRetry([
      { role: "system", content: systemPrompt },
      { role: "user", content: docMessage },
    ])

    const reply = {
      ...response.choices[0].message,
      timestamp: Date.now(),
      isImage: false,
      isDocument: false,
    }

    res.json({ success: true, reply })

    chat.messages.push(reply)
    await chat.save()

    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}
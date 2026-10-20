import express from 'express'
import multer from 'multer'
import { protect } from '../middlewares/auth.js'
import { documentMessageController, imageMessageController, textMessageController } from '../controllers/messageController.js'


const messageRouter = express.Router()

// Keep uploads in memory; the parser only needs the buffer.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
})

messageRouter.post("/text",protect,textMessageController)
messageRouter.post("/image",protect,imageMessageController)
messageRouter.post("/document",protect,upload.single('file'),documentMessageController)

export default messageRouter

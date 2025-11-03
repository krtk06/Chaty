import express from 'express'
import multer from 'multer'
import { protect } from '../middlewares/auth.js'
import { imageMessageController, textMessageController, documentMessageController } from '../controllers/messageController.js'

const upload = multer({ storage: multer.memoryStorage() })
const messageRouter = express.Router()

messageRouter.post("/text", protect, textMessageController)
messageRouter.post("/image", protect, imageMessageController)
messageRouter.post("/document", protect, upload.single('file'), documentMessageController)

export default messageRouter

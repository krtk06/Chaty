import express from 'express'
import { appleLogin, getPublishedImages, getUser, googleLogin, loginUser, registerUser, updateUser } from '../controllers/userControllers.js';
import { protect } from '../middlewares/auth.js';



const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/google', googleLogin)
userRouter.post('/apple', appleLogin)
userRouter.get('/data',protect,getUser)
userRouter.put('/update',protect,updateUser)
userRouter.get('/published-images',getPublishedImages)


export default userRouter;
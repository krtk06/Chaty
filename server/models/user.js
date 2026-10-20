import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    name: {type : String, required : true},
    email: {type : String, required : true, unique : true},
    password: {type : String, required : false},
    credits: {type : Number, default : 20},
    avatar: {type : String, default : ''},
    authProvider: {type : String, enum: ['email', 'google', 'apple'], default: 'email'},
    googleId: {type : String, unique : true, sparse : true},
    appleId: {type : String, unique : true, sparse : true},
}, {timestamps: true})

userSchema.pre('save' , async function (next){
    if(!this.isModified('password') || !this.password){
        return next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next();
})

// Never serialize the password hash to API clients.
userSchema.methods.toJSON = function () {
    const user = this.toObject()
    delete user.password
    return user
}

const User = mongoose.model('User', userSchema);

export default User;

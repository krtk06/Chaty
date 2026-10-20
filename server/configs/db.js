import mongoose from "mongoose";

const connectDB = async () =>{
    try{
        mongoose.connection.on('connected' , ()=> console.log('Database Connected'))

        const base = process.env.MONGODB_URL
        if (!base) throw new Error('MONGODB_URL is not set')

        // Respect a database name already present in the URL; otherwise
        // default to the /Chaty database.
        const hasDatabase = /^mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/.test(base)
        const url = hasDatabase ? base : `${base.replace(/\/+$/, '')}/Chaty`

        await mongoose.connect(url)
    } catch (error){
        console.error('Database connection failed:', error.message)
        // Fail fast: running the API without a database only produces
        // hanging requests and confusing errors downstream.
        process.exit(1)
    }
}


export default connectDB;

import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
export const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL)
    } catch (error) {
        console.error('Database connection error:', error)
        
    }
}
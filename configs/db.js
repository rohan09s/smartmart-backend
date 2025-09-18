// Configuration to create a file to connect our project with the database

import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        mongoose.connection.on('connected', ()=> console.log("Database connected successfully ✅")
    );

    await mongoose.connect(`${process.env.MONGODB_URI}/SmartMart`)
    } catch (error) {
        console.error(error.message);
    }
}

export default connectDB;
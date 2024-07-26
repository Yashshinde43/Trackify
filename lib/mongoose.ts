import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {

    if (!process.env.MONGODB_URI) return console.log("No MongoDB URI provided");

    if (isConnected) {
        return console.log("using existing DB connection");
    }

    try {

        await mongoose.connect(process.env.MONGODB_URI)
        isConnected = true;
        console.log("connected to DB");
        
    } catch (error) {
        console.log(error);
    }
}
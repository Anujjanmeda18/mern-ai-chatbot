import mongoose from "mongoose";

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        
    } catch (error) {
        console.log("Error connecting to MongoDB:", error);
        throw new Error("Failed to connect to the database");
    }
}

async function disconnectDB() {
    try {
        await mongoose.disconnect();
    } catch (error) {
        console.log("Error disconnecting from MongoDB:", error);
        throw new Error("Failed to disconnect from the database");
    }
}

export { connectDB, disconnectDB };
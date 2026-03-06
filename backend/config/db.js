const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/evidence-locker");
        const host = conn.connection.host;
        if (host.includes("mongodb.net")) {
            console.log("MongoDB Atlas Connected ");
        } else {
            console.log(`Local MongoDB Connected (${host})`);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

import mongoose from "mongoose";

const connectDB = async () => {
  try {
      await mongoose.connect(process.env.MONGO_URL);
      console.log("Database is connected to the server");
  } catch (error) {
     throw error;
  }
};


export {connectDB};

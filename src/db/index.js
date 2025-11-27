import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const db_Connection = async () => {
  try {
    const response = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    // console.log("connection running on host: ", response.connection.host); just fon knowledge
    return response;
  } catch (error) {
    console.log("Failed to connect database");
    process.exit(1)
  }
};

export {db_Connection}
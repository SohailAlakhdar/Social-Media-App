import {connect } from "mongoose"
import { UserModel } from "./model/User.model";

export const connectDB = async():Promise<void> =>{
    try {

        const result = await connect(process.env.DB_URI || "", {
            serverSelectionTimeoutMS:30000,
        })
        UserModel.syncIndexes();
        console.log("Database connected 👌")
    } catch (error) {
        console.error("Database connection failed ❌", error)
    }
}

export default connectDB


import {connect } from "mongoose"

export const connectDB = async() =>{
    try {

        const result = await connect(process.env.DB_URI || "", {
            serverSelectionTimeoutMS:30000,
        })
        // UserModel.syncIndexes();
        // console.log(result.models);
        console.log("Database connected 👌")
    } catch (error) {
        console.error("Database connection failed ❌", error)
    }
}

export default connectDB
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = require("mongoose");
const User_model_1 = require("./model/User.model");
const connectDB = async () => {
    try {
        const result = await (0, mongoose_1.connect)(process.env.DB_URI || "", {
            serverSelectionTimeoutMS: 30000,
        });
        User_model_1.UserModel.syncIndexes();
        console.log("Database connected 👌");
    }
    catch (error) {
        console.error("Database connection failed ❌", error);
    }
};
exports.connectDB = connectDB;
exports.default = exports.connectDB;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = require("mongoose");
const connectDB = async () => {
    try {
        const result = await (0, mongoose_1.connect)(process.env.DB_URI || "", {
            serverSelectionTimeoutMS: 30000,
        });
        // console.log(result.models);
        console.log("Database connected 👌");
    }
    catch (error) {
        console.error("Database connection failed ❌", error);
    }
};
exports.connectDB = connectDB;
exports.default = exports.connectDB;

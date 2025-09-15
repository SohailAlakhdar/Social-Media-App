"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = void 0;
const successResponse = ({ res, statusCode = 200, message = "Done", data, }) => {
    return res
        .status(statusCode)
        .json({ message: message, statusCode, data: data });
};
exports.successResponse = successResponse;

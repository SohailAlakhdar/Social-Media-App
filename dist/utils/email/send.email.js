"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const error_response_1 = require("../response/error.response");
const sendEmail = async (data) => {
    if (!data.to) {
        throw new Error("Recipient email address is required");
    }
    if (!data.html && !data.text && !data.attachments?.length) {
        throw new error_response_1.BadRequestException("Either HTML or plain text content is required");
    }
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.APP_GMAIL,
            pass: process.env.APP_PASSWORD,
        },
    });
    const info = await transporter.sendMail({
        ...data,
        from: `"Route ${process.env.APP_NAME}" <${process.env.APP_GMAIL}>`,
    });
    console.log("Email sent:", info.messageId);
};
exports.sendEmail = sendEmail;

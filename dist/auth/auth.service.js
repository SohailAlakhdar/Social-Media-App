"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_1 = require("../utils/response/error.response");
const User_model_1 = require("../DB/model/User.model");
const user_repository_1 = require("../DB/repository/user.repository");
const hash_security_1 = require("../utils/security/hash.security");
const email_event_1 = require("../utils/event/email.event");
const otp_1 = require("../utils/otp");
const token_security_1 = require("../utils/security/token.security");
class AuthService {
    userModel = new user_repository_1.userRepository(User_model_1.UserModel);
    constructor() { }
    signup = async (req, res, next) => {
        let { username = "", email, password } = req.body;
        const userExist = await this.userModel.findOne({
            filter: { email },
            select: "email",
            options: {
                lean: true,
            },
        });
        // console.log(userExist);
        if (userExist) {
            throw new error_response_1.ConflictException("Email exists");
        }
        const otp = (0, otp_1.generateOTP)();
        email_event_1.emailEvent.emit("Confirm-Email", {
            to: email,
            subject: "Welcome to Our App",
            text: `Hello ${username},\n\nThank you for signing up!`,
            otp,
        });
        const user = await this.userModel.createUser({
            data: [
                {
                    username,
                    email,
                    password: await (0, hash_security_1.generateHash)(password),
                    confirmEmailOtp: await (0, hash_security_1.generateHash)(String(otp)),
                },
            ],
            options: { validateBeforeSave: true },
        });
        return res.json({ message: "Signup successful", data: { user } });
    };
    login = async (req, res, next) => {
        let { email, password } = req.body;
        if (!email || !password) {
            throw new error_response_1.BadRequestException("All fields are required");
        }
        const user = await this.userModel.findOne({
            filter: { email },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("Email is not found");
        }
        if (!user.confirmedAt) {
            throw new error_response_1.BadRequestException("Email is not confirmed");
        }
        if (!(await (0, hash_security_1.compareHash)(password, user.password))) {
            throw new error_response_1.NotFoundException("Password is incorrect");
        }
        const credentials = await (0, token_security_1.createLoginCredentials)(user);
        return res.json({
            message: "Login successful",
            data: { credentials },
        });
    };
    confirmEmail = async (req, res, next) => {
        let { email, otp } = req.body;
        if (!email || !otp) {
            throw new error_response_1.BadRequestException("All fields are required");
        }
        const userExist = await this.userModel.findOne({
            filter: {
                email,
                confirmedAt: { $exists: false },
                confirmEmailOtp: { $exists: true },
            },
        });
        if (!userExist) {
            throw new error_response_1.BadRequestException("Invalid Account");
        }
        if (!(await (0, hash_security_1.compareHash)(otp, userExist.confirmEmailOtp))) {
            throw new error_response_1.ConflictException("Invalid OTP");
        }
        const user = await this.userModel.updateOne({
            filter: { email },
            update: {
                $set: { confirmedAt: new Date() },
                $unset: { confirmEmailOtp: 1 },
            },
        });
        return res.json({
            message: "Email confirmed successfully",
            data: { user },
        });
    };
}
exports.default = new AuthService();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_1 = require("../../utils/response/error.response");
const User_model_1 = require("../../DB/model/User.model");
const user_repository_1 = require("../../DB/repository/user.repository");
const hash_security_1 = require("../../utils/security/hash.security");
const email_event_1 = require("../../utils/event/email.event");
const otp_1 = require("../../utils/otp");
const token_security_1 = require("../../utils/security/token.security");
const google_auth_library_1 = require("google-auth-library");
class AuthService {
    userModel = new user_repository_1.userRepository(User_model_1.UserModel);
    constructor() { }
    async verifyGmailAccount(idToken) {
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.WEB_CLIENT_IDS?.split(",") || [],
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new error_response_1.BadRequestException("Invalid Google ID token");
        }
        return payload;
    }
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
        email_event_1.emailEvent.emit("ConfirmEmail", {
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
    loginWithGoogle = async (req, res) => {
        const { idToken } = req.body;
        const { email } = await this.verifyGmailAccount(idToken);
        const user = await this.userModel.findOne({
            filter: {
                email,
                provider: User_model_1.providerEnum.GOOGLE,
            },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("NOt found User or not register");
        }
        const credentials = await (0, token_security_1.createLoginCredentials)(user);
        return res.json({
            message: "Done",
            data: { credentials },
        });
    };
    signupWithGoogle = async (req, res) => {
        const { idToken } = req.body;
        const { name, given_name, family_name, picture, email } = await this.verifyGmailAccount(idToken);
        const user = await this.userModel.findOne({
            filter: {
                email,
            },
        });
        if (user) {
            if (user.provider === User_model_1.providerEnum.GOOGLE) {
                return await this.loginWithGoogle(req, res);
            }
            throw new error_response_1.ConflictException(`invalid exist with another provider:::${user.provider}`);
        }
        const [newUser] = (await this.userModel.create({
            data: [
                {
                    username: name,
                    firstName: given_name,
                    lastName: family_name,
                    email: email,
                    profileImage: picture,
                    confirmedAt: new Date(),
                    provider: User_model_1.providerEnum.GOOGLE,
                },
            ],
        })) || [];
        if (!newUser) {
            throw new error_response_1.BadRequestException("Fail to signup with gamil, please try again later");
        }
        const credentials = await (0, token_security_1.createLoginCredentials)(newUser);
        return res.status(201).json({ message: "Done", data: { credentials } });
    };
    forgotPassword = async (req, res) => {
        const { email } = req.body;
        const user = await this.userModel.findOne({
            filter: {
                email,
                provider: User_model_1.providerEnum.SYSTEM,
                confirmedAt: { $exists: true },
            },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("NOt found User or not register");
        }
        const otp = await (0, otp_1.generateOTP)();
        const result = await this.userModel.updateOne({
            filter: { email },
            update: {
                resetPasswordToken: await (0, hash_security_1.generateHash)(String(otp)),
            },
        });
        if (!result.matchedCount) {
            throw new error_response_1.BadRequestException("Fail to send reset code");
        }
        email_event_1.emailEvent.emit("resetPassword", {
            to: email,
            subject: "Reset your password",
            text: `Hello ${user.username},\n\nYour OTP is ${otp}`,
            otp,
        });
        return res.json({
            message: "Done",
            data: {},
        });
    };
    verifyForgotPassword = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userModel.findOne({
            filter: {
                email,
                provider: User_model_1.providerEnum.SYSTEM,
                resetPasswordToken: { $exists: true },
            },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("NOt found User or not register");
        }
        if (!(await (0, hash_security_1.compareHash)(otp, user.resetPasswordToken))) {
            throw new error_response_1.BadRequestException("Invalid OTP");
        }
        const result = await this.userModel.updateOne({
            filter: { email },
            update: {
                verifyForgotPassword: new Date(),
            },
        });
        if (!result.matchedCount) {
            throw new error_response_1.BadRequestException("Fail to send reset code");
        }
        return res.json({
            message: "Done",
            data: { user },
        });
    };
    resetPassword = async (req, res) => {
        const { email, otp, password, confirmPassword } = req.body;
        const user = await this.userModel.findOne({
            filter: {
                email,
                $unset: { resetPasswordToken: 1 },
                changeCredentialsAt: new Date()
            },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("NOt found User or not register");
        }
        if (password !== confirmPassword) {
            throw new error_response_1.BadRequestException("Passwords do not match");
        }
        if (!(await (0, hash_security_1.compareHash)(otp, user.resetPasswordToken))) {
            throw new error_response_1.BadRequestException("Invalid OTP");
        }
        const result = await this.userModel.updateOne({
            filter: { email },
            update: {
                password: await (0, hash_security_1.generateHash)(password),
            },
        });
        if (!result.matchedCount) {
            throw new error_response_1.BadRequestException("Fail to reset password");
        }
        return res.json({
            message: "Done",
            data: { user },
        });
    };
}
exports.default = new AuthService();

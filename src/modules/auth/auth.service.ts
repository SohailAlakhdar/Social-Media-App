import type { NextFunction, Request, Response } from "express";
import {
    BadRequestException,
    ConflictException,
    NotFoundException,
} from "../../utils/response/error.response";
import {
    AuthSignupDto,
    AuthLoginDto,
    AuthConfirmEmailDto,
    IGmail,
    IForgotPassword,
    IResetPassword,
    IVerifyForgotPassword,
} from "./auth.dto";
import { providerEnum, UserModel } from "../../DB/model/User.model";
// import { userRepository } from "../../DB/repository/user.repository";
import { compareHash, generateHash } from "../../utils/security/hash.security";
import { emailEvent } from "../../utils/event/email.event";
import { generateOTP } from "../../utils/otp";
import { createLoginCredentials } from "../../utils/security/token.security";
import { OAuth2Client, type TokenPayload } from "google-auth-library";
import { successResponse } from "../../utils/response/success.response";
import { UserRepository } from "../../DB/repository/User.repository";
import { ILoginResponse } from "./auth.entities";

//
class AuthService {
    private userModel = new UserRepository(UserModel);
    constructor() {}

    private async verifyGmailAccount(idToken: string): Promise<TokenPayload> {
        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.WEB_CLIENT_IDS?.split(",") || [],
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new BadRequestException("Invalid Google ID token");
        }
        return payload;
    }

    // Signup
    signup = async (req: Request, res: Response): Promise<Response> => {
        let { username = "", email, password }: AuthSignupDto = req.body;
        const userExist = await this.userModel.findOne({
            filter: { email },
            select: "email",
            options: {
                lean: true,
                // populate:[{path:"username"}],
            },
        });
        console.log(userExist);
        if (userExist) {
            throw new ConflictException("Email exists");
        }
        const otp = generateOTP();

        const user = await this.userModel.createUser({
            data: [
                {
                    username,
                    email,
                    password: password,
                    confirmEmailOtp: String(otp),
                },
            ],
            options: { validateBeforeSave: true },
        });
        return successResponse({ res, statusCode: 201, data: { user } });
    };

    // Login
    login = async (req: Request, res: Response): Promise<Response> => {
        let { email, password }: AuthLoginDto = req.body;
        if (!email || !password) {
            throw new BadRequestException("All fields are required");
        }
        const user = await this.userModel.findOne({
            filter: { email },
        });
        console.log(user);

        if (!user) {
            throw new NotFoundException("Email is not found");
        }
        if (!user.confirmedAt) {
            throw new BadRequestException("Email is not confirmed");
        }
        if (!(await compareHash(password, user.password as string))) {
            throw new NotFoundException("Password is incorrect");
        }
        const credentials = await createLoginCredentials(user);
        return successResponse<ILoginResponse>({ res, data: { credentials } });
    };

    // Confirm-Email
    confirmEmail = async (req: Request, res: Response): Promise<Response> => {
        let { email, otp }: AuthConfirmEmailDto = req.body;
        if (!email || !otp) {
            throw new BadRequestException("All fields are required");
        }
        const userExist = await this.userModel.findOne({
            filter: {
                email,
                confirmedAt: { $exists: false },
                confirmEmailOtp: { $exists: true },
            },
        });
        if (!userExist) {
            throw new BadRequestException("Invalid Account");
        }
        if (!(await compareHash(otp, userExist.confirmEmailOtp))) {
            throw new ConflictException("Invalid OTP");
        }

        // update userRepository
        const user = await this.userModel.updateOne({
            filter: { email },
            update: {
                $set: { confirmedAt: new Date() },
                $unset: { confirmEmailOtp: 1 },
            },
        });
        return successResponse({ res, data: { user } });
    };

    // Login-With-Google
    loginWithGoogle = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const { idToken } = req.body;
        const { email } = await this.verifyGmailAccount(idToken);
        const user = await this.userModel.findOne({
            filter: {
                email,
                provider: providerEnum.GOOGLE,
            },
        });
        if (!user) {
            throw new NotFoundException("NOt found User or not register");
        }
        const credentials = await createLoginCredentials(user);
        return successResponse<ILoginResponse>({ res, data: { credentials } });
    };

    // Signup-With-Google
    signupWithGoogle = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const { idToken }: IGmail = req.body;
        const { name, given_name, family_name, picture, email }: TokenPayload =
            await this.verifyGmailAccount(idToken);
        const user = await this.userModel.findOne({
            filter: {
                email,
            },
        });
        if (user) {
            if (user.provider === providerEnum.GOOGLE) {
                return await this.loginWithGoogle(req, res);
            }
            throw new ConflictException(
                `invalid exist with another provider:::${user.provider}`
            );
        }
        const [newUser] =
            (await this.userModel.create({
                data: [
                    {
                        username: name as string,
                        firstName: given_name as string,
                        lastName: family_name as string,
                        email: email as string,
                        profileImage: picture as string,
                        confirmedAt: new Date(),
                        provider: providerEnum.GOOGLE,
                    },
                ],
            })) || [];
        if (!newUser) {
            throw new BadRequestException(
                "Fail to signup with gamil, please try again later"
            );
        }

        const credentials = await createLoginCredentials(newUser);
        return successResponse<ILoginResponse>({ res, data: { credentials } });
    };

    forgotPassword = async (req: Request, res: Response): Promise<Response> => {
        const { email }: IForgotPassword = req.body;
        const user = await this.userModel.findOne({
            filter: {
                email,
                provider: providerEnum.SYSTEM,
                confirmedAt: { $exists: true },
            },
        });
        if (!user) {
            throw new NotFoundException("NOt found User or not register");
        }
        const otp = await generateOTP();
        const result = await this.userModel.updateOne({
            filter: { email },
            update: {
                resetPasswordToken: await generateHash(String(otp)),
            },
        });
        if (!result.matchedCount) {
            throw new BadRequestException("Fail to send reset code");
        }
        emailEvent.emit("resetPassword", {
            to: email,
            subject: "Reset your password",
            text: `Hello ${user.username},\n\nYour OTP is ${otp}`,
            otp,
        });
        return successResponse({ res });
    };
    verifyForgotPassword = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const { email, otp }: IVerifyForgotPassword = req.body;
        const user = await this.userModel.findOne({
            filter: {
                email,
                provider: providerEnum.SYSTEM,
                resetPasswordToken: { $exists: true },
            },
        });
        if (!user) {
            throw new NotFoundException("NOt found User or not register");
        }
        if (!(await compareHash(otp, user.resetPasswordToken as string))) {
            throw new BadRequestException("Invalid OTP");
        }
        const result = await this.userModel.updateOne({
            filter: { email },
            update: {
                verifyForgotPassword: new Date(),
            },
        });
        if (!result.matchedCount) {
            throw new BadRequestException("Fail to send reset code");
        }
        return successResponse({ res });
    };
    resetPassword = async (req: Request, res: Response): Promise<Response> => {
        const { email, otp, password, confirmPassword }: IResetPassword =
            req.body;
        const user = await this.userModel.findOne({
            filter: {
                email,
                $unset: { resetPasswordToken: 1 },
                changeCredentialsAt: new Date(),
            },
        });
        if (!user) {
            throw new NotFoundException("NOt found User or not register");
        }
        if (password !== confirmPassword) {
            throw new BadRequestException("Passwords do not match");
        }
        if (!(await compareHash(otp, user.resetPasswordToken as string))) {
            throw new BadRequestException("Invalid OTP");
        }
        const result = await this.userModel.updateOne({
            filter: { email },
            update: {
                password: await generateHash(password),
            },
        });
        if (!result.matchedCount) {
            throw new BadRequestException("Fail to reset password");
        }

        return successResponse({ res, data: { user } });
    };
}

export default new AuthService();

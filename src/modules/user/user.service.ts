import { Request, NextFunction, Response } from "express";
import { ILogoutDto } from "./user.dto";
import { UpdateQuery } from "mongoose";
import {
    createLoginCredentials,
    createRevokeToken,
    LogoutEnum,
} from "../../utils/security/token.security";
import { userRepository } from "../../DB/repository/user.repository";
import { HUserDocument, IUser, UserModel } from "../../DB/model/User.model";
// import { tokenRepository } from "../../DB/repository/Token.repository";
// import { TokenModel } from "./../../DB/model/Token.model";
import { BadRequestException } from "../../utils/response/error.response";
import { JwtPayload } from "jsonwebtoken";

export class UserService {
    private userModel = new userRepository(UserModel);
    // private tokenModel = new tokenRepository(TokenModel);
    constructor() {}

    profile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response> => {
        return res.json({
            message: "Done",
            data: {
                user: req.user,
                decoded: req.decoded,
            },
        });
    };
    // logout
    Logout = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response> => {
        let statusCode: number = 200;
        const { flag }: ILogoutDto = req.body;
        if (!flag) {
            throw new BadRequestException("Flag is required");
        }

        const update: UpdateQuery<IUser> = {};
        switch (flag) {
            case LogoutEnum.all:
                update.changeCredentialsAt = new Date();
                break;

            default:
                await createRevokeToken(req.decoded as JwtPayload);
                statusCode = 201;
                break;
        }
        await this.userModel.updateOne({
            filter: { _id: req.decoded?._id },
            update,
        });
        return res.status(statusCode).json({
            message: "Done",
        });
    };
    refreshToken = async (req: Request, res: Response): Promise<Response> => {
        const credentials = await createLoginCredentials(
            req.user as HUserDocument
        );
        await createRevokeToken(req.decoded as JwtPayload);
        return res.status(201).json({
            message: "Done",
            data: { credentials },
        });
    };
}

export default new UserService();

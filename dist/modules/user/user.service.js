"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const token_security_1 = require("../../utils/security/token.security");
const user_repository_1 = require("../../DB/repository/user.repository");
const User_model_1 = require("../../DB/model/User.model");
const error_response_1 = require("../../utils/response/error.response");
class UserService {
    userModel = new user_repository_1.userRepository(User_model_1.UserModel);
    constructor() { }
    profile = async (req, res, next) => {
        return res.json({
            message: "Done",
            data: {
                user: req.user,
                decoded: req.decoded,
            },
        });
    };
    Logout = async (req, res, next) => {
        let statusCode = 200;
        const { flag } = req.body;
        if (!flag) {
            throw new error_response_1.BadRequestException("Flag is required");
        }
        const update = {};
        switch (flag) {
            case token_security_1.LogoutEnum.all:
                update.changeCredentialsAt = new Date();
                break;
            default:
                await (0, token_security_1.createRevokeToken)(req.decoded);
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
    refreshToken = async (req, res) => {
        const credentials = await (0, token_security_1.createLoginCredentials)(req.user);
        await (0, token_security_1.createRevokeToken)(req.decoded);
        return res.status(201).json({
            message: "Done",
            data: { credentials },
        });
    };
}
exports.UserService = UserService;
exports.default = new UserService();

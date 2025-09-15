"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const token_security_1 = require("../../utils/security/token.security");
const User_repository_1 = require("../../DB/repository/User.repository");
const User_model_1 = require("../../DB/model/User.model");
const error_response_1 = require("../../utils/response/error.response");
const s3_config_1 = require("../../utils/multer/s3.config");
const cloud_multer_1 = require("../../utils/multer/cloud.multer");
class UserService {
    userModel = new User_repository_1.UserRepository(User_model_1.UserModel);
    constructor() { }
    profile = async (req, res) => {
        return res.json({
            message: "Done",
            data: {
                user: req.user,
                decoded: req.decoded,
            },
        });
    };
    profileImage = async (req, res) => {
        const { ContentType, originalname, } = req.body;
        const { url, key } = await (0, s3_config_1.createPreSignedUploadLink)({
            ContentType,
            originalname,
            path: `users/${req.decoded?._id}`,
        });
        return res.json({
            message: "Done",
            data: { url, key },
        });
    };
    profileCoverImage = async (req, res) => {
        const urls = await (0, s3_config_1.uploadFiles)({
            storageApproach: cloud_multer_1.storageEnum.disk,
            files: req.files,
            path: `users/${req.decoded?._id}`,
        });
        return res.json({
            message: "Done",
            data: {
                urls,
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

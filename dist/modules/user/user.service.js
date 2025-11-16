"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = exports.users = void 0;
const FriendRequest_model_1 = require("./../../DB/model/FriendRequest.model");
const mongoose_1 = require("mongoose");
const token_security_1 = require("../../utils/security/token.security");
const user_repository_1 = require("../../DB/repository/user.repository");
const User_model_1 = require("../../DB/model/User.model");
const error_response_1 = require("../../utils/response/error.response");
const s3_config_1 = require("../../utils/multer/s3.config");
const cloud_multer_1 = require("../../utils/multer/cloud.multer");
const success_response_1 = require("../../utils/response/success.response");
const s3_events_1 = require("../../utils/multer/s3.events");
const post_repository_1 = require("../../DB/repository/post.repository");
const Post_model_1 = require("../../DB/model/Post.model");
const friendRequest_repository_1 = require("../../DB/repository/friendRequest.repository");
const DB_1 = require("../../DB");
const Chat_model_1 = require("../../DB/model/Chat.model");
exports.users = [
    {
        id: 1,
        name: "sohail",
        email: "sohail@gmail.com",
        gender: User_model_1.GenderEnum.male,
        password: "555789",
        followers: [],
    },
    {
        id: 2,
        name: "Ibrahim",
        email: "Ibrahim@gmail.com",
        gender: User_model_1.GenderEnum.male,
        password: "555789",
        followers: [],
    },
    {
        id: 3,
        name: "Sara",
        email: "Sara@gmail.com",
        gender: User_model_1.GenderEnum.female,
        password: "457892",
        followers: [],
    },
    {
        id: 4,
        name: "Adel",
        email: "Adel@gmail.com",
        gender: User_model_1.GenderEnum.male,
        password: "555789",
        followers: [],
    },
];
class UserService {
    userModel = new user_repository_1.UserRepository(User_model_1.UserModel);
    postModel = new post_repository_1.PostRepository(Post_model_1.PostModel);
    chatModel = new DB_1.ChatRepository(Chat_model_1.ChatModel);
    friendRequestModel = new friendRequest_repository_1.FriendRequestRepository(FriendRequest_model_1.FriendRequestModel);
    constructor() { }
    dashboard = async (req, res) => {
        const result = await Promise.allSettled([
            this.userModel.find({ filter: {} }),
            this.postModel.find({ filter: {} }),
        ]);
        return (0, success_response_1.successResponse)({
            res,
            data: { result },
        });
    };
    changeRole = async (req, res) => {
        const { userId } = req.params;
        const { role } = req.body;
        let denyRoles = [role, User_model_1.RoleEnum.superAdmin];
        if (role === User_model_1.RoleEnum.admin) {
            denyRoles.push(User_model_1.RoleEnum.admin);
        }
        const user = await this.userModel.findOneAndUpdate({
            filter: { _id: userId, role: { $nin: denyRoles } },
            update: { role },
            options: { new: true },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("User not found");
        }
        return (0, success_response_1.successResponse)({
            res,
            data: { user },
        });
    };
    sendFriendRequest = async (req, res) => {
        const { userId } = req.params;
        const checkFriendRequest = await this.friendRequestModel.findOne({
            filter: {
                createdBy: { $in: [req.user?._id, userId] },
                sendTo: { $in: [req.user?._id, userId] },
            },
        });
        if (checkFriendRequest) {
            throw new error_response_1.NotFoundException("friend request is already created ");
        }
        if (!(await this.userModel.findOneAndUpdate({
            filter: {
                _id: userId,
            },
            update: {},
        }))) {
            throw new error_response_1.NotFoundException("User not found");
        }
        const sendTo = new mongoose_1.Types.ObjectId(userId);
        const [friendRequest] = await this.friendRequestModel.create({
            data: [
                {
                    sendTo,
                    createdBy: req.user?._id,
                },
            ],
        });
        return (0, success_response_1.successResponse)({
            res,
            data: { friendRequest },
        });
    };
    acceptFriendRequest = async (req, res) => {
        const { requestId } = req.params;
        const friendRequest = await this.friendRequestModel.findOneAndUpdate({
            filter: {
                _id: requestId,
                sendTo: req.user?._id,
                acceptedAt: { $exists: false },
            },
            update: {
                $set: { acceptedAt: new Date() },
            },
            options: { new: true },
        });
        if (!friendRequest) {
            throw new error_response_1.NotFoundException("Friend request not found or already accepted");
        }
        Promise.all([
            await this.userModel.updateOne({
                filter: { _id: friendRequest.createdBy },
                update: { $addToSet: { friends: friendRequest.sendTo } },
            }),
            await this.userModel.updateOne({
                filter: { _id: friendRequest.sendTo },
                update: { $addToSet: { friends: friendRequest.createdBy } },
            }),
        ]);
        return (0, success_response_1.successResponse)({
            res,
            data: { friendRequest },
        });
    };
    profile = async (req, res) => {
        const user = await this.userModel.findOne({
            filter: { _id: req.user?._id },
            options: {
                populate: [
                    {
                        path: "friends",
                        select: "firstName lastName email username profilePicture gender",
                    },
                ],
            },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("Fail to found this user");
        }
        const groups = await this.chatModel.find({
            filter: {
                participants: { $in: req.user?._id },
                group: { $exists: true },
            },
        });
        if (!groups) {
            throw new error_response_1.NotFoundException("fail to found groups");
        }
        return (0, success_response_1.successResponse)({
            res,
            data: { user, groups },
        });
    };
    profileImage = async (req, res) => {
        const { ContentType, originalname } = req.body;
        const { url, Key } = await (0, s3_config_1.createPreSignedUploadLink)({
            ContentType,
            originalname,
            path: `users/${req.decoded?._id}`,
        });
        const user = await this.userModel.findByIdAndUpdate({
            id: req.user?._id,
            update: {
                tempProfileImage: req.user?.profileImage,
                profileImage: Key,
                $inc: { _v: 1 },
            },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("no user found");
        }
        s3_events_1.s3Event.emit("profileImageUpload", {
            userId: req.user?._id,
            Key,
            oldKey: req.user?.profileImage,
            expiresIn: 20000,
        });
        return (0, success_response_1.successResponse)({ res, data: { url } });
    };
    profileCoverImage = async (req, res) => {
        const urls = await (0, s3_config_1.uploadFiles)({
            storageApproach: cloud_multer_1.storageEnum.disk,
            files: req.files,
            path: `users/${req.decoded?._id}/cover`,
        });
        const user = await this.userModel.findByIdAndUpdate({
            id: req.user?._id,
            update: {
                coverImage: urls,
            },
        });
        if (!user) {
            throw new error_response_1.BadRequestException("Not user in profileCoverImage");
        }
        if (req.user?.coverImage) {
            await (0, s3_config_1.deleteFiles)({ urls: req.user?.coverImage });
        }
        return (0, success_response_1.successResponse)({ res, data: { user } });
    };
    freezeAccount = async (req, res) => {
        const { userId } = req.params;
        if (userId && req.user?.role !== User_model_1.RoleEnum.admin) {
            throw new error_response_1.ForbiddenException("Not authorized to freeze account");
        }
        const user = await this.userModel.findOneAndUpdate({
            filter: {
                id: userId || req.user?._id,
                freezedAt: { $exists: false },
            },
            update: {
                freezedAt: new Date(),
                freezedBy: req.user?._id,
                changeCredentialsAt: new Date(),
                $unset: {
                    restoredAt: 1,
                    restoredBy: 1,
                },
            },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("User not found");
        }
        return res.status(201).json({
            message: "Done",
            data: { user },
        });
    };
    hardDeleteAccount = async (req, res) => {
        const { userId } = req.params;
        const user = await this.userModel.deleteOne({
            filter: {
                id: userId,
                freezedAt: { $exists: true },
            },
        });
        if (!user.deletedCount) {
            throw new error_response_1.NotFoundException("User not found");
        }
        await (0, s3_config_1.deleteFolderByPrefix)({ path: `users/${userId}` });
        return res.status(201).json({
            message: "Done",
        });
    };
    restoreAccount = async (req, res) => {
        const { userId } = req.params;
        const user = await this.userModel.findOneAndUpdate({
            filter: {
                id: userId,
                restoredAt: { $exists: false },
                freezedBy: { $ne: userId },
            },
            update: {
                restoredAt: new Date(),
                restoredBy: req.user?._id,
                $unset: {
                    freezedAt: 1,
                    freezedBy: 1,
                    changeCredentialsAt: 1,
                },
            },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("User not found");
        }
        return res.status(201).json({
            message: "Done",
            data: { user },
        });
    };
    Logout = async (req, res) => {
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
    welcome = (user) => {
        return `Hello ${user.firstName} for GraphQL`;
    };
    allUsers = (parent, args) => {
        return exports.users.filter((ele) => ele.name === args.name && ele.gender === args.gender);
    };
    addFollower = (args) => {
        exports.users = exports.users.map((ele) => {
            if (ele.id === args.friendId) {
                ele.followers.push(args.userId);
            }
            return ele;
        });
        return exports.users;
    };
}
exports.UserService = UserService;
exports.default = new UserService();

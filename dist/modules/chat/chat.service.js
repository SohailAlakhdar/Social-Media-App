"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const success_response_1 = require("../../utils/response/success.response");
const Chat_model_1 = require("../../DB/model/Chat.model");
const mongoose_1 = require("mongoose");
const repository_1 = require("../../DB/repository");
const error_response_1 = require("../../utils/response/error.response");
const model_1 = require("../../DB/model");
const gateway_1 = require("../gateway/gateway");
const s3_config_1 = require("../../utils/multer/s3.config");
const uuid_1 = require("uuid");
class ChatService {
    chatModel = new repository_1.ChatRepository(Chat_model_1.ChatModel);
    userModel = new repository_1.UserRepository(model_1.UserModel);
    constructor() { }
    getChat = async (req, res) => {
        const { userId } = req.params;
        const { page, size } = req.query;
        const chat = await this.chatModel.findOneChat({
            filter: {
                participants: {
                    $all: [
                        req.user?._id,
                        mongoose_1.Types.ObjectId.createFromHexString(userId),
                    ],
                },
                group: { $exists: false },
            },
            options: {
                populate: [
                    {
                        path: "participants",
                        select: "firstName lastName profilePicture email username gender",
                    },
                ],
            },
            page,
            size,
        });
        if (!chat) {
            throw new error_response_1.NotFoundException("Fail to found this chatting ");
        }
        return (0, success_response_1.successResponse)({ res, data: { chat } });
    };
    getChattingGroup = async (req, res) => {
        const { groupId } = req.params;
        const { page, size } = req.query;
        const groups = await this.chatModel.findGroups({
            filter: {
                _id: mongoose_1.Types.ObjectId.createFromHexString(groupId),
                participants: { $in: req.user?._id },
                group: { $exists: true },
            },
            options: {
                populate: [
                    {
                        path: "messages.createdBy",
                        select: "firstName lastName profilePicture email username gender",
                    },
                ],
            },
            page,
            size,
        });
        if (!groups) {
            throw new error_response_1.NotFoundException("Fail to found this groups ");
        }
        return (0, success_response_1.successResponse)({ res, data: { groups } });
    };
    createChattingGroup = async (req, res) => {
        const { participants, group } = req.body;
        console.log({ participants, group });
        console.log();
        const dbParticipants = participants.map((id) => mongoose_1.Types.ObjectId.createFromHexString(id));
        const users = await this.userModel.find({
            filter: {
                _id: { $in: dbParticipants },
                friends: { $in: req.user?._id },
            },
        });
        console.log({ users });
        if (users.length !== participants.length) {
            throw new error_response_1.BadRequestException("One or more participants not found.");
        }
        let group_image = undefined;
        const roomId = group.replaceAll(/\s+/g, "_") + "_" + (0, uuid_1.v4)();
        if (req.file) {
            group_image = await (0, s3_config_1.uploadFile)({
                path: `chat/${roomId}`,
                file: req.file,
            });
        }
        dbParticipants.push(req.user?._id);
        const [chat] = await this.chatModel.create({
            data: [
                {
                    participants: dbParticipants,
                    group,
                    roomId,
                    group_image: group_image,
                    createdBy: req.user?._id,
                    messages: [],
                },
            ],
        });
        if (!chat) {
            if (group_image) {
                await (0, s3_config_1.deleteFile)({ Key: group_image });
            }
            throw new error_response_1.BadRequestException("Fail to generate this group");
        }
        return (0, success_response_1.successResponse)({
            res,
            data: { chat },
            statusCode: 201,
        });
    };
    sayHi = ({ message, socket, callback, io }) => {
        try {
            callback ? callback("Hello from BE to FE") : undefined;
        }
        catch (error) {
            socket.emit("custom_error", error);
        }
    };
    sendMessage = async ({ content, socket, sendTo, io }) => {
        try {
            const createdBy = socket.credentials?.user?._id;
            console.log({ sendTo, content, createdBy });
            const user = await this.userModel.findOne({
                filter: {
                    _id: mongoose_1.Types.ObjectId.createFromHexString(sendTo),
                    friends: { $in: createdBy },
                },
            });
            if (!user) {
                throw new error_response_1.NotFoundException("User Not found");
            }
            const chat = await this.chatModel.findOneAndUpdate({
                filter: {
                    participants: {
                        $all: [
                            createdBy,
                            mongoose_1.Types.ObjectId.createFromHexString(sendTo),
                        ],
                    },
                    group: { $exists: false },
                },
                update: {
                    $push: {
                        messages: {
                            content,
                            createdBy,
                        },
                    },
                },
                options: { new: true },
            });
            if (!chat) {
                const [newChat] = (await this.chatModel.create({
                    data: [
                        {
                            createdBy,
                            messages: [{ content, createdBy }],
                            participants: [
                                createdBy,
                                mongoose_1.Types.ObjectId.createFromHexString(sendTo),
                            ],
                        },
                    ],
                })) || [];
                if (!newChat) {
                    throw new error_response_1.BadRequestException("Failed to create new chat");
                }
            }
            io?.to(gateway_1.connectedSocket.get(createdBy.toString())).emit("successMessage", { content });
            io?.to(gateway_1.connectedSocket.get(sendTo)).emit("newMessage", {
                content,
                from: socket.credentials?.user,
            });
        }
        catch (error) {
            socket.emit("custom_error", error);
        }
    };
    sendGroupMessage = async ({ content, socket, groupId, io, }) => {
        try {
            const createdBy = socket.credentials?.user?._id;
            const chat = await this.chatModel.findOneAndUpdate({
                filter: {
                    _id: mongoose_1.Types.ObjectId.createFromHexString(groupId),
                    group: { $exists: true },
                    participants: { $in: createdBy },
                },
                update: {
                    $addToSet: { messages: { createdBy, content } },
                },
                options: { new: true },
            });
            if (!chat) {
                throw new error_response_1.NotFoundException("chat Not found");
            }
            console.log({ chat });
            io?.to(gateway_1.connectedSocket.get(createdBy.toString())).emit("successMessage", { content });
            io?.to(chat.roomId).emit("newMessage", {
                content,
                from: socket.credentials?.user,
                groupId,
            });
        }
        catch (error) {
            socket.emit("custom_error", error);
        }
    };
    joinRoom = async ({ roomId, socket, io }) => {
        try {
            const chat = await this.chatModel.findOne({
                filter: {
                    roomId,
                    group: { $exists: true },
                    participants: { $in: socket.credentials?.user._id },
                },
            });
            if (!chat) {
                throw new error_response_1.NotFoundException("Fail to matching room");
            }
            console.log({ join: roomId });
            socket.join(chat.roomId);
        }
        catch (error) {
            socket.emit("custom_error", error);
        }
    };
}
exports.ChatService = ChatService;
exports.default = new ChatService();

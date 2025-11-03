import type { Request, Response } from "express";
import { successResponse } from "../../utils/response/success.response";

import { ChatModel } from "../../DB/model/Chat.model";
import { Types } from "mongoose";
import { ChatRepository, UserRepository } from "../../DB/repository";
import {
    BadRequestException,
    NotFoundException,
} from "../../utils/response/error.response";
import { IGetChatResponse } from "./chat.entities";
import { IUser, UserModel } from "../../DB/model";
import { connectedSocket } from "../gateway/gateway";
import { deleteFile, uploadFile } from "../../utils/multer/s3.config";
import { v4 as uuid } from "uuid";
import {
    ICreateChattingGroupDto,
    IGetChatParamsDto,
    IGetChatQueryDto,
    IGetChattingGroupDto,
    IJoinRoomDto,
    ISayHiDto,
    ISendGroupMessageDto,
    ISendMessageDto,
} from "./chat.dto";
export class ChatService {
    chatModel = new ChatRepository(ChatModel);
    userModel = new UserRepository(UserModel);
    constructor() {}
    // REST
    getChat = async (req: Request, res: Response): Promise<Response> => {
        const { userId } = req.params as IGetChatParamsDto;
        const { page, size }: IGetChatQueryDto = req.query;
        const chat = await this.chatModel.findOneChat({
            filter: {
                participants: {
                    $all: [
                        req.user?._id,
                        Types.ObjectId.createFromHexString(userId),
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
            throw new NotFoundException("Fail to found this chatting ");
        }
        return successResponse<IGetChatResponse>({ res, data: { chat } });
    };
    getChattingGroup = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const { groupId } = req.params as IGetChattingGroupDto;
        const { page, size }: IGetChatQueryDto = req.query;
        const groups = await this.chatModel.findGroups({
            filter: {
                _id: Types.ObjectId.createFromHexString(groupId),
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
            throw new NotFoundException("Fail to found this groups ");
        }
        return successResponse({ res, data: { groups } });
    };
    createChattingGroup = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const { participants, group }: ICreateChattingGroupDto = req.body;
        console.log({ participants, group });
        console.log();

        const dbParticipants = participants.map((id) =>
            Types.ObjectId.createFromHexString(id)
        );

        const users = await this.userModel.find({
            filter: {
                _id: { $in: dbParticipants },
                friends: { $in: req.user?._id },
            },
        });
        console.log({ users });
        if (users.length !== participants.length) {
            throw new BadRequestException(
                "One or more participants not found."
            );
        }
        let group_image: string | undefined = undefined;
        const roomId = group.replaceAll(/\s+/g, "_") + "_" + uuid();
        if (req.file) {
            group_image = await uploadFile({
                path: `chat/${roomId}`,
                file: req.file as Express.Multer.File,
            });
        }
        dbParticipants.push(req.user?._id as Types.ObjectId);
        const [chat] = await this.chatModel.create({
            data: [
                {
                    participants: dbParticipants,
                    group,
                    roomId,
                    group_image: group_image as string,
                    createdBy: req.user?._id as Types.ObjectId,
                    messages: [],
                },
            ],
        });
        if (!chat) {
            if (group_image) {
                await deleteFile({ Key: group_image });
            }
            throw new BadRequestException("Fail to generate this group");
        }
        return successResponse<IGetChatResponse>({
            res,
            data: { chat },
            statusCode: 201,
        });
    };

    // ======================= IO ====================
    // SAY-HI
    sayHi = ({ message, socket, callback, io }: ISayHiDto) => {
        try {
            // console.log({ message });
            callback ? callback("Hello from BE to FE") : undefined;
        } catch (error) {
            socket.emit("custom_error", error);
        }
    };
    // SEND-MESSAGE
    sendMessage = async ({ content, socket, sendTo, io }: ISendMessageDto) => {
        try {
            const createdBy = socket.credentials?.user?._id as Types.ObjectId;
            console.log({ sendTo, content, createdBy });
            const user = await this.userModel.findOne({
                filter: {
                    _id: Types.ObjectId.createFromHexString(sendTo),
                    friends: { $in: createdBy },
                },
            });
            if (!user) {
                throw new NotFoundException("User Not found");
            }
            const chat = await this.chatModel.findOneAndUpdate({
                filter: {
                    participants: {
                        $all: [
                            createdBy,
                            Types.ObjectId.createFromHexString(sendTo),
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
                const [newChat] =
                    (await this.chatModel.create({
                        data: [
                            {
                                createdBy,
                                messages: [{ content, createdBy }],
                                participants: [
                                    createdBy as Types.ObjectId,
                                    Types.ObjectId.createFromHexString(sendTo),
                                ],
                            },
                        ],
                    })) || [];
                if (!newChat) {
                    throw new BadRequestException("Failed to create new chat");
                }
            }
            io?.to(connectedSocket.get(createdBy.toString()) as string[]).emit(
                "successMessage",
                { content }
            );
            io?.to(connectedSocket.get(sendTo) as string[]).emit("newMessage", {
                content,
                from: socket.credentials?.user,
            });
        } catch (error) {
            socket.emit("custom_error", error);
        }
    };
    // SEND-GROUP-MESSAGE
    sendGroupMessage = async ({
        content,
        socket,
        groupId,
        io,
    }: ISendGroupMessageDto) => {
        try {
            const createdBy = socket.credentials?.user?._id as Types.ObjectId;
            const chat = await this.chatModel.findOneAndUpdate({
                filter: {
                    _id: Types.ObjectId.createFromHexString(groupId),
                    group: { $exists: true },
                    participants: { $in: createdBy },
                },
                update: {
                    $addToSet: { messages: { createdBy, content } },
                },
                options: { new: true },
            });

            if (!chat) {
                throw new NotFoundException("chat Not found");
            }
            console.log({ chat });

            io?.to(connectedSocket.get(createdBy.toString()) as string[]).emit(
                "successMessage",
                { content }
            );
            io?.to(chat.roomId as string).emit("newMessage", {
                content,
                from: socket.credentials?.user as IUser,
                groupId,
            });
        } catch (error) {
            socket.emit("custom_error", error);
        }
    };
    // JOIN_ROOM
    joinRoom = async ({ roomId, socket, io }: IJoinRoomDto) => {
        try {
            const chat = await this.chatModel.findOne({
                filter: {
                    roomId,
                    group: { $exists: true },
                    // participants: { $in: socket.credentials?.user.id },
                    participants: { $in: socket.credentials?.user._id },
                },
            });
            if (!chat) {
                throw new NotFoundException("Fail to matching room");
            }
            console.log({ join: roomId });

            // socket.join(roomId as string);
            socket.join(chat.roomId as string);
        } catch (error) {
            socket.emit("custom_error", error);
        }
    };
}

export default new ChatService();

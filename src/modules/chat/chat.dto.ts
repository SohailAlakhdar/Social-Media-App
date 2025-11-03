import { Server } from "socket.io";
import { IAuthSocket } from "../gateway/inerface.gateway";
import { z } from "zod";

import {
    createChattingGroup,
    getChat,
    getChattingGroup,
} from "./chat.validation";

export interface IMainDto {
    socket: IAuthSocket;
    io?: Server;
}
export interface ISayHiDto extends IMainDto {
    message: string;
    callback?: any;
}
export interface ISendMessageDto extends IMainDto {
    content: string;
    sendTo: string;
}
export interface ISendGroupMessageDto extends IMainDto {
    content: string;
    groupId: string;
}
export interface IJoinRoomDto extends IMainDto {
    roomId: string;
}

export type IGetChatParamsDto = z.infer<typeof getChat.params>;
export type IGetChatQueryDto = z.infer<typeof getChat.query>;
export type ICreateChattingGroupDto = z.infer<typeof createChattingGroup.body>;
export type IGetChattingGroupDto = z.infer<typeof getChattingGroup.params>;

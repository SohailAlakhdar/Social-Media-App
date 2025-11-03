import { ChatEvent } from "./chat.event";
import { IAuthSocket } from "../gateway/inerface.gateway";
import { Server } from "socket.io";

export class ChatGateway {
    private chatEvent: ChatEvent = new ChatEvent();
    constructor() {}
    register = (socket: IAuthSocket, io: Server) => {
        this.chatEvent.sayHi(socket , io);
        this.chatEvent.sendMessage(socket , io);
        this.chatEvent.joinRoom(socket , io);
        this.chatEvent.sendGroupMessage(socket , io);
    };
}

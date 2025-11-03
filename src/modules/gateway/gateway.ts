import { Server as HttpServer } from "node:http";
import { IAuthSocket } from "./inerface.gateway";
import { decodedToken, tokenEnum } from "../../utils/security/token.security";
import { Server } from "socket.io";
import { ChatGateway } from "../chat";
import { BadRequestException } from "../../utils/response/error.response";

export const connectedSocket = new Map<string, string[]>();
let io: Server | undefined = undefined;
export const initializeIo = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
        },
    });
    // middleware
    io.use(async (socket: IAuthSocket, next) => {
        try {
            const { user, decoded } = await decodedToken({
                authorization:
                    (socket.handshake.auth?.authorization as string) || "",
                tokenType: tokenEnum.access,
            });
            socket.credentials = { user, decoded };
            const sockets = connectedSocket.get(user._id.toString()) || [];
            sockets.push(socket.id);
            // console.log(sockets);
            connectedSocket.set(user._id.toString(), sockets);
            console.log({ connectedSocket });
            next();
        } catch (error) {
            console.log(error);
            next(new Error("Authentication error")); // Pass error to reject connection
        }
    });
    // DisConnection
    function disConnection(socket: IAuthSocket) {
        socket.on("disconnect", () => {
            const userId = socket.credentials?.user._id?.toString();
            if (userId && connectedSocket.has(userId)) {
                let sockets = connectedSocket.get(userId)!;
                sockets = sockets.filter((id) => id !== socket.id);
                if (sockets.length === 0) {
                    connectedSocket.delete(userId);
                    getIo().emit("offline_user", userId);
                } else {
                    connectedSocket.set(userId, sockets);
                }
            }
            // console.log(`Socket disconnected: ${socket.id}`);
            console.log({ After_Disconnected: connectedSocket });
        });
        socket.on("connect_error", (err: Error) => {
            console.error("Socket connection error:", err.message);
        });
    }

    const chatGateway: ChatGateway = new ChatGateway();
    io.on("connection", (socket: IAuthSocket) => {
        chatGateway.register(socket, getIo());
        disConnection(socket);
    });
};

export const getIo = (): Server => {
    if (!io) {
        throw new BadRequestException("Fai to establish server socket Io");
    }
    return io;
};

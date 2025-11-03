"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = exports.initializeIo = exports.connectedSocket = void 0;
const token_security_1 = require("../../utils/security/token.security");
const socket_io_1 = require("socket.io");
const chat_1 = require("../chat");
const error_response_1 = require("../../utils/response/error.response");
exports.connectedSocket = new Map();
let io = undefined;
const initializeIo = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*",
        },
    });
    io.use(async (socket, next) => {
        try {
            const { user, decoded } = await (0, token_security_1.decodedToken)({
                authorization: socket.handshake.auth?.authorization || "",
                tokenType: token_security_1.tokenEnum.access,
            });
            socket.credentials = { user, decoded };
            const sockets = exports.connectedSocket.get(user._id.toString()) || [];
            sockets.push(socket.id);
            exports.connectedSocket.set(user._id.toString(), sockets);
            console.log({ connectedSocket: exports.connectedSocket });
            next();
        }
        catch (error) {
            console.log(error);
            next(new Error("Authentication error"));
        }
    });
    function disConnection(socket) {
        socket.on("disconnect", () => {
            const userId = socket.credentials?.user._id?.toString();
            if (userId && exports.connectedSocket.has(userId)) {
                let sockets = exports.connectedSocket.get(userId);
                sockets = sockets.filter((id) => id !== socket.id);
                if (sockets.length === 0) {
                    exports.connectedSocket.delete(userId);
                    (0, exports.getIo)().emit("offline_user", userId);
                }
                else {
                    exports.connectedSocket.set(userId, sockets);
                }
            }
            console.log({ After_Disconnected: exports.connectedSocket });
        });
        socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
        });
    }
    const chatGateway = new chat_1.ChatGateway();
    io.on("connection", (socket) => {
        chatGateway.register(socket, (0, exports.getIo)());
        disConnection(socket);
    });
};
exports.initializeIo = initializeIo;
const getIo = () => {
    if (!io) {
        throw new error_response_1.BadRequestException("Fai to establish server socket Io");
    }
    return io;
};
exports.getIo = getIo;

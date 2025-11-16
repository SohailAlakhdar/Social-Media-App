"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const path_1 = require("path");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: (0, path_1.resolve)("./config/.env.environment") });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const modules_1 = require("./modules");
const node_util_1 = require("node:util");
const node_stream_1 = require("node:stream");
const error_response_1 = require("./utils/response/error.response");
const connection_db_1 = require("./DB/connection.db");
const createS3WriteStreamPipe = (0, node_util_1.promisify)(node_stream_1.pipeline);
const s3_config_1 = require("./utils/multer/s3.config");
const s3_config_2 = require("./utils/multer/s3.config");
const success_response_1 = require("./utils/response/success.response");
const gateway_1 = require("./modules/gateway/gateway");
const chat_1 = require("./modules/chat");
const express_2 = require("graphql-http/lib/use/express");
const authentication_middlewares_1 = require("./middlewares/authentication.middlewares");
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes",
    statusCode: 429,
});
const bootstrap = async () => {
    const port = process.env.PORT || 3000;
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
    app.use(limiter);
    app.all("/graphql", (0, authentication_middlewares_1.authentication)(), (0, express_2.createHandler)({
        schema: modules_1.schema,
        context: (req) => ({
            user: req.raw.user,
        }),
    }));
    await (0, connection_db_1.connectDB)();
    app.get("/test", async (req, res) => {
        const { Key } = req.query;
        const result = await (0, s3_config_1.deleteFile)({
            Key: Key,
        });
        return res.json({ message: "Done", data: { result } });
    });
    app.get("/upload/pre-signed/*path", async (req, res) => {
        const { downloadName, downloadBoolean } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        console.log({ KEY: Key });
        const url = await (0, s3_config_2.createGetPreSignedLink)({
            Key: Key,
            downloadName: downloadName,
            downloadBoolean: downloadBoolean,
        });
        return res.json({ message: "Done", data: { url } });
    });
    app.get("/upload/*path", async (req, res) => {
        const { downloadName, downloadBoolean, } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const s3Response = await (0, s3_config_1.getFile)({ Key });
        if (!s3Response.Body) {
            throw new error_response_1.BadRequestException("Fail to fetch this data");
        }
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Content-type", `${s3Response.ContentType || "application/octet-stream"}`);
        if (downloadBoolean === "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${downloadName || Key.split("/").pop()}"`);
        }
        return await createS3WriteStreamPipe(s3Response.Body, res);
    });
    app.get("/delete/", async (req, res) => {
        const result = await (0, s3_config_1.deleteFiles)({
            urls: [
                "Route_Social_App/users/68c672b9b423b00ce8a46d0a/4c7f7e27-5316-439a-bf2e-e68dd70806d2_pre_ONE.jpg",
                "Route_Social_App/users/68c672b9b423b00ce8a46d0a/c08ecb4a-3ed7-46b5-972a-3b4a70772e24_pre_ONE.jpg",
            ],
            Quiet: true,
        });
        if (!result) {
            throw new error_response_1.BadRequestException("Fail to fetch this data");
        }
        return (0, success_response_1.successResponse)({ res, data: { result } });
    });
    app.get("/", (req, res) => {
        res.send("Hello World! , this is my project ::: SOCIAL MEDIA APP 😊");
    });
    app.use("/auth", modules_1.authRouter);
    app.use("/user", modules_1.userRouter);
    app.use("/post", modules_1.postRouter);
    app.use("/chat", chat_1.chatRoter);
    app.use("/*dummy", (req, res) => {
        res.status(404).json({ message: "Not Found this URL" });
    });
    app.use(error_response_1.globalErrorHandling);
    const httpServer = app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port} 🚀`);
    });
    (0, gateway_1.initializeIo)(httpServer);
};
exports.bootstrap = bootstrap;

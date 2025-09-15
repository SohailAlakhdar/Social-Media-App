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
const createS3WriteStreamPipe = (0, node_util_1.promisify)(node_stream_1.pipeline);
const error_response_1 = require("./utils/response/error.response");
const connection_db_1 = require("./DB/connection.db");
const s3_config_1 = require("./utils/multer/s3.config");
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
    await (0, connection_db_1.connectDB)();
    app.get("/", (req, res) => {
        res.send("Hello World! , SOCIAL APP 😊");
    });
    app.get("/test", async (req, res) => {
        const { Key } = req.query;
        const result = await (0, s3_config_1.deleteFile)({
            Key: Key,
        });
        return res.json({ message: "Done", data: { result } });
    });
    app.get("/upload/pre-signed/*path", async (req, res) => {
        const { downloadName, download } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const url = await (0, s3_config_1.createGetPreSignedLink)({
            Key: Key,
            downloadName: downloadName,
            download: download,
        });
        return res.json({ message: "Done", data: { url } });
    });
    app.get("/upload/*path", async (req, res) => {
        const { downloadName, download } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const s3Response = await (0, s3_config_1.getFile)({ Key });
        if (!s3Response.Body) {
            throw new error_response_1.BadRequestException("Fail to fetch this data");
        }
        res.setHeader("Content-type", `${s3Response.ContentType || "application/octet-stream"}`);
        if (download === "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${downloadName || Key.split("/").pop()}"`);
        }
        return await createS3WriteStreamPipe(s3Response.Body, res);
    });
    app.use("/auth", modules_1.authRouter);
    app.use("/user", modules_1.userRouter);
    app.use("/post", modules_1.postRouter);
    app.use("/*dummy", (req, res) => {
        res.status(404).json({ message: "Not Found this URL" });
    });
    app.use(error_response_1.globalErrorHandling);
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port} 🚀`);
    });
};
exports.bootstrap = bootstrap;

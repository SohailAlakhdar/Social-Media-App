// Setup ENV
import { resolve } from "path";
import dotenv from "dotenv";
dotenv.config({ path: resolve("./config/.env.environment") });

// Loading express and types
import express from "express";
import type { Express, Response, Request } from "express";

// third party module
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

//  module routing
import authController from "./modules/auth/auth.controller";
import userController from "./modules/user/user.controller";

//
import { promisify } from "node:util";
import { pipeline } from "node:stream";
const createS3WriteStreamPipe = promisify(pipeline);
//
import {
    BadRequestException,
    globalErrorHandling,
} from "./utils/response/error.response";
import { connectDB } from "./DB/connection.db";
import {
    createGetPreSignedLink,
    deleteFile,
    getFile,
} from "./utils/multer/s3.config";
import { string } from "zod";

// handle base rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message:
        "Too many requests from this IP, please try again after 15 minutes",
    statusCode: 429,
});
// ========================
const bootstrap = async (): Promise<void> => {
    const port: number | string = process.env.PORT || 3000;
    const app: Express = express();

    app.use(express.json()); // Parse JSON request bodies
    app.use(cors()); // Enable CORS
    app.use(helmet()); // For security headers
    // Rate Limiting
    app.use(limiter);

    // DB
    await connectDB();
    // app routing
    app.get("/", (req: Request, res: Response) => {
        res.send("Hello World! , SOCIAL APP 😊");
    });

    // AWS
    app.get("/test", async (req: Request, res: Response): Promise<Response> => {
        const { Key } = req.query as { Key: string };
        const result = await deleteFile({
            Key: Key as string,
        });
        return res.json({ message: "Done", data: { result } });
    });
    app.get(
        "/upload/pre-signed/*path",
        async (req: Request, res: Response): Promise<Response> => {
            const { downloadName, download } = req.query as {
                downloadName?: string;
                download?: string;
            };

            const { path } = req.params as unknown as { path: string[] };
            const Key = path.join("/");
            const url = await createGetPreSignedLink({
                Key: Key as string,
                downloadName: downloadName as string,
                download: download as string,
            });
            return res.json({ message: "Done", data: { url } });
        }
    );
    app.get(
        "/upload/*path",
        async (req: Request, res: Response): Promise<void> => {
            const { downloadName, download } = req.query as {
                downloadName?: string;
                download?: string;
            };
            const { path } = req.params as unknown as { path: string[] };
            const Key = path.join("/");
            const s3Response = await getFile({ Key });
            if (!s3Response.Body) {
                throw new BadRequestException("Fail to fetch this data");
            }
            res.setHeader(
                "Content-type",
                `${s3Response.ContentType || "application/octet-stream"}`
            );
            if (download === "true") {
                // download=true&downloadName=sohail.jpg
                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename="${
                        downloadName || Key.split("/").pop()
                    }"`
                );
            }

            return await createS3WriteStreamPipe(
                s3Response.Body as NodeJS.ReadableStream,
                res
            );
        }
    );
    // app models
    app.use("/auth", authController);
    app.use("/user", userController);
    // dummy
    app.use("/*dummy", (req: Request, res: Response) => {
        res.status(404).json({ message: "Not Found ❌" });
    });
    // global-Error-haldling
    app.use(globalErrorHandling);

    // Server setup
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port} 🚀`);
    });
};
// export default bootstrap;
export { bootstrap };

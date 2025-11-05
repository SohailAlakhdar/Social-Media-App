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
import { authRouter,  userRouter, postRouter, schema } from "./modules";
//
import { promisify } from "node:util";
import { pipeline } from "node:stream";
//
import { BadRequestException, globalErrorHandling } from "./utils/response/error.response";
// DB
import { connectDB } from "./DB/connection.db";

const createS3WriteStreamPipe = promisify(pipeline);
import { deleteFile, deleteFiles, getFile } from "./utils/multer/s3.config";
import { createGetPreSignedLink } from "./utils/multer/s3.config";
import { successResponse } from "./utils/response/success.response";
import { DeleteObjectsCommandOutput } from "@aws-sdk/client-s3";
// Socket.io
import { initializeIo } from "./modules/gateway/gateway";
import { chatRoter } from "./modules/chat";

// GrphQL
import { createHandler } from "graphql-http/lib/use/express";

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

    // Global application middleware
    app.use(express.json()); // Parse JSON request bodies
    app.use(cors()); // Enable CORS
    app.use(helmet()); // For security headers
    app.use(limiter); // Rate Limiting

    // GraphQL
    app.all("/graphql", createHandler({ schema: schema }));

    // DB
    await connectDB();

    // AWS
    // Delet-File
    app.get("/test", async (req: Request, res: Response): Promise<Response> => {
        const { Key } = req.query as { Key: string };
        const result = await deleteFile({
            Key: Key as string,
        });
        return res.json({ message: "Done", data: { result } });
    });
    // Upload-pre-signed-url
    app.get(
        "/upload/pre-signed/*path",
        async (req: Request, res: Response): Promise<Response> => {
            const { downloadName, downloadBoolean } = req.query as {
                downloadName?: string;
                downloadBoolean?: string;
            };
            const { path } = req.params as unknown as { path: string[] };
            const Key = path.join("/");
            console.log({ KEY: Key });
            const url = await createGetPreSignedLink({
                Key: Key as string,
                downloadName: downloadName as string,
                downloadBoolean: downloadBoolean as string,
            });
            return res.json({ message: "Done", data: { url } });
        }
    );
    // upload file
    app.get(
        "/upload/*path",
        async (req: Request, res: Response): Promise<void> => {
            const {
                downloadName,
                downloadBoolean,
            }: { downloadName?: string; downloadBoolean?: string } = req.query;
            const { path } = req.params as unknown as { path: string[] };
            const Key = path.join("/");
            const s3Response = await getFile({ Key });
            if (!s3Response.Body) {
                throw new BadRequestException("Fail to fetch this data");
            }
            res.set("Cross-Origin-Resource-Policy", "cross-origin");
            res.setHeader(
                "Content-type",
                `${s3Response.ContentType || "application/octet-stream"}`
            );
            if (downloadBoolean === "true") {
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
    // Delete Files
    app.get(
        "/delete/",
        async (req: Request, res: Response): Promise<Response> => {
            const result: DeleteObjectsCommandOutput = await deleteFiles({
                urls: [
                    "Route_Social_App/users/68c672b9b423b00ce8a46d0a/4c7f7e27-5316-439a-bf2e-e68dd70806d2_pre_ONE.jpg",
                    "Route_Social_App/users/68c672b9b423b00ce8a46d0a/c08ecb4a-3ed7-46b5-972a-3b4a70772e24_pre_ONE.jpg",
                ],
                Quiet: true,
            });

            if (!result) {
                throw new BadRequestException("Fail to fetch this data");
            }
            return successResponse({ res, data: { result } });
        }
    );

    // app routing
    app.get("/", (req: Request, res: Response) => {
        res.send("Hello World! , this is my project ::: SOCIAL MEDIA APP 😊");
    });
    app.use("/auth", authRouter);
    app.use("/user", userRouter);
    app.use("/post", postRouter);
    app.use("/chat", chatRoter);
    // dummy
    app.use("/*dummy", (req: Request, res: Response) => {
        res.status(404).json({ message: "Not Found this URL" });
    });
    // global-Error-haldling
    app.use(globalErrorHandling);

    // Server setup
    const httpServer = app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port} 🚀`);
    });

    initializeIo(httpServer);
};
// export default bootstrap;
export { bootstrap };

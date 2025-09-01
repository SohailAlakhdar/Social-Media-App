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
import { globalErrorHandling } from "./utils/response/error.response";
import { connectDB } from "./DB/connection.db";

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

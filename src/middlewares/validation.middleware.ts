// src/middleware/validate.ts
import {z} from "zod"
import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { BadRequestException } from "../utils/response/error.response";
type KeyReqType = keyof Request; // | "body"| "params"| "query"| "headers"
type SchemaType = Partial<Record<KeyReqType, ZodType>>; // Record<key, ZodType>
// type ValidationErrorType = Array<{
//     key: KeyReqType;
//     issues: Array<{
//         message: string;
//         path: string | number | symbol | undefined;
//     }>;
// }>;
export const validation =
    (schema: SchemaType) =>
    (req: Request, res: Response, next: NextFunction) => {
        const validationErrors: any[] = [];
        // const validationErrors: ValidationErrorType = [];
        for (const key of Object.keys(schema) as KeyReqType[]) {
            if (!schema[key]) continue;
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                // Format Zod errors to a friendly shape
                const errors = validationResult.error.flatten();
                // console.log(errors);
                throw new BadRequestException("Validation failed", {
                    fieldErrors: errors.fieldErrors, // { email: ["..."], password: ["..."] }
                    formErrors: errors.formErrors, // e.g. refine-level errors
                });
            }
            // why that?
            if (validationErrors.length > 0) {
                throw new BadRequestException("Validation failed", {
                    errors:validationErrors,
                });
            }
        }
        // attach parsed/validated data to request (optional)
        // req.body = validationResult.data;
        return next();
    };

export const generalFields = {
    firstName:z.string() ,
    lastName:z.string() ,
    username: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name is too long")
        .trim().optional(),
    email: z
        .string()
        .email("Invalid email address")
        .transform((s) => s.toLowerCase().trim()),
    password: z.string().min(6, "Password must be at least 6 characters"),
    // .regex(
    //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    //     "Password must be at least 8 characters, include uppercase, lowercase, number, and special character"
    // ),
    confirmPassword: z.string(),
    otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
};

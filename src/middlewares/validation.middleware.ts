// src/middleware/validate.ts
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import type { ZodError, ZodType } from "zod";
import { BadRequestException } from "../utils/response/error.response";
import { Types } from "mongoose";
import { RoleEnum } from "../DB/model/User.model";

type KeyReqType = keyof Request; // | "body"| "params"| "query"| "headers"
type SchemaType = Partial<Record<KeyReqType, ZodType>>; // Record<key, ZodType>
type ValidationErrorType = Array<{
    key: KeyReqType;
    issues: Array<{
        message: string;
        path: (string | number | symbol | undefined)[];
    }>;
}>;
export const validation =
    (schema: SchemaType) =>
    (req: Request, res: Response, next: NextFunction) => {
        const validationErrors: ValidationErrorType = [];
        for (const key of Object.keys(schema) as KeyReqType[]) {
            if (!schema[key]) continue;
            // console.log({ body: req.body, file: req.file, files: req.files });
            if (req.file) {
                req.body.attachment = req.file;
            }
            if (req.files) {
                req.body.attachments = req.files;
            }
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const errors = validationResult.error as ZodError;
                validationErrors.push({
                    key,
                    issues: errors.issues.map((issue) => {
                        return { path: issue.path, message: issue.message };
                    }),
                });
            }
            if (validationErrors.length > 0) {
                throw new BadRequestException("Validation failed", {
                    errors: validationErrors,
                });
            }
        }
        return next() as unknown as NextFunction;
    };

export const generalFields = {
    id: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid id format",
    }),
    firstName: z.string(),
    lastName: z.string(),
    username: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name is too long")
        .trim()
        .optional(),
    email: z
        .string()
        .email("Invalid email address")
        .transform((s) => s.toLowerCase().trim()),
    password: z.string().min(6, "Password must be at least 6 characters"),
    // .regex(
    //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    //     "Password must be at least 6 characters, include uppercase, lowercase, number, and special character"
    // ),
    confirmPassword: z.string(),
    role: z.enum(RoleEnum).default(RoleEnum.user),
    otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
    file: function (mimetype: string[]) {
        return z
            .object({
                fieldname: z.string(),
                originalname: z.string(),
                encoding: z.string(),
                mimetype: z.enum(mimetype),
                buffer: z.instanceof(Buffer).optional(),
                path: z.string().optional(),
                size: z.number(),
            })
            .refine(
                (file) => file.buffer !== undefined || file.path !== undefined,
                {
                    message: "File must have either a buffer or a path",
                    path: ["buffer"], // you can also use ["path"] or leave empty
                }
            );
    },
};

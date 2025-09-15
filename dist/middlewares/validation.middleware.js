"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalFields = exports.validation = void 0;
const zod_1 = require("zod");
const error_response_1 = require("../utils/response/error.response");
const Post_mode_1 = require("../DB/model/Post.mode");
const mongoose_1 = require("mongoose");
const validation = (schema) => (req, res, next) => {
    const validationErrors = [];
    for (const key of Object.keys(schema)) {
        if (!schema[key])
            continue;
        console.log({ body: req.body, file: req.file, files: req.files });
        if (req.file) {
            req.body.attachment = req.file;
        }
        if (req.files) {
            req.body.attachments = req.files;
        }
        const validationResult = schema[key].safeParse(req[key]);
        if (!validationResult.success) {
            const errors = validationResult.error;
            validationErrors.push({
                key,
                issues: errors.issues.map((issue) => {
                    return { path: issue.path, message: issue.message };
                }),
            });
        }
        if (validationErrors.length > 0) {
            throw new error_response_1.BadRequestException("Validation failed", {
                errors: validationErrors,
            });
        }
    }
    return next();
};
exports.validation = validation;
exports.generalFields = {
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    username: zod_1.z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name is too long")
        .trim()
        .optional(),
    email: zod_1.z
        .string()
        .email("Invalid email address")
        .transform((s) => s.toLowerCase().trim()),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: zod_1.z.string(),
    otp: zod_1.z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
    content: zod_1.z.string().min(2).max(50000).optional(),
    availability: zod_1.z.enum(Post_mode_1.AvailabilityEnum).default(Post_mode_1.AvailabilityEnum.public),
    allowComments: zod_1.z.enum(Post_mode_1.AllowCommentsEnum).default(Post_mode_1.AllowCommentsEnum.allow),
    tags: zod_1.z
        .array(zod_1.z.string().refine((data) => {
        return mongoose_1.Types.ObjectId.isValid(data);
    }, { error: "Invalid user Id" }))
        .max(10)
        .optional(),
    file: function (mimetype) {
        return zod_1.z
            .object({
            fieldname: zod_1.z.string(),
            originalname: zod_1.z.string(),
            encoding: zod_1.z.string(),
            mimetype: zod_1.z.enum(mimetype),
            buffer: zod_1.z.instanceof(Buffer).optional(),
            path: zod_1.z.string().optional(),
            size: zod_1.z.number(),
        })
            .refine((file) => file.buffer !== undefined || file.path !== undefined, {
            message: "File must have either a buffer or a path",
            path: ["buffer"],
        });
    },
};

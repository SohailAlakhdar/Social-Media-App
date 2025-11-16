"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalFields = exports.graphValidation = exports.validation = void 0;
const zod_1 = require("zod");
const error_response_1 = require("../utils/response/error.response");
const mongoose_1 = require("mongoose");
const User_model_1 = require("../DB/model/User.model");
const graphql_1 = require("graphql");
const validation = (schema) => (req, res, next) => {
    const validationErrors = [];
    for (const key of Object.keys(schema)) {
        if (!schema[key])
            continue;
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
const graphValidation = async (schema, args) => {
    const validationResult = await schema.safeParseAsync(args);
    if (!validationResult.success) {
        const ZErrors = validationResult.error;
        throw new graphql_1.GraphQLError("Validation ERror", {
            extensions: {
                statusCode: 400,
                issue: {
                    key: "args",
                    issues: ZErrors.issues.map((issue) => {
                        return { path: issue.path, message: issue.message };
                    }),
                },
            },
        });
    }
};
exports.graphValidation = graphValidation;
exports.generalFields = {
    id: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
        message: "Invalid id format",
    }),
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
    role: zod_1.z.enum(User_model_1.RoleEnum).default(User_model_1.RoleEnum.user),
    otp: zod_1.z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
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

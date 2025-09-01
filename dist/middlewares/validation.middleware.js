"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalFields = exports.validation = void 0;
const zod_1 = require("zod");
const error_response_1 = require("../utils/response/error.response");
const validation = (schema) => (req, res, next) => {
    const validationErrors = [];
    for (const key of Object.keys(schema)) {
        if (!schema[key])
            continue;
        const validationResult = schema[key].safeParse(req[key]);
        if (!validationResult.success) {
            const errors = validationResult.error.flatten();
            // console.log(errors);
            throw new error_response_1.BadRequestException("Validation failed", {
                fieldErrors: errors.fieldErrors,
                formErrors: errors.formErrors,
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
        .trim().optional(),
    email: zod_1.z
        .string()
        .email("Invalid email address")
        .transform((s) => s.toLowerCase().trim()),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: zod_1.z.string(),
    otp: zod_1.z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
};

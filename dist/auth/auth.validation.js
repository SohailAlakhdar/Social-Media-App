"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupSchema = exports.confirmEmailSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const validation_middleware_1 = require("../middlewares/validation.middleware");
exports.loginSchema = {
    body: zod_1.z.object({
        email: validation_middleware_1.generalFields.email,
        password: validation_middleware_1.generalFields.password,
    }),
};
exports.confirmEmailSchema = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.generalFields.email,
        otp: validation_middleware_1.generalFields.otp,
    }),
};
exports.signupSchema = {
    body: exports.loginSchema.body
        .extend({
        username: validation_middleware_1.generalFields.username,
        confirmPassword: validation_middleware_1.generalFields.confirmPassword,
    })
        .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Passwords do not match",
                path: ["confirmPassword"],
            });
        }
    }),
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyForgotPassword = exports.forgotPassword = exports.signup = exports.confirmEmail = exports.LoginWithGoogle = exports.signupWithGoogle = exports.login = void 0;
const zod_1 = require("zod");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
exports.login = {
    body: zod_1.z.object({
        email: validation_middleware_1.generalFields.email,
        password: validation_middleware_1.generalFields.password,
    }),
};
exports.signupWithGoogle = {
    body: zod_1.z.strictObject({
        idToken: zod_1.z.string(),
    }),
};
exports.LoginWithGoogle = {
    body: zod_1.z.object({
        idToken: zod_1.z.string(),
    }),
};
exports.confirmEmail = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.generalFields.email,
        otp: validation_middleware_1.generalFields.otp,
    }),
};
exports.signup = {
    body: exports.login.body
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
exports.forgotPassword = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.generalFields.email,
    }),
};
exports.verifyForgotPassword = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.generalFields.email,
        otp: validation_middleware_1.generalFields.otp,
    }),
};
exports.resetPassword = {
    body: zod_1.z
        .strictObject({
        email: validation_middleware_1.generalFields.email,
        otp: validation_middleware_1.generalFields.otp,
        password: validation_middleware_1.generalFields.password,
        confirmPassword: validation_middleware_1.generalFields.confirmPassword,
    })
        .refine((data) => {
        return (data.password !== data.confirmPassword) ? {
            message: "password doesn't mismatch",
            path: ["confirmPassword"],
        } : null;
    }),
};

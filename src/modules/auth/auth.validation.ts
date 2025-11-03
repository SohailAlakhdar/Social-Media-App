import { z } from "zod";
import { generalFields } from "../../middlewares/validation.middleware";

export const login = {
    body: z.object({
        email: generalFields.email,
        password: generalFields.password,
    }),
};
export const signupWithGoogle = {
    body: z.strictObject({
        idToken: z.string(),
    }),
};

export const LoginWithGoogle = {
    body: z.object({
        idToken: z.string(),
    }),
};
export const confirmEmail = {
    body: z.strictObject({
        email: generalFields.email,
        otp: generalFields.otp,
    }),
};

export const signup = {
    body: login.body
        .extend({
            username: generalFields.username,
            confirmPassword: generalFields.confirmPassword,
            role: generalFields.role,
        })
        .superRefine((data, ctx) => {
            if (data.password !== data.confirmPassword) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Passwords do not match",
                    path: ["confirmPassword"],
                });
            }
        }),
};

export const forgotPassword = {
    body: z.strictObject({
        email: generalFields.email,
    }),
};
export const verifyForgotPassword = {
    body: z.strictObject({
        email: generalFields.email,
        otp: generalFields.otp,
    }),
};
export const resetPassword = {
    body: z
        .strictObject({
            email: generalFields.email,
            otp: generalFields.otp,
            password: generalFields.password,
            confirmPassword: generalFields.confirmPassword,
        })
        .refine((data) => {
            return data.password !== data.confirmPassword
                ? {
                      message: "password doesn't mismatch",
                      path: ["confirmPassword"],
                  }
                : null;
        }),
};


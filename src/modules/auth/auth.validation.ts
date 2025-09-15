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
            //  Or strictObject
            // firstName:generalFields.firstName,
            // lastName:generalFields.lastName,
            username: generalFields.username,
            confirmPassword: generalFields.confirmPassword,
        })
        .superRefine((data, ctx) => {
            // ctx is ZodContext
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
export const verifyForgotPassword  = {
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
            return (data.password !== data.confirmPassword) ? {
                message: "password doesn't mismatch",
                path: ["confirmPassword"],
            } : null;
        }),
};

// export type LoginInput = z.infer<typeof login.body>;
// export type SignupInput = z.infer<typeof signup.body>;

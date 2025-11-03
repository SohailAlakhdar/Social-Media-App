import { z } from "zod";
import { LogoutEnum } from "../../utils/security/token.security";
import { Types } from "mongoose";
import { RoleEnum } from "../../DB/model";

export const LogoutSchema = {
    body: z.strictObject({
        flag: z.enum(LogoutEnum).default(LogoutEnum.only),
    }),
};
export const freezeAccount = {
    params: z
        .object({
            userId: z
                .string()
                .optional()
                .refine((val) => !val || Types.ObjectId.isValid(val), {
                    message: "Invalid ObjectId format",
                    path: ["userId"],
                }),
        })
        .optional(),
};
export const hardDeleteAccount = {
    params: z.object({
        userId: z
            .string()
            .refine((val) => !val || Types.ObjectId.isValid(val), {
                message: "Invalid ObjectId format",
                path: ["userId"],
            }),
    }),
};
export const restoreAccount = {
    params: z.object({
        userId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: "Invalid ObjectId format",
            path: ["userId"],
        }),
    }),
};
export const changeRole = {
    params: z.strictObject({
        userId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: "Invalid ObjectId format",
            path: ["userId"],
        }),
    }),
    body: z.strictObject({
        role: z.enum(RoleEnum),
    }),
};
export const sendFriendRequest = {
    params: z.strictObject({
        userId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: "Invalid ObjectId format",
            path: ["userId"],
        }),
    }),
};
export const acceptFriendRequest = {
    params: z.strictObject({
        requestId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: "Invalid ObjectId format",
            path: ["requestId"],
        }),
    }),
};

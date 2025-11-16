"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcome = exports.acceptFriendRequest = exports.sendFriendRequest = exports.changeRole = exports.restoreAccount = exports.hardDeleteAccount = exports.freezeAccount = exports.LogoutSchema = void 0;
const zod_1 = require("zod");
const token_security_1 = require("../../utils/security/token.security");
const mongoose_1 = require("mongoose");
const model_1 = require("../../DB/model");
exports.LogoutSchema = {
    body: zod_1.z.strictObject({
        flag: zod_1.z.enum(token_security_1.LogoutEnum).default(token_security_1.LogoutEnum.only),
    }),
};
exports.freezeAccount = {
    params: zod_1.z
        .object({
        userId: zod_1.z
            .string()
            .optional()
            .refine((val) => !val || mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid ObjectId format",
            path: ["userId"],
        }),
    })
        .optional(),
};
exports.hardDeleteAccount = {
    params: zod_1.z.object({
        userId: zod_1.z
            .string()
            .refine((val) => !val || mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid ObjectId format",
            path: ["userId"],
        }),
    }),
};
exports.restoreAccount = {
    params: zod_1.z.object({
        userId: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid ObjectId format",
            path: ["userId"],
        }),
    }),
};
exports.changeRole = {
    params: zod_1.z.strictObject({
        userId: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid ObjectId format",
            path: ["userId"],
        }),
    }),
    body: zod_1.z.strictObject({
        role: zod_1.z.enum(model_1.RoleEnum),
    }),
};
exports.sendFriendRequest = {
    params: zod_1.z.strictObject({
        userId: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid ObjectId format",
            path: ["userId"],
        }),
    }),
};
exports.acceptFriendRequest = {
    params: zod_1.z.strictObject({
        requestId: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid ObjectId format",
            path: ["requestId"],
        }),
    }),
};
exports.welcome = zod_1.z.strictObject({
    name: zod_1.z.string().min(2),
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePost = exports.listPost = exports.likePost = exports.createPost = void 0;
const zod_1 = require("zod");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const cloud_multer_1 = require("../../utils/multer/cloud.multer");
const Post_mode_1 = require("../../DB/model/Post.mode");
exports.createPost = {
    body: zod_1.z
        .strictObject({
        content: zod_1.z.string().min(2).max(50000).optional(),
        attachments: zod_1.z
            .array(validation_middleware_1.generalFields.file(cloud_multer_1.fileValidation.image))
            .max(2)
            .optional(),
        availability: zod_1.z
            .enum(Post_mode_1.AvailabilityEnum)
            .default(Post_mode_1.AvailabilityEnum.public),
        allowComments: zod_1.z
            .enum(Post_mode_1.AllowCommentsEnum)
            .default(Post_mode_1.AllowCommentsEnum.allow),
        tags: zod_1.z.array(validation_middleware_1.generalFields.id).max(10).optional(),
    })
        .superRefine((data, ctx) => {
        if (!data.content &&
            (!data.attachments || data.attachments.length === 0)) {
            ctx.addIssue({
                code: "custom",
                message: "You must provide either content or at least one attachment",
                path: ["content"],
            });
        }
        if (data.tags?.length &&
            data.tags.length !== [...new Set(data.tags)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["tags"],
                message: "Duplicate tags Users",
            });
        }
    }),
};
exports.likePost = {
    params: zod_1.z.strictObject({
        postId: validation_middleware_1.generalFields.id,
    }),
    query: zod_1.z.strictObject({
        action: zod_1.z.enum(["like", "unlike"]).default("like"),
    }),
};
exports.listPost = {
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .optional()
            .transform((s) => Number(s || "1"))
            .refine((n) => Number.isInteger(n) && n >= 1),
        size: zod_1.z
            .string()
            .optional()
            .transform((s) => Number(s || "5"))
            .refine((n) => Number.isInteger(n) && n >= 1 && n <= 100),
    }),
};
exports.updatePost = {
    params: zod_1.z.strictObject({
        postId: validation_middleware_1.generalFields.id,
    }),
    body: zod_1.z
        .strictObject({
        content: zod_1.z.string().min(2).max(50000).optional(),
        allowComments: zod_1.z.enum(Post_mode_1.AllowCommentsEnum).optional(),
        availability: zod_1.z.enum(Post_mode_1.AvailabilityEnum).optional(),
        attachments: zod_1.z
            .array(validation_middleware_1.generalFields.file(cloud_multer_1.fileValidation.image))
            .max(2)
            .optional(),
        removedAttachments: zod_1.z.array(zod_1.z.string()).max(2).optional(),
        tags: zod_1.z.array(validation_middleware_1.generalFields.id).max(10).optional(),
        removedTags: zod_1.z.array(validation_middleware_1.generalFields.id).max(10).optional(),
    })
        .superRefine((data, ctx) => {
        if (!data.content &&
            (!data.attachments || data.attachments.length === 0)) {
            ctx.addIssue({
                code: "custom",
                message: "You must provide either content or at least one attachment",
                path: ["content"],
            });
        }
        if (data.tags?.length &&
            data.tags.length !== [...new Set(data.tags)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["tags"],
                message: "Duplicate tags Users",
            });
        }
        if (data.removedTags?.length &&
            data.removedTags.length !==
                [...new Set(data.removedTags)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["removedTags"],
                message: "Duplicate removedTags Users",
            });
        }
        if (!Object.values(data)?.length) {
            ctx.addIssue({
                code: "custom",
                message: "All fields are empty",
            });
        }
    }),
};

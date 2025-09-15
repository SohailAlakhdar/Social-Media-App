"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePost = exports.createPost = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const cloud_multer_1 = require("../../utils/multer/cloud.multer");
exports.createPost = {
    body: zod_1.z
        .strictObject({
        content: validation_middleware_1.generalFields.content,
        attachments: zod_1.z
            .array(validation_middleware_1.generalFields.file(cloud_multer_1.fileValidation.image))
            .max(2)
            .optional(),
        availability: validation_middleware_1.generalFields.availability,
        allowComments: validation_middleware_1.generalFields.allowComments,
        tags: validation_middleware_1.generalFields.tags,
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
    body: zod_1.z.object({
        postId: zod_1.z
            .string()
            .min(1, "postId is required")
            .refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid postId format",
        }),
    }),
};

import { Schema, Types } from "mongoose";
import { z } from "zod";
import { generalFields } from "../../middlewares/validation.middleware";
import { fileValidation } from "../../utils/multer/cloud.multer";

export const createPost = {
    body: z
        .strictObject({
            content: generalFields.content,
            // attachments: generalFields.attachments,
            attachments: z
                .array(generalFields.file(fileValidation.image))
                .max(2)
                .optional(),
            availability: generalFields.availability,
            allowComments: generalFields.allowComments,
            tags: generalFields.tags,
        })
        .superRefine((data, ctx) => {
            if (
                !data.content &&
                (!data.attachments || data.attachments.length === 0)
            ) {
                ctx.addIssue({
                    code: "custom",
                    message:
                        "You must provide either content or at least one attachment",
                    path: ["content"], // you could also point to "attachments"
                });
            }
            if (
                data.tags?.length &&
                data.tags.length !== [...new Set(data.tags)].length
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["tags"],
                    message: "Duplicate tags Users",
                });
            }
        }),
};
export const likePost = {
    body: z.object({
        postId: z
            .string()
            .min(1, "postId is required")
            .refine((val) => Types.ObjectId.isValid(val), {
                message: "Invalid postId format",
            }),
    }),
};

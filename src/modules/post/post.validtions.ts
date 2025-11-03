import { z } from "zod";
import { generalFields } from "../../middlewares/validation.middleware";
import { fileValidation } from "../../utils/multer/cloud.multer";
import { AllowCommentsEnum, AvailabilityEnum } from "../../DB/model/Post.model";

export const createPost = {
    body: z
        .strictObject({
            content: z.string().min(2).max(50000).optional(),
            attachments: z
                .array(generalFields.file(fileValidation.image))
                .max(2)
                .optional(),
            availability: z
                .enum(AvailabilityEnum)
                .default(AvailabilityEnum.public),
            allowComments: z
                .enum(AllowCommentsEnum)
                .default(AllowCommentsEnum.allow),
            tags: z.array(generalFields.id).max(10).optional(),
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
    params: z.strictObject({
        postId: generalFields.id,
    }),
    query: z.strictObject({
        action: z.enum(["like", "unlike"]).default("like"),
    }),
};
export const listPost = {
    query: z.object({
        page: z
            .string()
            .optional()
            .transform((s) => Number(s || "1"))
            .refine((n) => Number.isInteger(n) && n >= 1),
        size: z
            .string()
            .optional()
            .transform((s) => Number(s || "5"))
            .refine((n) => Number.isInteger(n) && n >= 1 && n <= 100),
    }),
};

export const updatePost = {
    params: z.strictObject({
        postId: generalFields.id,
    }),
    body: z
        .strictObject({
            content: z.string().min(2).max(50000).optional(),
            allowComments: z.enum(AllowCommentsEnum).optional(),
            availability: z.enum(AvailabilityEnum).optional(),
            attachments: z
                .array(generalFields.file(fileValidation.image))
                .max(2)
                .optional(),
            removedAttachments: z.array(z.string()).max(2).optional(),
            tags: z.array(generalFields.id).max(10).optional(),
            removedTags: z.array(generalFields.id).max(10).optional(),
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
                    path: ["content"],
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
            if (
                data.removedTags?.length &&
                data.removedTags.length !==
                    [...new Set(data.removedTags)].length
            ) {
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

import { z } from "zod";
import { generalFields } from "../../middlewares/validation.middleware";
import { fileValidation } from "../../utils/multer/cloud.multer";

export const createPost = {
    params: z.strictObject({
        postId: generalFields.id,
    }),
    body: z
        .strictObject({
            content: z.string().min(2).max(50000).optional(),
            attachments: z
                .array(generalFields.file(fileValidation.image))
                .max(2)
                .optional(),
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
export const replyOnComment = {
    params: createPost.params.extend({
        commentId: generalFields.id,
    }),
    body: createPost.body,
};

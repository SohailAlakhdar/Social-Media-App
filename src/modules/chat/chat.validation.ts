import { z } from "zod";
import { generalFields } from "../../middlewares/validation.middleware";
import { fileValidation } from "../../utils/multer/cloud.multer";

export const getChat = {
    params: z.strictObject({
        userId: generalFields.id,
    }),
    query: z.strictObject({
        page: z.coerce.number().int().min(1).max(30).optional(),
        size: z.coerce.number().int().min(1).max(30).optional(),
    }),
};
export const createChattingGroup = {
    body: z
        .strictObject({
            participants: z.array(generalFields.id).min(1),
            group: z.string().min(2).max(50000),
            attachment: generalFields.file(fileValidation.image),
        })
        .superRefine((data, ctx) => {
            if (
                data.participants?.length &&
                data.participants.length !==
                    [...new Set(data.participants)].length
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["participants"],
                    message: "Duplicate participants Users",
                });
            }
        }),
};

export const getChattingGroup = {
    params: z.strictObject({
        groupId: generalFields.id,
    }),
    query: z.strictObject({
        page: z.coerce.number().int().min(1).max(30).optional(),
        size: z.coerce.number().int().min(1).max(30).optional(),
    }),
};

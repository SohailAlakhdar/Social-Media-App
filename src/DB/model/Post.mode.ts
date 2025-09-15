import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export enum AllowCommentsEnum {
    allow = "allow",
    deny = "deny",
}
export enum AvailabilityEnum {
    public = "public",
    friends = "friends",
    onlyMe = "only-me",
}
export interface IPost {
    // Define the properties of a Post, for example:
    // title: string;
    content?: string;
    attachement?: string[];
    assetsFolderId: string;

    allowComments: AllowCommentsEnum;
    availability: AvailabilityEnum;

    tags?: Types.ObjectId[];
    likes: Types.ObjectId[];

    freezedBy?: Types.ObjectId;
    freezedAt?: Date;

    restoredBy?: Types.ObjectId;
    restoredAt?: Date;

    createdBy?: Types.ObjectId;
    createdAt?: Date;

    updatedAt?: Date;
}

const PostScehma = new Schema<IPost>(
    {
        content: {
            type: String,
            minLength: 2,
            maxLength: 500000,
            required: function () {
                return !this.attachement?.length;
            },
        },
        attachement: [String],
        assetsFolderId: { type: String, required: true },

        allowComments: {
            type: String,
            enum: AllowCommentsEnum,
            default: AllowCommentsEnum.allow,
        },
        availability: {
            type: String,
            enum: AvailabilityEnum,
            default: AvailabilityEnum.public,
        },

        tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
        likes: [{ type: Schema.Types.ObjectId, ref: "User" }],

        freezedBy: { type: Schema.Types.ObjectId, ref: "User" },
        freezedAt: Date,

        restoredBy: { type: Schema.Types.ObjectId, ref: "User" },
        restoredAt: Date,

        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    }
);

export type HPostDocument = HydratedDocument<IPost>;
export const PostModel = models.Post || model<IPost>("Post", PostScehma);

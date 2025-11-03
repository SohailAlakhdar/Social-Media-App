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

export enum ActionLikeEnum {
    like = "like",
    unlike = "unlike",
}
export interface IPost {
    // Define the properties of a Post, for example:
    // title: string;
    content?: string;
    attachments?: string[];
    removedAttachement?: string[];
    assetsFolderId?: string;
    allowComments: AllowCommentsEnum;
    availability: AvailabilityEnum;

    tags?: Types.ObjectId[];
    removedTags?: Types.ObjectId[];
    likes?: Types.ObjectId[];
    except?: Types.ObjectId[];
    only?: Types.ObjectId[];

    freezedBy?: Types.ObjectId;
    freezedAt?: Date;

    restoredBy?: Types.ObjectId;
    restoredAt?: Date;

    createdBy?: Types.ObjectId;
    createdAt?: Date;

    updatedAt?: Date;
}

const postSchema = new Schema<IPost>(
    {
        content: {
            type: String,
            minLength: 2,
            maxLength: 500000,
            required: function () {
                return !this.attachments?.length;
            },
        },

        attachments: [String],
        // removedAttachement: [String],
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

        likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
        // removedTags: [{ type: Schema.Types.ObjectId, ref: "User" }],

        // except: [{ type: Schema.Types.ObjectId, ref: "User" }],
        // only: [{ type: Schema.Types.ObjectId, ref: "User" }],

        freezedBy: { type: Schema.Types.ObjectId, ref: "User" },
        freezedAt: Date,

        restoredBy: { type: Schema.Types.ObjectId, ref: "User" },
        restoredAt: Date,

        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        strictQuery: true,
    }
);

postSchema.pre(
    ["findOneAndUpdate", "updateOne", "countDocuments"],
    async function (next) {
        const query = this.getQuery();
        if (query.paranoid === false) {
            this.setQuery({ ...query });
        } else {
            this.setQuery({ ...query, freezedAt: { $exists: false } });
        }
    }
);
postSchema.pre(["find", "findOne"], async function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
});

postSchema.virtual("comments", {
    localField: "_id",
    foreignField: "postId",
    ref: "Comment",
    // justOne: true,
});

export type HPostDocument = HydratedDocument<IPost>;
export const PostModel = models.Post || model<IPost>("Post", postSchema);

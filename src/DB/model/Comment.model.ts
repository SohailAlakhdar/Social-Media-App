import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { IPost } from "./Post.model";

export interface IComment {
    postId: Types.ObjectId | Partial<IPost>;
    commentId?: Types.ObjectId;
    content?: string;
    attachments?: string[];

    tags?: Types.ObjectId[];
    likes?: Types.ObjectId[];

    freezedBy?: Types.ObjectId;
    freezedAt?: Date;

    restoredBy?: Types.ObjectId;
    restoredAt?: Date;

    createdBy?: Types.ObjectId;
    createdAt?: Date;

    updatedAt?: Date;
}

const commentSchema = new Schema<IComment>(
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
        likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
        postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
        commentId: { type: Schema.Types.ObjectId, ref: "Comment" },

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
commentSchema.pre(
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
commentSchema.pre(["find", "findOne"], async function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
});

commentSchema.virtual("replies", {
    localField: "_id",
    foreignField: "commentId",
    ref: "Comment",
    // justOne: true,
});
export const CommentModel =
    models.Comment || model<IComment>("Comment", commentSchema);
export type HCommentDocument = HydratedDocument<IComment>;

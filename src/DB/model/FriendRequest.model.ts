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

export interface IFriendRequest {
    createdBy: Types.ObjectId;
    acceptedAt?: Date;
    sendTo: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>(
    {
        createdBy: { type: Schema.Types.ObjectId },
        acceptedAt: Date,
        sendTo: { type: Schema.Types.ObjectId },
    },
    {
        timestamps: true,
        strictQuery: true,
    }
);

friendRequestSchema.pre(
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

friendRequestSchema.pre(["find", "findOne"], async function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
});

export type HFriendRequestDocument = HydratedDocument<IFriendRequest>;
export const FriendRequestModel =
    models.friendRequest ||
    model<IFriendRequest>("FriendRequest", friendRequestSchema);

import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface IMessage {
    content: string;
    createdBy: Types.ObjectId;

    createdAt?: Date;
    updatedAt?: Date;
}
export type HMessageDocument = HydratedDocument<IMessage>;

export interface IChat {
    // ------OVO
    participants: Types.ObjectId[];
    messages: IMessage[];
    // ---------OVM
    group?: string;
    group_image?: string;
    roomId?: string;

    createdBy: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
export type HChatDocument = HydratedDocument<IChat>;

// ------------Schemas-------------------
export const messageSchema = new Schema<IMessage>(
    {
        content: { type: String },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);
export const chatSchema = new Schema<IChat>(
    {
        participants: [
            { type: Schema.Types.ObjectId, required: true, ref: "User" },
        ],
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        messages: [messageSchema],
        // messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
        group: { type: String },
        group_image: { type: String },
        roomId: {
            type: String,
            required: function (this: IChat) {
                return this.roomId;
            },
        },
    },
    { timestamps: true }
);
// ---------------- Models ----------------
// export const MessageModel =
//     models.Message || model<IMessage>("Message", messageSchema);
export const ChatModel = models.Chat || model<IChat>("Chat", chatSchema);

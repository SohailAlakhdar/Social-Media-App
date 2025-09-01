import { HydratedDocument } from "mongoose";
import { model, models, Schema, Types } from "mongoose";

export interface IToken {
    jti: string;
    expiresIn: number;
    userId: Types.ObjectId;
}

const tokenSchema = new Schema<IToken>(
    {
        jti: { type: String, required: true, unique: true },
        expiresIn: { type: Number, required: true },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);
export const TokenModel = models.token || model<IToken>("Token", tokenSchema);
export type HTokenDocument = HydratedDocument<IToken>;

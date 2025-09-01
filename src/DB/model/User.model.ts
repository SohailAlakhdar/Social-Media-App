import { model, models, Schema, Types, HydratedDocument } from "mongoose";
export enum GenderEnum {
    male = "male",
    female = "female",
}
export enum RoleEnum {
    user = "user",
    admin = "admin",
}
export enum providerEnum {
    GOOGLE = "GOOGLE",
    SYSTEM = "SYSTEM",
}

export interface IUser {
    _id: Types.ObjectId;

    firstName: string;
    lastName: string;
    username?: string;

    email: string;
    confirmEmailOtp: string;
    confirmedAt?: Date;

    password: string;
    resetPasswordToken?: string;
    verifyForgotPassword?: Date;
    changeCredentialsAt?: Date;

    phone?: string;
    address?: string;

    gender: GenderEnum;
    role: RoleEnum;
    provider: providerEnum;

    profileImage?: string;
    coverImage?: string[];

    createdAt: Date;
    updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },

        email: { type: String, required: true, unique: true },
        confirmEmailOtp: { type: String },
        confirmedAt: Date,

        password: {
            type: String,
            required: function () {
                return this.provider === providerEnum.GOOGLE ? false : true;
            },
        },
        resetPasswordToken: { type: String },
        verifyForgotPassword: Date,

        changeCredentialsAt: Date,

        phone: { type: String },
        address: { type: String },

        gender: { type: String, enum: GenderEnum, default: GenderEnum.male },
        role: { type: String, enum: RoleEnum, default: RoleEnum.user },
        provider: {
            type: String,
            enum: providerEnum,
            default: providerEnum.SYSTEM,
        },

        profileImage: { type: String },
        coverImage: [String],
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

UserSchema.virtual("username")
    .set(function (value: string) {
        const [firstName, lastName] = value.split(" ") || [];
        this.set({ firstName, lastName });
    })
    .get(function () {
        return this.firstName + " " + this.lastName;
    });

export const UserModel = models.User || model<IUser>("User", UserSchema);
export type HUserDocument = HydratedDocument<IUser>;
// export const HUserDocument = HydratedDocument<IUser>;

import { model, models, Schema, Types, HydratedDocument } from "mongoose";
import { generateHash } from "../../utils/security/hash.security";
import { emailEvent } from "../../utils/event/email.event";
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

    slug: string;
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
    freezedAt?: Date;
    _plainOtp?: string;
}

const UserSchema = new Schema<IUser>(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        slug: { type: String, required: true },

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
        freezedAt: Date,

        _plainOtp: { type: String },
        profileImage: { type: String },
        coverImage: [String],
    },
    {
        timestamps: true,
        strictQuery: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

UserSchema.virtual("username")
    .set(function (value: string) {
        const [firstName, lastName] = value.split(" ") || [];
        this.set({ firstName, lastName, slug: value.replaceAll(/\s+/g, "-") });
    })
    .get(function () {
        return this.firstName + " " + this.lastName;
    });

UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await generateHash(this.password);
    }
    if (this.isModified("confirmEmailOtp")) {
        this._plainOtp = this.confirmEmailOtp;
        this.confirmEmailOtp = await generateHash(this.confirmEmailOtp);
    }
});
UserSchema.post("save", async function (doc, next) {
    console.log({ _plainOtp: doc._plainOtp });

    if (doc._plainOtp) {
        emailEvent.emit("ConfirmEmail", {
            to: doc.email,
            subject: "Welcome to Our App",
            otp: doc._plainOtp,
        });
    }
});

UserSchema.pre(["find", "findOne"], async function (next) {
    const query = this.getQuery();
    console.log({ query: query });
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    // if (query.paranoid?.length) {
    //     this.setQuery({ ...query , freezedAt:{$exists:false}});
    // }
});

export const UserModel = models.User || model<IUser>("User", UserSchema);
export type HUserDocument = HydratedDocument<IUser>;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.providerEnum = exports.RoleEnum = exports.GenderEnum = void 0;
const mongoose_1 = require("mongoose");
const hash_security_1 = require("../../utils/security/hash.security");
const email_event_1 = require("../../utils/event/email.event");
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["male"] = "male";
    GenderEnum["female"] = "female";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["user"] = "user";
    RoleEnum["admin"] = "admin";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
var providerEnum;
(function (providerEnum) {
    providerEnum["GOOGLE"] = "GOOGLE";
    providerEnum["SYSTEM"] = "SYSTEM";
})(providerEnum || (exports.providerEnum = providerEnum = {}));
const UserSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
UserSchema.virtual("username")
    .set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName, slug: value.replaceAll(/\s+/g, "-") });
})
    .get(function () {
    return this.firstName + " " + this.lastName;
});
UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await (0, hash_security_1.generateHash)(this.password);
    }
    if (this.isModified("confirmEmailOtp")) {
        this._plainOtp = this.confirmEmailOtp;
        this.confirmEmailOtp = await (0, hash_security_1.generateHash)(this.confirmEmailOtp);
    }
});
UserSchema.post("save", async function (doc, next) {
    console.log({ _plainOtp: doc._plainOtp });
    if (doc._plainOtp) {
        email_event_1.emailEvent.emit("ConfirmEmail", {
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
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)("User", UserSchema);

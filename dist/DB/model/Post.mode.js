"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = exports.AvailabilityEnum = exports.AllowCommentsEnum = void 0;
const mongoose_1 = require("mongoose");
var AllowCommentsEnum;
(function (AllowCommentsEnum) {
    AllowCommentsEnum["allow"] = "allow";
    AllowCommentsEnum["deny"] = "deny";
})(AllowCommentsEnum || (exports.AllowCommentsEnum = AllowCommentsEnum = {}));
var AvailabilityEnum;
(function (AvailabilityEnum) {
    AvailabilityEnum["public"] = "public";
    AvailabilityEnum["friends"] = "friends";
    AvailabilityEnum["onlyMe"] = "only-me";
})(AvailabilityEnum || (exports.AvailabilityEnum = AvailabilityEnum = {}));
const PostScehma = new mongoose_1.Schema({
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
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    freezedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    freezedAt: Date,
    restoredBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    restoredAt: Date,
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
}, {
    timestamps: true,
});
exports.PostModel = mongoose_1.models.Post || (0, mongoose_1.model)("Post", PostScehma);

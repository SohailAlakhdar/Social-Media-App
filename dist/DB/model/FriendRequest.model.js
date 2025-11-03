"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestModel = exports.ActionLikeEnum = exports.AvailabilityEnum = exports.AllowCommentsEnum = void 0;
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
var ActionLikeEnum;
(function (ActionLikeEnum) {
    ActionLikeEnum["like"] = "like";
    ActionLikeEnum["unlike"] = "unlike";
})(ActionLikeEnum || (exports.ActionLikeEnum = ActionLikeEnum = {}));
const friendRequestSchema = new mongoose_1.Schema({
    createdBy: { type: mongoose_1.Schema.Types.ObjectId },
    acceptedAt: Date,
    sendTo: { type: mongoose_1.Schema.Types.ObjectId },
}, {
    timestamps: true,
    strictQuery: true,
});
friendRequestSchema.pre(["findOneAndUpdate", "updateOne", "countDocuments"], async function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
});
friendRequestSchema.pre(["find", "findOne"], async function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
});
exports.FriendRequestModel = mongoose_1.models.friendRequest ||
    (0, mongoose_1.model)("FriendRequest", friendRequestSchema);

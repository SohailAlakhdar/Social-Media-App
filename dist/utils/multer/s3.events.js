"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Event = void 0;
const user_repository_1 = require("../../DB/repository/user.repository");
const User_model_1 = require("./../../DB/model/User.model");
const node_events_1 = require("node:events");
const s3_config_1 = require("./s3.config");
exports.s3Event = new node_events_1.EventEmitter();
exports.s3Event.on("profileImageUpload", (data) => {
    setTimeout(async () => {
        const userModel = new user_repository_1.UserRepository(User_model_1.UserModel);
        try {
            await (0, s3_config_1.getFile)({ Key: data.Key });
            await userModel.updateOne({
                filter: { id: data.userId },
                update: {
                    $unset: { tempProfileImage: 1 },
                },
            });
            await (0, s3_config_1.deleteFile)({ Key: data.oldKey });
        }
        catch (error) {
            if (error.Code == "NoSuchKey") {
                await userModel.updateOne({
                    filter: { id: data.userId },
                    update: {
                        profileImage: data.oldKey,
                        $unset: { tempProfileImage: 1 },
                    },
                });
            }
        }
    }, data.expiresIn || Number(process.env.AWS_PRE_SIGNED_URL_EXPIRES_IN_SECONDS) * 1000);
});

import { UserRepository } from "../../DB/repository/user.repository";
import { UserModel } from "./../../DB/model/User.model";
import { EventEmitter } from "node:events";
import { deleteFile, getFile } from "./s3.config";
export const s3Event = new EventEmitter();
s3Event.on("profileImageUpload", (data) => {
    // console.log({ data });
    setTimeout(async () => {
        const userModel = new UserRepository(UserModel);
        try {
            await getFile({ Key: data.Key });
            // console.log(`Done😘`);
            await userModel.updateOne({
                filter: { id: data.userId },
                update: {
                    $unset: { tempProfileImage: 1 },
                },
            });
            await deleteFile({ Key: data.oldKey });
        } catch (error: any) {
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

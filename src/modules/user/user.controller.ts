import {
    authentication,
    authorization,
} from "./../../middlewares/authentication.middlewares";
import Router from "express";
const router = Router();
import userService from "./user.service";
import * as validators from "./user.validation";
import { validation } from "./../../middlewares/validation.middleware";
import { tokenEnum } from "../../utils/security/token.security";
import {
    cloudFileUpload,
    fileValidation,
    storageEnum,
} from "../../utils/multer/cloud.multer";
import { endPoint } from "./user.endPoints";
import { chatRoter } from "../chat";


router.use("/:userId/chat", chatRoter);
router.get("/", authentication(), userService.profile);
router.get(
    "/dashboard",
    authorization(endPoint.dashboard),
    userService.dashboard
);
// change-role
router.patch(
    "/:userId/change-role",
    authorization(endPoint.changeRole),
    validation(validators.changeRole),
    userService.changeRole
);
// send-friend-request
router.post(
    "/:userId/send-friend-request",
    authentication(),
    validation(validators.sendFriendRequest),
    userService.sendFriendRequest
);
// accept-friend-request
router.patch(
    "/:requestId/accept-friend-request",
    authentication(),
    validation(validators.acceptFriendRequest),
    userService.acceptFriendRequest
);
// profile-Image
router.patch("/profile-image", authentication(), userService.profileImage);
// Profile-Cover-Image
router.patch(
    "/profile-cover-image",
    authentication(),
    cloudFileUpload({
        validation: fileValidation.image,
        storageApproch: storageEnum.disk,
    }).array("images", 2),
    userService.profileCoverImage
);
// Freeze
router.delete(
    "/freeze-account/{:userId}",
    authentication(),
    validation(validators.freezeAccount),
    userService.freezeAccount
);
// Hard Delete
router.delete(
    "/hard-delete-account/{:userId}",
    authorization(endPoint.hardDeleteAccount),
    validation(validators.hardDeleteAccount),
    userService.hardDeleteAccount
);
// Restore
router.patch(
    "/restore-account/{:userId}",
    authorization(endPoint.restoreAccount),
    validation(validators.restoreAccount),
    userService.restoreAccount
);
// logout
router.post(
    "/logout",
    authentication(),
    validation(validators.LogoutSchema),
    userService.Logout
);
router.get(
    "/refresh-token",
    authentication(tokenEnum.refresh),
    userService.refreshToken
);

export default router;

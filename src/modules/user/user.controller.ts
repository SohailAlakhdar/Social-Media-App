import { authentication } from "./../../middlewares/authentication.middlewares";
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

router.get("/", authentication(), userService.profile);

router.patch(
    "/profile-image",
    authentication(),
    // cloudFileUpload({
    //     validation: fileValidation.image,
    //     storageApproch: storageEnum.memory,
    // }).single("image"),
    userService.profileImage
);
router.patch(
    "/profile-cover-image",
    authentication(),
    cloudFileUpload({
        validation: fileValidation.image,
        storageApproch: storageEnum.disk,

    }).array("images", 2),
    userService.profileCoverImage
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

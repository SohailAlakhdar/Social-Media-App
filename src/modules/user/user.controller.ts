import { authentication } from "./../../middlewares/authentication.middlewares";
import Router from "express";
const router = Router();
import userService from "./user.service";
import * as validators from "./user.validation";
import { validation } from "./../../middlewares/validation.middleware";
import { tokenEnum } from "../../utils/security/token.security";

router.get("/", authentication(), userService.profile);
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

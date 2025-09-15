import { Router } from "express";
const router = Router();
import postService from "./post.service";
import * as validators from "./post.validtions";
import { validation } from "../../middlewares/validation.middleware";
import {
    cloudFileUpload,
    fileValidation,
} from "../../utils/multer/cloud.multer";
import { authentication } from "../../middlewares/authentication.middlewares";

router.post(
    "/createPost",
    cloudFileUpload({ validation: fileValidation.image }).array(
        "attachments",
        2
    ),
    validation(validators.createPost),
    postService.createPost
);
router.post(
    "/:likePost",
    authentication(),
    validation(validators.likePost),
    postService.createPost
);

export default router;

import { Router } from "express";
const router = Router();
import { postService } from "./post.service";
import * as validators from "./post.validtions";
import { validation } from "../../middlewares/validation.middleware";
import {
    cloudFileUpload,
    fileValidation,
} from "../../utils/multer/cloud.multer";
import { authentication } from "../../middlewares/authentication.middlewares";
import { commentRouter } from "../comment";

router.use("/:postId/comment", commentRouter);

router.post(
    "/create-post",
    authentication(),
    cloudFileUpload({ validation: fileValidation.image }).array(
        "attachments",
        2
    ),
    validation(validators.createPost),
    postService.createPost
);
router.patch(
    "/:postId/like",
    authentication(),
    validation(validators.likePost),
    postService.likePost
);
router.patch(
    "/:postId",
    authentication(),
    cloudFileUpload({ validation: fileValidation.image }).array(
        "attachments",
        2
    ),
    validation(validators.updatePost),
    postService.updatePost
);
router.get(
    "/",
    authentication(),
    validation(validators.listPost),
    postService.listPost
);

export default router;

import { validation } from "./../../middlewares/validation.middleware";
import {
    cloudFileUpload,
    fileValidation,
} from "./../../utils/multer/cloud.multer";
import { authentication } from "./../../middlewares/authentication.middlewares";
import { Router } from "express";
const router = Router({ mergeParams: true });
import { commentService } from "./comment.service";
import * as validators from "./comment.validation";

// ------list-comment
router.get("/list-comment", commentService.listComment);
//------create-post
router.post(
    "/create-comment",
    authentication(),
    cloudFileUpload({ validation: fileValidation.image }).array(
        "attachments",
        2
    ),
    validation(validators.createPost),
    commentService.createComment
);
// reply-on-comment
router.post(
    "/:commentId/reply-on-comment",
    authentication(),
    cloudFileUpload({ validation: fileValidation.image }).array(
        "attachments",
        2
    ),
    validation(validators.replyOnComment),
    commentService.replyOnComment
);
export default router;

import { Router } from "express";
const router = Router({ mergeParams: true });
// --------------
import { authentication } from "./../../middlewares/authentication.middlewares";
import * as validator from "./chat.validation";
import { ChatService } from "./chat.service";
import { validation } from "../../middlewares/validation.middleware";
import {
    cloudFileUpload,
    fileValidation,
} from "../../utils/multer/cloud.multer";

const chatService: ChatService = new ChatService();

router.get(
    "/",
    authentication(),
    validation(validator.getChat),
    chatService.getChat
);

router.post(
    "/group",
    authentication(),
    cloudFileUpload({ validation: fileValidation.image }).single("attachment"),
    validation(validator.createChattingGroup),
    chatService.createChattingGroup
);

router.get(
    "/group/:groupId",
    authentication(),
    // cloudFileUpload({ validation: fileValidation.image }).single("attachment"),
    validation(validator.getChattingGroup),
    chatService.getChattingGroup
);

export default router;

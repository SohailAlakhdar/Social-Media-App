import Router from "express";
const router = Router();
import { validation } from "../../middlewares/validation.middleware";
import * as validators from "./auth.validation"
import authService from "./auth.service";


router.post("/signup", validation(validators.signup), authService.signup);
router.patch("/confirm-email", validation(validators.confirmEmail), authService.confirmEmail);
router.post("/login", validation(validators.login), authService.login);

router.patch("/forgot-password", validation(validators.forgotPassword), authService.forgotPassword);
router.patch("/verfiy-forgot-password", validation(validators.verfiyForgotPassword), authService.verifyForgotPassword);
router.patch("/reset-password", validation(validators.resetPassword), authService.resetPassword);

router.post("/signup-with-google", validation(validators.signupWithGoogle), authService.signupWithGoogle);
router.post("/login-with-google", validation(validators.LoginWithGoogle), authService.loginWithGoogle);
export default router;
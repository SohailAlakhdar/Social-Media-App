import * as validators from "./auth.validation"
import {z} from "zod"
export type AuthSignupDto = z.infer <typeof validators.signup.body>
export type AuthLoginDto = z.infer<typeof validators.login.body>
export type AuthConfirmEmailDto = z.infer<typeof validators.confirmEmail.body>
export type  IGmail = z.infer<typeof validators.signupWithGoogle.body>
export type  IForgotPassword = z.infer<typeof validators.forgotPassword.body>
export type  IVerfiyForgotPassword = z.infer<typeof validators.verfiyForgotPassword.body>
export type  IResetPassword = z.infer<typeof validators.resetPassword.body>

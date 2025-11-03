import { freezeAccount, LogoutSchema, restoreAccount } from "./user.validation";
import { z } from "zod";

export type ILogoutDto = z.infer<typeof LogoutSchema.body>;

export type IFreezeAccountDto = z.infer<typeof freezeAccount.params>;
export type IHardDeleteAccountDto = z.infer<typeof freezeAccount.params>;
export type IRestoreAccountDto = z.infer<typeof restoreAccount.params>;


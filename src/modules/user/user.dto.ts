import { LogoutSchema } from './user.validation';
import {z} from "zod";


export type ILogoutDto = z.infer<typeof LogoutSchema.body>
import {z} from 'zod'
import { LogoutEnum } from '../../utils/security/token.security'

export const LogoutSchema = {
    body:z.strictObject({
        flag:z.enum(LogoutEnum).default(LogoutEnum.only)
    })
}
import { RoleEnum } from "../../DB/model/User.model";
export const endPoint = {
    restoreAccount: [RoleEnum.admin],
    hardDeleteAccount: [RoleEnum.admin],
    profile: [RoleEnum.user, RoleEnum.admin],
    welcome: [RoleEnum.user, RoleEnum.admin],
    dashboard: [RoleEnum.admin, RoleEnum.superAdmin],
    changeRole: [RoleEnum.admin, RoleEnum.superAdmin],
};

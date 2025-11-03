import { HChatDocument } from "../../DB/model/Chat.model";
import { HUserDocument } from "../../DB/model/User.model";

export interface IUserResponse {
    user: Partial<HUserDocument>;
}
export interface IProfileResponse {
    user: Partial<HUserDocument>;
    groups?: Partial<HChatDocument>[];
}
export interface IProfileImageResponse {
    url: string;
}

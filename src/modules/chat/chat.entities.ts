// generic "successResponse"
// --------------------

import { HChatDocument } from "../../DB/model/Chat.model";

export interface IGetChatResponse {
    chat: Partial<HChatDocument>;
}

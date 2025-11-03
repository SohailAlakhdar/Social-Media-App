import { IToken as TDocument } from "../model/Token.model";
import { Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
//
export class TokenRepository extends DatabaseRepository<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model);
    }
}

import { IToken as TDocument} from '../model/Token.model';
import { FlattenMaps, HydratedDocument, Model } from "mongoose";
import { DatabaseRepository } from "./Database.repository";
export type Lean<T> = HydratedDocument<FlattenMaps<T>>;
//
export class TokenRepository extends DatabaseRepository<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model);
    }

}

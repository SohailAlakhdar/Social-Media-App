import { IToken as TDocument} from './../model/Token.model';
import { FlattenMaps, HydratedDocument, Model } from "mongoose";
import { databaseRepository } from "./database.repository";
export type Lean<T> = HydratedDocument<FlattenMaps<T>>;
//
export class tokenRepository extends databaseRepository<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model);
    }
}

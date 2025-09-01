import { FlattenMaps, HydratedDocument, Model } from "mongoose";
import { IUser as TDocument } from "../model/User.model";
import { databaseRepository } from "./database.repository";
import { CreateOptions } from "mongoose";
import { BadRequestException } from "../../utils/response/error.response";
export type Lean<T> = HydratedDocument<FlattenMaps<T>>;
// 
export class userRepository extends databaseRepository<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model);
    }
    async createUser({
        data,
        options,
    }: {
        data: Partial<TDocument>[];
        options?: CreateOptions;
    }): Promise<Lean<TDocument> | HydratedDocument<TDocument> | null> {
        const [user] = (await this.model.create(data, options)) || [];
        if (!user) {
            throw new BadRequestException("Error in creating user");
        }
        return user;
        // this returns an array of created documents
    }
}

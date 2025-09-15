import { FlattenMaps, HydratedDocument, Model } from "mongoose";
import { IUser as TDocument } from "../model/User.model";
import { DatabaseRepository } from "./Database.repository";
import { CreateOptions } from "mongoose";
import { BadRequestException } from "../../utils/response/error.response";
export type Lean<T> = HydratedDocument<FlattenMaps<T>>;
//
export class UserRepository extends DatabaseRepository<TDocument> {
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
    }
}

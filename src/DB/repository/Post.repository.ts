import { DatabaseRepository } from "./Database.repository";
import { IPost as TDocument } from "../model/Post.mode";
import { Model } from "mongoose";

export class PostRepository extends DatabaseRepository<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model);
    }
}

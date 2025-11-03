import { DatabaseRepository } from "./database.repository";
import { IComment as TDocument } from "../model/Comment.model";
import { Model } from "mongoose";

export class CommentRepository extends DatabaseRepository<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model);
    }
}

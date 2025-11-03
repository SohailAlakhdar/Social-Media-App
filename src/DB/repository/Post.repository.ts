import { DatabaseRepository } from "./database.repository";
import {  IPost as TDocument } from "../model/Post.model";
import { Model, PopulateOptions, ProjectionType } from "mongoose";
import { RootFilterQuery } from "mongoose";
import { HydratedDocument } from "mongoose";
import { QueryOptions } from "mongoose";
import { CommentModel } from "../model";
import { CommentRepository } from "./comment.repositroy";

export class PostRepository extends DatabaseRepository<TDocument> {
    commentModel = new CommentRepository(CommentModel);
    constructor(protected override readonly model: Model<TDocument>) {
        super(model);
    }
    async countDocuments(filter?: RootFilterQuery<TDocument>): Promise<number> {
        return this.model.countDocuments(filter || {}).exec();
    }
    async findCursor({
        filter,
        select,
        options,
    }: {
        filter?: RootFilterQuery<TDocument>;
        select?: ProjectionType<TDocument> | undefined;
        options?: QueryOptions<TDocument> | undefined;
    }): Promise<
        | {
              post: HydratedDocument<TDocument>;
              comments: HydratedDocument<TDocument>[];
          }[]
        | any
    > {
        let result = [];
        const cursor = this.model
            .find(filter || {})
            .select(select || "")
            .populate(options?.populate as PopulateOptions[])
            .cursor();
        for (
            let doc = await cursor.next();
            doc != null;
            doc = await cursor.next()
        ) {
            const comments = await this.commentModel.find({
                filter: { postId: doc._id, commentId: { $exists: false } },
            });
            result.push({ post: doc, comments });
        }
        return result;
    }
}

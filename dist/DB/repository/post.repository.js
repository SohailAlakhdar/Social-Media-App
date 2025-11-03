"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRepository = void 0;
const database_repository_1 = require("./database.repository");
const model_1 = require("../model");
const comment_repositroy_1 = require("./comment.repositroy");
class PostRepository extends database_repository_1.DatabaseRepository {
    model;
    commentModel = new comment_repositroy_1.CommentRepository(model_1.CommentModel);
    constructor(model) {
        super(model);
        this.model = model;
    }
    async countDocuments(filter) {
        return this.model.countDocuments(filter || {}).exec();
    }
    async findCursor({ filter, select, options, }) {
        let result = [];
        const cursor = this.model
            .find(filter || {})
            .select(select || "")
            .populate(options?.populate)
            .cursor();
        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            const comments = await this.commentModel.find({
                filter: { postId: doc._id, commentId: { $exists: false } },
            });
            result.push({ post: doc, comments });
        }
        return result;
    }
}
exports.PostRepository = PostRepository;

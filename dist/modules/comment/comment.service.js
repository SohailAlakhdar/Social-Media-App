"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = exports.CommentService = void 0;
const Post_model_1 = require("../../DB/model/Post.model");
const User_model_1 = require("../../DB/model/User.model");
const post_repository_1 = require("../../DB/repository/post.repository");
const user_repository_1 = require("../../DB/repository/user.repository");
const success_response_1 = require("../../utils/response/success.response");
const Comment_model_1 = require("../../DB/model/Comment.model");
const comment_repositroy_1 = require("../../DB/repository/comment.repositroy");
const s3_config_1 = require("../../utils/multer/s3.config");
const error_response_1 = require("../../utils/response/error.response");
const post_service_1 = require("../post/post.service");
class CommentService {
    userModel = new user_repository_1.UserRepository(User_model_1.UserModel);
    postModel = new post_repository_1.PostRepository(Post_model_1.PostModel);
    commentModel = new comment_repositroy_1.CommentRepository(Comment_model_1.CommentModel);
    constructor() { }
    listComment = async (req, res) => {
        return (0, success_response_1.successResponse)({ res, data: {} });
    };
    createComment = async (req, res) => {
        const { postId } = req.params;
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                allowComments: Post_model_1.AllowCommentsEnum.allow,
                $or: (0, post_service_1.postAvailability)(req),
            },
        });
        if (!post) {
            throw new error_response_1.NotFoundException("fail to found this post");
        }
        if (req.body?.tags &&
            (await this.userModel.find({
                filter: { _id: { $in: req.body.tags }, paranoid: true },
            })).length !== req.body.tags.length) {
            throw new error_response_1.NotFoundException("Some mentions of the user is not exist in DataBase");
        }
        let attachments = [];
        if (req?.files?.length) {
            attachments =
                (await (0, s3_config_1.uploadFiles)({
                    files: req.files,
                    path: `users/${post.createdBy}/post/${post.assetsFolderId}/comment/`,
                })) || [];
        }
        const [comment] = (await this.commentModel.create({
            data: [
                {
                    ...req.body,
                    attachments,
                    postId,
                    createdBy: req.user?._id,
                },
            ],
        })) || [];
        if (!comment) {
            if (attachments?.length) {
                (0, s3_config_1.deleteFiles)({ urls: attachments });
            }
            throw new error_response_1.BadRequestException("Fail to create this comment");
        }
        return (0, success_response_1.successResponse)({ res, data: { comment } });
    };
    replyOnComment = async (req, res) => {
        const { postId, commentId } = req.params;
        console.log({ postId, commentId });
        const comment = await this.commentModel.findOne({
            filter: {
                _id: commentId,
            },
            options: {
                populate: [
                    {
                        path: "postId",
                        match: {
                            allowComments: Post_model_1.AllowCommentsEnum.allow,
                            $or: (0, post_service_1.postAvailability)(req),
                        },
                    },
                ],
            },
        });
        if (!comment?.postId) {
            throw new error_response_1.NotFoundException("fail to found this post");
        }
        if (req.body?.tags &&
            (await this.userModel.find({
                filter: { _id: { $in: req.body.tags }, paranoid: true },
            })).length !== req.body.tags.length) {
            throw new error_response_1.NotFoundException("Some mentions of the user is not exist in DataBase");
        }
        let attachments = [];
        if (req?.files?.length) {
            let post = comment.postId;
            attachments =
                (await (0, s3_config_1.uploadFiles)({
                    files: req.files,
                    path: `users/${post.createdBy}/post/${post.assetsFolderId}/comment/`,
                })) || [];
        }
        const [reply] = (await this.commentModel.create({
            data: [
                {
                    ...req.body,
                    attachments,
                    postId,
                    commentId,
                    createdBy: req.user?._id,
                },
            ],
        })) || [];
        if (!reply) {
            if (attachments?.length) {
                (0, s3_config_1.deleteFiles)({ urls: attachments });
            }
            throw new error_response_1.BadRequestException("Fail to create this reoly");
        }
        return (0, success_response_1.successResponse)({ res, data: { reply } });
    };
}
exports.CommentService = CommentService;
exports.commentService = new CommentService();

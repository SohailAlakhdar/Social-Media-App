"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = exports.PostService = exports.postAvailability = void 0;
const User_model_1 = require("./../../DB/model/User.model");
const user_repository_1 = require("../../DB/repository/user.repository");
const Post_model_1 = require("../../DB/model/Post.model");
const post_repository_1 = require("../../DB/repository/post.repository");
const error_response_1 = require("../../utils/response/error.response");
const uuid_1 = require("uuid");
const s3_config_1 = require("../../utils/multer/s3.config");
const success_response_1 = require("../../utils/response/success.response");
const mongoose_1 = require("mongoose");
const repository_1 = require("../../DB/repository");
const model_1 = require("../../DB/model");
const gateway_1 = require("../gateway/gateway");
const postAvailability = (req) => {
    return [
        { availability: Post_model_1.AvailabilityEnum.public },
        {
            availability: Post_model_1.AvailabilityEnum.onlyMe,
            createdBy: req.user?._id,
        },
        {
            availability: Post_model_1.AvailabilityEnum.friends,
            createdBy: { $in: req.user?.friends || [] },
        },
        {
            availability: { $ne: Post_model_1.AvailabilityEnum.onlyMe },
            tags: req.user?._id,
        },
    ];
};
exports.postAvailability = postAvailability;
class PostService {
    userModel = new user_repository_1.UserRepository(User_model_1.UserModel);
    postModel = new post_repository_1.PostRepository(Post_model_1.PostModel);
    commentModel = new repository_1.CommentRepository(model_1.CommentModel);
    constructor() { }
    createPost = async (req, res) => {
        if (req.body?.tags &&
            (await this.userModel.find({
                filter: { _id: { $in: req.body.tags }, paranoid: true },
            })).length !== req.body.tags.length) {
            throw new error_response_1.NotFoundException("Some mentions of the user is not exist in DataBase");
        }
        let attachments = [];
        let assetsFolderId = (0, uuid_1.v4)();
        if (req?.files?.length) {
            attachments =
                (await (0, s3_config_1.uploadFiles)({
                    files: req.files,
                    path: `users/${req.user?._id}/post/${assetsFolderId}`,
                })) || [];
        }
        const [post] = (await this.postModel.create({
            data: [
                {
                    ...req.body,
                    attachments,
                    assetsFolderId,
                    createdBy: req.user?._id,
                },
            ],
        })) || [];
        if (!post) {
            if (attachments?.length) {
                (0, s3_config_1.deleteFiles)({ urls: attachments });
            }
            throw new error_response_1.BadRequestException("Fail to create this post");
        }
        return (0, success_response_1.successResponse)({ res, data: { post } });
    };
    likePost = async (req, res) => {
        const { postId } = req.params;
        const { action } = req.query;
        let updateData = {
            $addToSet: { likes: req.user?._id },
        };
        if (action === Post_model_1.ActionLikeEnum.unlike) {
            updateData = { $pull: { llikes: req.user?._id } };
        }
        const post = await this.postModel.findOneAndUpdate({
            filter: {
                _id: postId,
                $or: (0, exports.postAvailability)(req),
            },
            update: updateData,
        });
        if (!post) {
            throw new error_response_1.BadRequestException("not found this post");
        }
        if (action !== Post_model_1.ActionLikeEnum.unlike) {
            (0, gateway_1.getIo)()
                .to(gateway_1.connectedSocket.get(post.createdBy?.toString()))
                .emit("likePost", { postId, userId: req.user?._id });
        }
        return (0, success_response_1.successResponse)({ res, data: { postId, updateData } });
    };
    updatePost = async (req, res) => {
        const { postId } = req.params;
        const post = await this.postModel.findOne({
            filter: { _id: postId, createdBy: req.user?._id },
        });
        if (!post) {
            throw new error_response_1.NotFoundException("not found this post");
        }
        if (req.body?.tags &&
            (await this.userModel.find({
                filter: {
                    _id: { $in: req.body.tags, $ne: req.user?._id },
                    paranoid: true,
                },
            })).length !== req.body.tags.length) {
            throw new error_response_1.NotFoundException("Some mentions of the user is not exist in DataBase");
        }
        let attachments = [];
        if (req?.files?.length) {
            attachments =
                (await (0, s3_config_1.uploadFiles)({
                    files: req.files,
                    path: `users/${req.user?._id}/post/${post.assetsFolderId}`,
                })) || [];
        }
        const updatedPost = await this.postModel.updateOne({
            filter: { _id: postId },
            update: [
                {
                    $set: {
                        content: req.body.content || post.content,
                        allowComments: req.body.allowComments || post.allowComments,
                        availability: req.body.availability || post.availability,
                        attachments: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$attachments",
                                        req.body.removedAttachments || [],
                                    ],
                                },
                                attachments,
                            ],
                        },
                        tags: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$tags",
                                        (req.body.removedTags || []).map((tag) => {
                                            return mongoose_1.Types.ObjectId.createFromHexString(tag);
                                        }),
                                    ],
                                },
                                (req.body.tags || []).map((tag) => {
                                    return mongoose_1.Types.ObjectId.createFromHexString(tag);
                                }),
                            ],
                        },
                    },
                },
                {
                    $set: {
                        __v: { $add: ["$__v", 1] },
                    },
                },
            ],
        });
        if (!updatedPost.modifiedCount) {
            if (attachments?.length) {
                await (0, s3_config_1.deleteFiles)({ urls: attachments });
            }
            throw new error_response_1.BadRequestException("Fail to genetate this post");
        }
        else {
            if (req.body.removedAttachments?.length) {
                await (0, s3_config_1.deleteFiles)({
                    urls: req.body.removedAttachments,
                });
            }
            return (0, success_response_1.successResponse)({ res, data: { updatedPost } });
        }
    };
    listPost = async (req, res) => {
        let page = parseInt(req.query.page) || 1;
        let size = parseInt(req.query.size) || 5;
        if (page < 1) {
            page = 1;
        }
        if (size < 1 || size > 100) {
            size = 5;
        }
        const posts = await this.postModel.paginate({
            filter: {
                $or: (0, exports.postAvailability)(req),
            },
            options: {
                populate: [
                    {
                        path: "comments",
                        match: {
                            freezedAt: { $exists: false },
                            commentId: { $exists: false },
                        },
                        populate: [
                            {
                                path: "replies",
                                match: { freezedAt: { $exists: false } },
                                populate: [
                                    {
                                        path: "replies",
                                        match: {
                                            freezedAt: { $exists: false },
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            page,
            size,
        });
        console.log(posts);
        if (!posts) {
            throw new error_response_1.BadRequestException("not found this post");
        }
        return (0, success_response_1.successResponse)({ res, data: { posts } });
    };
}
exports.PostService = PostService;
exports.postService = new PostService();

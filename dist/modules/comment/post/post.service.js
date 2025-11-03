"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = exports.PostService = exports.likesAvailability = void 0;
const User_model_1 = require("./../../DB/model/User.model");
const User_repository_1 = require("../../DB/repository/User.repository");
const Post_mode_1 = require("../../DB/model/Post.mode");
const Post_repository_1 = require("../../DB/repository/Post.repository");
const error_response_1 = require("../../utils/response/error.response");
const uuid_1 = require("uuid");
const s3_config_1 = require("../../utils/multer/s3.config");
const success_response_1 = require("../../utils/response/success.response");
const mongoose_1 = require("mongoose");
const likesAvailability = (req) => {
    return [
        { availability: Post_mode_1.AvailabilityEnum.public },
        {
            availability: Post_mode_1.AvailabilityEnum.onlyMe,
            createdBy: req.user?._id,
        },
        {
            availability: Post_mode_1.AvailabilityEnum.friends,
            createdBy: { $in: req.user?.friends || [] },
        },
        {
            availability: { $ne: Post_mode_1.AvailabilityEnum.onlyMe },
            tags: req.user?._id,
        },
    ];
};
exports.likesAvailability = likesAvailability;
class PostService {
    userModel = new User_repository_1.UserRepository(User_model_1.UserModel);
    postModel = new Post_repository_1.PostRepository(Post_mode_1.PostModel);
    constructor() { }
    createPost = async (req, res) => {
        if (req.body?.tags &&
            (await this.userModel.find({
                filter: { _id: { $in: req.body.tags }, paranoid: true },
                select: "-removedTags -removedAttachement",
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
        if (action === Post_mode_1.ActionLikeEnum.unlike) {
            updateData = { $pull: { llikes: req.user?._id } };
        }
        const post = await this.postModel.findOneAndUpdate({
            filter: {
                _id: postId,
                $or: (0, exports.likesAvailability)(req),
            },
            update: updateData,
        });
        if (!post) {
            throw new error_response_1.BadRequestException("not found this post");
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
        const { docs: posts, totalDocs, totalPages, page, size, } = await this.postModel.paginate({
            filter: { $or: (0, exports.likesAvailability)(req) },
            options: { sort: { createdAt: -1 } },
            page: parseInt(req.query.page) || 1,
            size: parseInt(req.query.size) || 5,
        });
        console.log(posts.length);
        if (!posts) {
            throw new error_response_1.BadRequestException("not found this post");
        }
        return (0, success_response_1.successResponse)({
            res,
            data: { totalDocs, totalPages, page, size, posts },
        });
    };
}
exports.PostService = PostService;
exports.postService = new PostService();

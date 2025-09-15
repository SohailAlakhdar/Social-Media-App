"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const User_model_1 = require("./../../DB/model/User.model");
const User_repository_1 = require("../../DB/repository/User.repository");
const Post_mode_1 = require("../../DB/model/Post.mode");
const Post_repository_1 = require("../../DB/repository/Post.repository");
const error_response_1 = require("../../utils/response/error.response");
const uuid_1 = require("uuid");
const s3_config_1 = require("../../utils/multer/s3.config");
const success_response_1 = require("../../utils/response/success.response");
class PostService {
    userModel = new User_repository_1.UserRepository(User_model_1.UserModel);
    postModel = new Post_repository_1.PostRepository(Post_mode_1.PostModel);
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
        console.log({ body: req.body });
        const [post] = (await this.postModel.create({
            ...req.body,
            attachments,
            assetsFolderId,
            createdBy: req.user?._id,
        })) || [];
        if (!post) {
            throw new error_response_1.BadRequestException("Fail to create this post");
        }
        return res.status(201).json({ message: "Done", post });
    };
    likePost = async (req, res) => {
        const { postId } = req.params;
        const post = await this.postModel.findOneAndUpdate({
            filter: { _id: postId },
            update: {
                $addToSet: { likes: req.user?._id },
                $inc: { __v: 1 },
            },
        });
        if (!post) {
            throw new error_response_1.NotFoundException("In valid post, not found");
        }
        return (0, success_response_1.successResponse)({ res });
    };
}
exports.PostService = PostService;
exports.default = new PostService();

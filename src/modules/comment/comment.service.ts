import type { Request, Response } from "express";
import {
    AllowCommentsEnum,
    HPostDocument,
    PostModel,
} from "../../DB/model/Post.model";
import { UserModel } from "../../DB/model/User.model";
import { PostRepository } from "../../DB/repository/post.repository";
import { UserRepository } from "../../DB/repository/user.repository";
import { successResponse } from "../../utils/response/success.response";
import { CommentModel } from "../../DB/model/Comment.model";
import { CommentRepository } from "../../DB/repository/comment.repositroy";
import { deleteFiles, uploadFiles } from "../../utils/multer/s3.config";
import {
    BadRequestException,
    NotFoundException,
} from "../../utils/response/error.response";
import { postAvailability } from "../post/post.service";

export class CommentService {
    private userModel = new UserRepository(UserModel);
    private postModel = new PostRepository(PostModel);
    private commentModel = new CommentRepository(CommentModel);
    constructor() {}
    // ListComment
    listComment = async (req: Request, res: Response) => {
        return successResponse({ res, data: {} });
    };

    // CreateComment
    createComment = async (req: Request, res: Response): Promise<Response> => {
        const { postId } = req.params as { postId: string };
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                allowComments: AllowCommentsEnum.allow,
                $or: postAvailability(req),
            },
        });
        if (!post) {
            throw new NotFoundException("fail to found this post");
        }
        if (
            req.body?.tags &&
            (
                await this.userModel.find({
                    filter: { _id: { $in: req.body.tags }, paranoid: true },
                })
            ).length !== req.body.tags.length
        ) {
            throw new NotFoundException(
                "Some mentions of the user is not exist in DataBase"
            );
        }
        let attachments: string[] = [];
        if (req?.files?.length) {
            attachments =
                (await uploadFiles({
                    files: req.files as Express.Multer.File[],
                    path: `users/${post.createdBy}/post/${post.assetsFolderId}/comment/`,
                })) || [];
        }
        const [comment] =
            (await this.commentModel.create({
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
                deleteFiles({ urls: attachments });
            }
            throw new BadRequestException("Fail to create this comment");
        }

        return successResponse({ res, data: { comment } });
    };
    // ReplyOnComment
    replyOnComment = async (req: Request, res: Response): Promise<Response> => {
        const { postId, commentId } = req.params as {
            postId: string;
            commentId: string;
        };
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
                            allowComments: AllowCommentsEnum.allow,
                            $or: postAvailability(req),
                        },
                    },
                ],
            },
        });
        if (!comment?.postId) {
            throw new NotFoundException("fail to found this post");
        }
        if (
            req.body?.tags &&
            (
                await this.userModel.find({
                    filter: { _id: { $in: req.body.tags }, paranoid: true },
                })
            ).length !== req.body.tags.length
        ) {
            throw new NotFoundException(
                "Some mentions of the user is not exist in DataBase"
            );
        }
        let attachments: string[] = [];
        if (req?.files?.length) {
            let post = comment.postId as Partial<HPostDocument>;
            attachments =
                (await uploadFiles({
                    files: req.files as Express.Multer.File[],
                    path: `users/${post.createdBy}/post/${post.assetsFolderId}/comment/`,
                })) || [];
        }
        const [reply] =
            (await this.commentModel.create({
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
                deleteFiles({ urls: attachments });
            }
            throw new BadRequestException("Fail to create this reoly");
        }

        return successResponse({ res, data: { reply } });
    };
}

export const commentService = new CommentService();

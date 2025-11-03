import { UserModel } from "./../../DB/model/User.model";
import { Request, Response } from "express";
import { UserRepository } from "../../DB/repository/user.repository";
import {
    ActionLikeEnum,
    AvailabilityEnum,
    HPostDocument,
    PostModel,
} from "../../DB/model/Post.model";
import { PostRepository } from "../../DB/repository/post.repository";
import {
    BadRequestException,
    NotFoundException,
} from "../../utils/response/error.response";
import { v4 as uuid } from "uuid";
import { deleteFiles, uploadFiles } from "../../utils/multer/s3.config";
import { successResponse } from "../../utils/response/success.response";
import { LikePostQueryInputDto } from "./post.dto";
import { UpdateQuery } from "mongoose";
import { Types } from "mongoose";
import { CommentRepository } from "../../DB/repository";
import { CommentModel } from "../../DB/model";
import { connectedSocket, getIo } from "../gateway/gateway";
// function hasChanged({
//     oldPost,
//     newData,
//     excludeFields = ["__v", "createdAt", "updatedAt"],
// }: {
//     oldPost: any;
//     newData: any;
//     excludeFields?: string[];
// }): boolean {
//     const keys = Object.keys(newData).filter((k) => !excludeFields.includes(k));

//     for (const key of keys) {
//         if (newData[key] !== oldPost[key]) {
//             return true;
//         }
//     }

//     return false;
// }

export const postAvailability = (req: Request) => {
    return [
        { availability: AvailabilityEnum.public },
        {
            availability: AvailabilityEnum.onlyMe,
            createdBy: req.user?._id,
        },
        {
            availability: AvailabilityEnum.friends,
            createdBy: { $in: req.user?.friends || [] },
        },
        {
            availability: { $ne: AvailabilityEnum.onlyMe },
            tags: req.user?._id,
        },
    ];
};

export class PostService {
    private userModel = new UserRepository(UserModel);
    private postModel = new PostRepository(PostModel);
    private commentModel = new CommentRepository(CommentModel);
    constructor() {}
    // Create Post
    createPost = async (req: Request, res: Response): Promise<Response> => {
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
        let assetsFolderId: string = uuid();
        if (req?.files?.length) {
            attachments =
                (await uploadFiles({
                    files: req.files as Express.Multer.File[],
                    path: `users/${req.user?._id}/post/${assetsFolderId}`,
                })) || [];
        }
        const [post] =
            (await this.postModel.create({
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
                deleteFiles({ urls: attachments });
            }
            throw new BadRequestException("Fail to create this post");
        }
        return successResponse({ res, data: { post } });
    };
    // Like Post
    likePost = async (req: Request, res: Response): Promise<Response> => {
        const { postId } = req.params as { postId: string };
        const { action } = req.query as LikePostQueryInputDto;
        let updateData: UpdateQuery<HPostDocument> = {
            $addToSet: { likes: req.user?._id },
        };
        if (action === ActionLikeEnum.unlike) {
            updateData = { $pull: { llikes: req.user?._id } };
        }
        const post = await this.postModel.findOneAndUpdate({
            filter: {
                _id: postId,
                $or: postAvailability(req),
            },
            update: updateData,
        });

        if (!post) {
            throw new BadRequestException("not found this post");
        }
        if (action !== ActionLikeEnum.unlike) {
            getIo()
                .to(
                    connectedSocket.get(
                        post.createdBy?.toString() as string
                    ) as string[]
                )
                .emit("likePost", { postId, userId: req.user?._id });
        }
        return successResponse({ res, data: { postId, updateData } });
    };
    // updatePost
    updatePost = async (req: Request, res: Response): Promise<Response> => {
        const { postId } = req.params as { postId: string };
        const post = await this.postModel.findOne({
            filter: { _id: postId, createdBy: req.user?._id },
        });
        if (!post) {
            throw new NotFoundException("not found this post");
        }
        if (
            req.body?.tags &&
            (
                await this.userModel.find({
                    filter: {
                        _id: { $in: req.body.tags, $ne: req.user?._id },
                        paranoid: true,
                    },
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
                    path: `users/${req.user?._id}/post/${post.assetsFolderId}`,
                })) || [];
        }
        const updatedPost = await this.postModel.updateOne({
            filter: { _id: postId },
            update: [
                {
                    $set: {
                        content: req.body.content || post.content,
                        allowComments:
                            req.body.allowComments || post.allowComments,
                        availability:
                            req.body.availability || post.availability,
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
                                        (req.body.removedTags || []).map(
                                            (tag: string) => {
                                                return Types.ObjectId.createFromHexString(
                                                    tag
                                                );
                                            }
                                        ),
                                    ],
                                },
                                (req.body.tags || []).map((tag: string) => {
                                    return Types.ObjectId.createFromHexString(
                                        tag
                                    );
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
                await deleteFiles({ urls: attachments });
            }
            throw new BadRequestException("Fail to genetate this post");
        } else {
            if (req.body.removedAttachments?.length) {
                await deleteFiles({
                    urls: req.body.removedAttachments,
                });
            }
            return successResponse({ res, data: { updatedPost } });
        }
    };

    listPost = async (req: Request, res: Response): Promise<Response> => {
        // const { postId } = req.params as { postId: string };
        let page = parseInt(req.query.page as string) || 1;
        let size = parseInt(req.query.size as string) || 5;
        if (page < 1) {
            page = 1;
        }
        if (size < 1 || size > 100) {
            size = 5;
        }
        const posts = await this.postModel.paginate({
            filter: {
                $or: postAvailability(req),
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
            throw new BadRequestException("not found this post");
        }
        return successResponse({ res, data: { posts } });
    };
}
export const postService = new PostService();

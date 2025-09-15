import { IUser, UserModel } from "./../../DB/model/User.model";
import { Request, Response } from "express";
import { UserRepository } from "../../DB/repository/User.repository";
import { PostModel } from "../../DB/model/Post.mode";
import { PostRepository } from "../../DB/repository/Post.repository";
import {
    BadRequestException,
    NotFoundException,
} from "../../utils/response/error.response";
import { v4 as uuid } from "uuid";
import { deleteFiles, uploadFiles } from "../../utils/multer/s3.config";
import { successResponse } from "../../utils/response/success.response";
export class PostService {
    private userModel = new UserRepository(UserModel);
    private postModel = new PostRepository(PostModel);
    constructor() {}

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
        console.log({ body: req.body });

        // console.log({
        //     post: await this.postModel.create({
        //         ...req.body,
        //     }),
        // });

        const [post] =
            (await this.postModel.create({
                ...req.body,
                attachments,
                assetsFolderId,
                createdBy: req.user?._id,
            })) || [];
        // successResponse({ res, statusCode: 201 });
        if (!post) {
            // if (attachments?.length) {
            //     deleteFiles({ urls: attachments });
            // }
            throw new BadRequestException("Fail to create this post");
        }
        return res.status(201).json({ message: "Done", post });
    };

    likePost = async (req: Request, res: Response): Promise<Response> => {
        const { postId } = req.params as { postId: string };
        const post = await this.postModel.findOneAndUpdate({
            filter: { _id: postId },
            update: {
                // $push: { likes: req.user?._id },
                $addToSet: { likes: req.user?._id }, // prevents duplicate likes
                $inc: { __v: 1 },
            },
        });
        if (!post) {
            throw new NotFoundException("In valid post, not found");
        }
        return successResponse({ res });
    };
}

export default new PostService();

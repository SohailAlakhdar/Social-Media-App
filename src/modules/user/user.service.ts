import { FriendRequestModel } from "./../../DB/model/FriendRequest.model";
import { Request, Response } from "express";
import {
    IFreezeAccountDto,
    IHardDeleteAccountDto,
    ILogoutDto,
    IRestoreAccountDto,
} from "./user.dto";
import { Types, UpdateQuery } from "mongoose";
import {
    createLoginCredentials,
    createRevokeToken,
    LogoutEnum,
} from "../../utils/security/token.security";
import { UserRepository } from "../../DB/repository/user.repository";
import {
    HUserDocument,
    IUser,
    RoleEnum,
    UserModel,
} from "../../DB/model/User.model";
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from "../../utils/response/error.response";
import { JwtPayload } from "jsonwebtoken";
import {
    createPreSignedUploadLink,
    deleteFiles,
    deleteFolderByPrefix,
    uploadFiles,
} from "../../utils/multer/s3.config";
import { storageEnum } from "../../utils/multer/cloud.multer";
import { successResponse } from "../../utils/response/success.response";
import { s3Event } from "../../utils/multer/s3.events";
import {
    IProfileImageResponse,
    IProfileResponse,
    IUserResponse,
} from "./user.entities";
import { PostRepository } from "../../DB/repository/post.repository";
import { PostModel } from "../../DB/model/Post.model";
import { FriendRequestRepository } from "../../DB/repository/friendRequest.repository";
import { ChatRepository } from "../../DB";
import { ChatModel } from "../../DB/model/Chat.model";

export class UserService {
    private userModel: UserRepository = new UserRepository(UserModel);
    private postModel: PostRepository = new PostRepository(PostModel);
    private chatModel: ChatRepository = new ChatRepository(ChatModel);
    private friendRequestModel: FriendRequestRepository =
        new FriendRequestRepository(FriendRequestModel);
    constructor() {}

    dashboard = async (req: Request, res: Response): Promise<Response> => {
        const result = await Promise.allSettled([
            this.userModel.find({ filter: {} }),
            this.postModel.find({ filter: {} }),
        ]);
        return successResponse({
            res,
            data: { result },
        });
    };
    changeRole = async (req: Request, res: Response): Promise<Response> => {
        const { userId } = req.params as { userId: string };
        const { role } = req.body as { role: RoleEnum };
        let denyRoles: string[] = [role, RoleEnum.superAdmin];
        if (role === RoleEnum.admin) {
            denyRoles.push(RoleEnum.admin);
        }

        const user = await this.userModel.findOneAndUpdate({
            filter: { _id: userId, role: { $nin: denyRoles } },
            update: { role },
            options: { new: true },
        });
        if (!user) {
            throw new NotFoundException("User not found");
        }

        return successResponse({
            res,
            data: { user },
        });
    };
    // Send Friend Request
    // sendFriendRequest = async (
    //     req: Request,
    //     res: Response
    // ): Promise<Response> => {
    //     const { userId } = req.params as { userId: string };
    //     const checkFriendRequest = await this.friendRequestModel.findOne({
    //         filter: {
    //             createdBy: { $in: [req.user?._id, userId] },
    //             sendTo: { $in: [req.user?._id, userId] },
    //         },
    //     });
    //     if (checkFriendRequest) {
    //         throw new NotFoundException("friend request is already created ");
    //     }
    //     // Check user exist
    //     if (
    //         !(await this.userModel.findOneAndUpdate({
    //             filter: {
    //                 _id: userId,
    //             },
    //             update: {},
    //         }))
    //     ) {
    //         throw new NotFoundException("User not found");
    //     }
    //     const sendTo = new Types.ObjectId(userId);
    //     const [friendRequest]: any = await this.friendRequestModel.create({
    //         data: [
    //             {
    //                 sendTo,
    //                 createdBy: req.user?._id as Types.ObjectId,
    //             },
    //         ],
    //     });
    //     return successResponse({
    //         res,
    //         data: { friendRequest },
    //     });
    // };
    sendFriendRequest = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const { userId } = req.params as { userId: string };
        const checkFriendRequest = await this.friendRequestModel.findOne({
            filter: {
                createdBy: { $in: [req.user?._id, userId] },
                sendTo: { $in: [req.user?._id, userId] },
            },
        });
        if (checkFriendRequest) {
            throw new NotFoundException("friend request is already created ");
        }
        // Check user exist
        if (
            !(await this.userModel.findOneAndUpdate({
                filter: {
                    _id: userId,
                },
                update: {},
            }))
        ) {
            throw new NotFoundException("User not found");
        }
        const sendTo = new Types.ObjectId(userId);
        const [friendRequest]: any = await this.friendRequestModel.create({
            data: [
                {
                    sendTo,
                    createdBy: req.user?._id as Types.ObjectId,
                },
            ],
        });
        return successResponse({
            res,
            data: { friendRequest },
        });
    };
    // // Accept Friend Request
    // acceptFriendRequest = async (
    //     req: Request,
    //     res: Response
    // ): Promise<Response> => {
    //     const { requestId } = req.params as { requestId: string };
    //     const friendRequest = await this.friendRequestModel.findOneAndUpdate({
    //         filter: {
    //             _id: requestId,
    //             sendTo: req.user?._id, // Only the receiver can accept
    //             acceptedAt: { $exists: false },
    //         },
    //         update: {
    //             $set: { acceptedAt: new Date() },
    //         },
    //         options: { new: true }, // return updated document
    //     });

    //     if (!friendRequest) {
    //         throw new NotFoundException(
    //             "Friend request not found or already accepted"
    //         );
    //     }
    //     Promise.all([
    //         await this.userModel.updateOne({
    //             filter: { _id: friendRequest.createdBy },
    //             update: { $addToSet: { friends: friendRequest.sendTo } },
    //         }),
    //         await this.userModel.updateOne({
    //             filter: { _id: friendRequest.sendTo },
    //             update: { $addToSet: { friends: friendRequest.createdBy } },
    //         }),
    //     ]);
    //     return successResponse({
    //         res,
    //         data: { friendRequest },
    //     });
    // };
    acceptFriendRequest = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const { requestId } = req.params as { requestId: string };
        const friendRequest = await this.friendRequestModel.findOneAndUpdate({
            filter: {
                _id: requestId,
                sendTo: req.user?._id, // Only the receiver can accept
                acceptedAt: { $exists: false },
            },
            update: {
                $set: { acceptedAt: new Date() },
            },
            options: { new: true }, // return updated document
        });

        if (!friendRequest) {
            throw new NotFoundException(
                "Friend request not found or already accepted"
            );
        }
        Promise.all([
            await this.userModel.updateOne({
                filter: { _id: friendRequest.createdBy },
                update: { $addToSet: { friends: friendRequest.sendTo } },
            }),
            await this.userModel.updateOne({
                filter: { _id: friendRequest.sendTo },
                update: { $addToSet: { friends: friendRequest.createdBy } },
            }),
        ]);
        return successResponse({
            res,
            data: { friendRequest },
        });
    };
    profile = async (req: Request, res: Response): Promise<Response> => {
        const user = await this.userModel.findOne({
            filter: { _id: req.user?._id },
            options: {
                populate: [
                    {
                        path: "friends",
                        select: "firstName lastName email username profilePicture gender",
                    },
                ],
            },
        });
        if (!user) {
            throw new NotFoundException("Fail to found this user");
        }
        const groups = await this.chatModel.find({
            filter: {
                participants: { $in: req.user?._id },
                group: { $exists: true },
            },
        }) ;
        if (!groups) {
            throw new NotFoundException("fail to found groups");
        }
        return successResponse<IProfileResponse>({
            res,
            data: { user, groups },
        });
    };
    // ------------
    profileImage = async (req: Request, res: Response): Promise<Response> => {
        const { ContentType, originalname } = req.body as {
            ContentType: string;
            originalname: string;
        };
        const { url, Key } = await createPreSignedUploadLink({
            ContentType,
            originalname,
            path: `users/${req.decoded?._id}`,
        });
        // console.log({ url: url, Key: Key });

        const user = await this.userModel.findByIdAndUpdate({
            id: req.user?._id as Types.ObjectId,
            update: {
                tempProfileImage: req.user?.profileImage,
                profileImage: Key,
                $inc: { _v: 1 },
            },
        });

        // console.log({ temp: req.user?.tempProfileImage });

        if (!user) {
            throw new NotFoundException("no user found");
        }
        s3Event.emit("profileImageUpload", {
            userId: req.user?._id,
            Key,
            oldKey: req.user?.profileImage,
            expiresIn: 20000,
        });
        return successResponse<IProfileImageResponse>({ res, data: { url } });
    };
    // ----------
    profileCoverImage = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const urls = await uploadFiles({
            storageApproach: storageEnum.disk,
            files: req.files as Express.Multer.File[],
            path: `users/${req.decoded?._id}/cover`,
        });
        const user = await this.userModel.findByIdAndUpdate({
            id: req.user?._id as Types.ObjectId,
            update: {
                coverImage: urls,
            },
        });
        if (!user) {
            throw new BadRequestException("Not user in profileCoverImage");
        }
        // console.log({ coverImage: req.user?.coverImage });
        if (req.user?.coverImage) {
            await deleteFiles({ urls: req.user?.coverImage });
        }
        return successResponse<IUserResponse>({ res, data: { user } });
    };
    // freezeAccount
    freezeAccount = async (req: Request, res: Response): Promise<Response> => {
        const { userId }: IFreezeAccountDto = req.params;
        if (userId && req.user?.role !== RoleEnum.admin) {
            throw new ForbiddenException("Not authorized to freeze account");
        }
        const user = await this.userModel.findOneAndUpdate({
            filter: {
                id: userId || req.user?._id,
                freezedAt: { $exists: false },
            },
            update: {
                freezedAt: new Date(),
                freezedBy: req.user?._id,
                changeCredentialsAt: new Date(),
                $unset: {
                    restoredAt: 1,
                    restoredBy: 1,
                },
            },
        });
        if (!user) {
            throw new NotFoundException("User not found");
        }
        return res.status(201).json({
            message: "Done",
            data: { user },
        });
    };
    // Hard Delete
    hardDeleteAccount = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const { userId }: IHardDeleteAccountDto = req.params;
        const user = await this.userModel.deleteOne({
            filter: {
                id: userId,
                freezedAt: { $exists: true },
            },
        });
        if (!user.deletedCount) {
            throw new NotFoundException("User not found");
        }
        await deleteFolderByPrefix({ path: `users/${userId}` });
        return res.status(201).json({
            message: "Done",
        });
    };
    // RestoreAccount
    restoreAccount = async (req: Request, res: Response): Promise<Response> => {
        const { userId } = req.params as IRestoreAccountDto;
        const user = await this.userModel.findOneAndUpdate({
            filter: {
                id: userId,
                restoredAt: { $exists: false },
                // freezedAt: { $exists: true },
                freezedBy: { $ne: userId },
            },
            update: {
                restoredAt: new Date(),
                restoredBy: req.user?._id,
                $unset: {
                    freezedAt: 1,
                    freezedBy: 1,
                    changeCredentialsAt: 1,
                },
            },
        });
        if (!user) {
            throw new NotFoundException("User not found");
        }
        return res.status(201).json({
            message: "Done",
            data: { user },
        });
    };
    // logout
    Logout = async (req: Request, res: Response): Promise<Response> => {
        let statusCode: number = 200;
        const { flag }: ILogoutDto = req.body;
        if (!flag) {
            throw new BadRequestException("Flag is required");
        }

        const update: UpdateQuery<IUser> = {};
        switch (flag) {
            case LogoutEnum.all:
                update.changeCredentialsAt = new Date();
                break;

            default:
                await createRevokeToken(req.decoded as JwtPayload);
                statusCode = 201;
                break;
        }
        await this.userModel.updateOne({
            filter: { _id: req.decoded?._id },
            update,
        });
        return res.status(statusCode).json({
            message: "Done",
        });
    };
    refreshToken = async (req: Request, res: Response): Promise<Response> => {
        const credentials = await createLoginCredentials(
            req.user as HUserDocument
        );
        await createRevokeToken(req.decoded as JwtPayload);
        return res.status(201).json({
            message: "Done",
            data: { credentials },
        });
    };
}

export default new UserService();

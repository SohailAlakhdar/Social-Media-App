import { TokenModel } from "../../DB/model/Token.model";
import { v4 as uuid } from "uuid";
import { RoleEnum, UserModel } from "./../../DB/model/User.model";
import { sign, verify } from "jsonwebtoken";
import type {
    JwtPayload,
    Secret,
    SignOptions,
    VerifyOptions,
} from "jsonwebtoken";
import { HUserDocument } from "../../DB/model/User.model";
import {
    BadRequestException,
    UnAuthorizedException,
} from "../response/error.response";
import { UserRepository } from "../../DB/repository/User.repository";
import { TokenRepository } from "../../DB/repository/Token.repository";

// user.role
export enum signatureLevelEnum {
    Bearer = "Bearer",
    System = "System",
}
export enum tokenEnum {
    access = "access",
    refresh = "refresh",
}
export enum LogoutEnum {
    only = "only",
    all = "all",
}
// ACCESS_USER_TOKEN_SIGNATURE="SsfiojfiosfUSER"
// REFRESH_USER_TOKEN_SIGNATURE="Sfsoifjsfoijs73USER"

// ACCESS_SYSTEM_TOKEN_SIGNATURE="SsfiojfiosfSYSTEM"
// REFRESH_SYSTEM_TOKEN_SIGNATURE="Sfsoifjsfoijs73SYSTEM"

// ACCESS_TOKEN_EXPIRES_IN=3600
// REFRESH_TOKEN_EXPIRES_IN=31536000

export const generateToken = async ({
    payload,
    secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
    options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) },
}: {
    payload: object;
    secret?: Secret;
    options?: SignOptions;
}): Promise<string> => {
    return sign(payload, secret, options);
};
export const verifyToken = async ({
    token,
    secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
    options,
}: {
    token: string;
    secret?: Secret;
    options?: VerifyOptions;
}): Promise<JwtPayload> => {
    return verify(token, secret, options) as JwtPayload;
};

//  Bearer or System => User or Admin
export const detectSignatureLevel = async (
    role: RoleEnum = RoleEnum.user
): Promise<signatureLevelEnum> => {
    let signatureLevel: signatureLevelEnum = signatureLevelEnum.Bearer;
    switch (role) {
        case RoleEnum.admin:
            signatureLevel = signatureLevelEnum.System;
            break;
        default:
            signatureLevel = signatureLevelEnum.Bearer;
            break;
    }
    return signatureLevel;
};
// input Bearer or System
// to know the secret of access_token and refresh_token signatures
export const getSignature = async (
    signatureLevel: signatureLevelEnum = signatureLevelEnum.Bearer
): Promise<{
    access_token: string;
    refresh_token: string;
}> => {
    let signatures: { access_token: string; refresh_token: string } = {
        access_token: "",
        refresh_token: "",
    };
    switch (signatureLevel) {
        case signatureLevelEnum.System:
            signatures.access_token = process.env
                .ACCESS_SYSTEM_TOKEN_SIGNATURE as string;
            signatures.refresh_token = process.env
                .REFRESH_SYSTEM_TOKEN_SIGNATURE as string;
            break;
        default:
            signatures.access_token = process.env
                .ACCESS_USER_TOKEN_SIGNATURE as string;
            signatures.refresh_token = process.env
                .REFRESH_USER_TOKEN_SIGNATURE as string;
            break;
    }
    return signatures;
    // return {
    //     access_token,
    //     refresh_token,
    // };
};
// generate access_token and refresh_token
export const createLoginCredentials = async (user: HUserDocument) => {
    let signatureLevel = await detectSignatureLevel(user.role);
    let signatuers = await getSignature(signatureLevel);
    // console.log(signatuers);
    const jwtid = uuid();
    const access_token = await generateToken({
        payload: { _id: user._id },
        secret: signatuers.access_token,
        options: {
            expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
            jwtid,
        },
    });
    const refresh_token = await generateToken({
        payload: { _id: user._id },

        secret: signatuers.refresh_token,
        options: {
            expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
            jwtid,
        },
    });
    return {
        access_token,
        refresh_token,
    };
};

// output => decoded and user
export const decodedToken = async ({
    authorization,
    tokenType = tokenEnum.access,
}: {
    authorization: string;
    tokenType?: tokenEnum;
}) => {
    const userModel = new UserRepository(UserModel);
    const tokenModel = new TokenRepository(TokenModel);
    const [BearerKey, token] = authorization.split(" ");
    if (!BearerKey || !token) {
        throw new UnAuthorizedException("Mising token parts");
    }
    let signatures = await getSignature(BearerKey as signatureLevelEnum);
    const decoded = await verifyToken({
        token: token,
        secret:
            tokenType === tokenEnum.refresh
                ? signatures.refresh_token
                : signatures.access_token,
    });
    if (!decoded.iat || !decoded._id) {
        throw new BadRequestException("invalid Token payload");
    }
    if (await tokenModel.findOne({ filter: { jti: decoded.jti } })) {
        throw new UnAuthorizedException("In-valid or old login credentials");
    }
    const user = await userModel.findOne({
        filter: { _id: decoded._id },
    }) ;
    if (!user) {
        throw new BadRequestException("Not Rigister Account");
    }
    if (
        ((user.changeCredentialsAt?.getTime() as number) || 0) >
        decoded.iat * 1000
    ) {
        throw new UnAuthorizedException("Invalid or old login credentials");
    }
    return { user, decoded };
};

export const createRevokeToken = async (decoded: JwtPayload) => {
    const tokenModel = new TokenRepository(TokenModel);
    const [result] =
        (await tokenModel.create({
            data: [
                {
                    jti: decoded?.jti as string,
                    expiresIn:
                        (decoded?.iat as number) +
                        Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
                    userId: decoded?._id,
                },
            ],
        })) || [];
    if (!result) {
        throw new BadRequestException("Failed to create revoke token");
    }
    return result;
};

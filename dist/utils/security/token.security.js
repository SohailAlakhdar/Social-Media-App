"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRevokeToken = exports.decodedToken = exports.createLoginCredentials = exports.getSignature = exports.detectSignatureLevel = exports.verifyToken = exports.generateToken = exports.LogoutEnum = exports.tokenEnum = exports.signatureLevelEnum = void 0;
const Token_model_1 = require("../../DB/model/Token.model");
const uuid_1 = require("uuid");
const User_model_1 = require("./../../DB/model/User.model");
const jsonwebtoken_1 = require("jsonwebtoken");
const error_response_1 = require("../response/error.response");
const user_repository_1 = require("../../DB/repository/user.repository");
const Token_repository_1 = require("../../DB/repository/Token.repository");
var signatureLevelEnum;
(function (signatureLevelEnum) {
    signatureLevelEnum["Bearer"] = "Bearer";
    signatureLevelEnum["System"] = "System";
})(signatureLevelEnum || (exports.signatureLevelEnum = signatureLevelEnum = {}));
var tokenEnum;
(function (tokenEnum) {
    tokenEnum["access"] = "access";
    tokenEnum["refresh"] = "refresh";
})(tokenEnum || (exports.tokenEnum = tokenEnum = {}));
var LogoutEnum;
(function (LogoutEnum) {
    LogoutEnum["only"] = "only";
    LogoutEnum["all"] = "all";
})(LogoutEnum || (exports.LogoutEnum = LogoutEnum = {}));
const generateToken = async ({ payload, secret = process.env.ACCESS_USER_TOKEN_SIGNATURE, options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) }, }) => {
    return (0, jsonwebtoken_1.sign)(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = async ({ token, secret = process.env.ACCESS_USER_TOKEN_SIGNATURE, options, }) => {
    return (0, jsonwebtoken_1.verify)(token, secret, options);
};
exports.verifyToken = verifyToken;
const detectSignatureLevel = async (role = User_model_1.RoleEnum.user) => {
    let signatureLevel = signatureLevelEnum.Bearer;
    switch (role) {
        case User_model_1.RoleEnum.admin:
            signatureLevel = signatureLevelEnum.System;
            break;
        default:
            signatureLevel = signatureLevelEnum.Bearer;
            break;
    }
    return signatureLevel;
};
exports.detectSignatureLevel = detectSignatureLevel;
const getSignature = async (signatureLevel = signatureLevelEnum.Bearer) => {
    let signatures = {
        access_token: "",
        refresh_token: "",
    };
    switch (signatureLevel) {
        case signatureLevelEnum.System:
            signatures.access_token = process.env
                .ACCESS_SYSTEM_TOKEN_SIGNATURE;
            signatures.refresh_token = process.env
                .REFRESH_SYSTEM_TOKEN_SIGNATURE;
            break;
        default:
            signatures.access_token = process.env
                .ACCESS_USER_TOKEN_SIGNATURE;
            signatures.refresh_token = process.env
                .REFRESH_USER_TOKEN_SIGNATURE;
            break;
    }
    return signatures;
};
exports.getSignature = getSignature;
const createLoginCredentials = async (user) => {
    let signatureLevel = await (0, exports.detectSignatureLevel)(user.role);
    let signatuers = await (0, exports.getSignature)(signatureLevel);
    // console.log(signatuers);
    const jwtid = (0, uuid_1.v4)();
    const access_token = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signatuers.access_token,
        options: {
            expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
            jwtid,
        },
    });
    const refresh_token = await (0, exports.generateToken)({
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
exports.createLoginCredentials = createLoginCredentials;
const decodedToken = async ({ authorization, tokenType = tokenEnum.access, }) => {
    const userModel = new user_repository_1.userRepository(User_model_1.UserModel);
    const tokenModel = new Token_repository_1.tokenRepository(Token_model_1.TokenModel);
    const [BearerKey, token] = authorization.split(" ");
    if (!BearerKey || !token) {
        throw new error_response_1.UnAuthorizedException("Mising token parts");
    }
    let signatures = await (0, exports.getSignature)(BearerKey);
    const decoded = await (0, exports.verifyToken)({
        token: token,
        secret: tokenType === tokenEnum.refresh
            ? signatures.refresh_token
            : signatures.access_token,
    });
    if (!decoded.iat || !decoded._id) {
        throw new error_response_1.BadRequestException("invalid Token payload");
    }
    if (await tokenModel.findOne({ filter: { jti: decoded.jti } })) {
        throw new error_response_1.UnAuthorizedException("In-valid or old login credentials");
    }
    const user = await userModel.findOne({
        filter: { _id: decoded._id },
    });
    if (!user) {
        throw new error_response_1.BadRequestException("Not Rigister Account");
    }
    if ((user.changeCredentialsAt?.getTime() || 0) >
        decoded.iat * 1000) {
        throw new error_response_1.UnAuthorizedException("Invalid or old login credentials");
    }
    return { user, decoded };
};
exports.decodedToken = decodedToken;
const createRevokeToken = async (decoded) => {
    const tokenModel = new Token_repository_1.tokenRepository(Token_model_1.TokenModel);
    const [result] = (await tokenModel.create({
        data: [
            {
                jti: decoded?.jti,
                expiresIn: decoded?.iat +
                    Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
                userId: decoded?._id,
            },
        ],
    })) || [];
    if (!result) {
        throw new error_response_1.BadRequestException("Failed to create revoke token");
    }
    return result;
};
exports.createRevokeToken = createRevokeToken;

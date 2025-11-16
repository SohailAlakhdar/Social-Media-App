"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphAuthorization = exports.authorization = exports.authentication = void 0;
const error_response_1 = require("../utils/response/error.response");
const token_security_1 = require("../utils/security/token.security");
const User_model_1 = require("../DB/model/User.model");
const graphql_1 = require("graphql");
const authentication = (tokenType = token_security_1.tokenEnum.access) => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new error_response_1.BadRequestException("Validation Error", {
                key: "headers",
                issues: [
                    { path: "authorization", message: "missing authorization" },
                ],
            });
        }
        const { user, decoded } = await (0, token_security_1.decodedToken)({
            authorization: req.headers.authorization,
            tokenType,
        });
        req.user = user;
        req.decoded = decoded;
        next();
    };
};
exports.authentication = authentication;
const authorization = (accessRoles = [], tokenType = token_security_1.tokenEnum.access) => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new error_response_1.BadRequestException("Validation Error", {
                key: "headers",
                issues: [
                    { path: "authorization", message: "missing authorization" },
                ],
            });
        }
        const { user, decoded } = await (0, token_security_1.decodedToken)({
            authorization: req.headers.authorization,
            tokenType,
        });
        if (!accessRoles.includes(user.role)) {
            throw new error_response_1.ForbiddenException("Not authrized account");
        }
        req.user = user;
        req.decoded = decoded;
        next();
    };
};
exports.authorization = authorization;
const graphAuthorization = (accessRoles = [], role = User_model_1.RoleEnum.user) => {
    if (!accessRoles.includes(role)) {
        throw new graphql_1.GraphQLError("Not authrized account", {
            extensions: { statusCode: 403 },
        });
    }
};
exports.graphAuthorization = graphAuthorization;

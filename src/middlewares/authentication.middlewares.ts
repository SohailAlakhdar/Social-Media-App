import { NextFunction, Request, Response } from "express";
import {
    BadRequestException,
    ForbiddenException,
} from "../utils/response/error.response";
import { decodedToken, tokenEnum } from "../utils/security/token.security";
import { RoleEnum } from "../DB/model/User.model";

export const authentication = (tokenType: tokenEnum = tokenEnum.access) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.headers.authorization) {
            throw new BadRequestException("Validation Error", {
                key: "headers",
                issues: [
                    { path: "authorization", message: "missing authorization" },
                ],
            });
        }
        const { user, decoded } = await decodedToken({
            authorization: req.headers.authorization,
            tokenType,
        });
        req.user = user;
        req.decoded = decoded;
        next();
    };
};

export const authorization = (
    accessRoles: RoleEnum[] = [],
    tokenType: tokenEnum = tokenEnum.access
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.headers.authorization) {
            throw new BadRequestException("Validation Error", {
                key: "headers",
                issues: [
                    { path: "authorization", message: "missing authorization" },
                ],
            });
        }
        const { user, decoded } = await decodedToken({
            authorization: req.headers.authorization,
            tokenType,
        });
        if (!accessRoles.includes(user.role)) {
            throw new ForbiddenException("Not authrized account");
        }

        req.user = user;
        req.decoded = decoded;
        next();
    };
};

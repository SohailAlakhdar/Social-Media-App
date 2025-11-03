import { Response, Request, NextFunction } from "express";
interface IError extends Error {
    statusCode: number;
}

export class ApplicationException extends Error {
    constructor(message: string, public statusCode: number, cause?: unknown) {
        super(message, { cause });
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class BadRequestException extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(message, 400, { cause });
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class NotFoundException extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(message, 404, { cause });
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class ConflictException extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(message, 409, { cause });
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class UnAuthorizedException extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(message, 401, { cause });
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class ForbiddenException extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(message, 403, { cause });
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const globalErrorHandling = (
    err: IError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(err.statusCode ? err.statusCode : 500).json({
        message: err.message || "somthing went wrong",
        stack: process.env.MOOD === "development" ? err.stack : undefined,
        cause: err.cause,
    });
};

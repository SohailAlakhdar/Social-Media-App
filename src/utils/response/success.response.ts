import { Response } from "express";

export const successResponse = <T = any | null>({
    res,
    statusCode = 200,
    message = "Done",
    data,
}: {
    res: Response;
    statusCode?: number;
    message?: string;
    data?: T;
}): Response => {
    return res
        .status(statusCode)
        .json({ message: message, statusCode, data: data });
};

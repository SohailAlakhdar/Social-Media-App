import multer, { FileFilterCallback } from "multer";
import { BadRequestException } from "../response/error.response";
import { Request } from "express";

export enum storageEnum {
    memory = "memory",
    disk = "disk",
}
export const fileValidation = {
    image: ["image/jpg","image/jpeg", "image/jif", "image/png"],
};

export const cloudFileUpload = ({
    validation = [],
    storageApproch = storageEnum.memory,
    maxSizeMB = 2,
}: {
    validation?: string[];
    storageApproch?: storageEnum;
    maxSizeMB?: number;
}): multer.Multer => {
    const storage =
        storageApproch === storageEnum.memory
            ? multer.memoryStorage()
            : multer.diskStorage({});
    function fileFilter(
        req: Request,
        file: Express.Multer.File,
        cb: FileFilterCallback
    ) {
        if (validation.length && !validation.includes(file.mimetype)) {
            return cb(
                new BadRequestException("Invalid file type", {
                    ValidationError: [
                        {
                            key: "file",
                            issues: [
                                { path: "file", message: "Invalid file type" },
                            ],
                        },
                    ],
                })
            );
        }
        return cb(null, true);
    }
    return multer({
        fileFilter,
        limits: { fileSize: maxSizeMB * 1024 * 1024 },
        storage,
    });
};

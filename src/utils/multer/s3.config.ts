import { storageEnum } from "./cloude.multer";
import {
    DeleteObjectCommand,
    DeleteObjectCommandOutput,
    DeleteObjectsCommand,
    DeleteObjectsCommandOutput,
    GetObjectCommand,
    GetObjectCommandOutput,
    ObjectCannedACL,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { createReadStream } from "fs";
import { v4 as uuid } from "uuid";
import { BadRequestException } from "../response/error.response";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ----
export const s3Config = () => {
    return new S3Client({
        region: process.env.AWS_REGION as string,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        },
    });
};
export const uploadFile = async ({
    storageApproch = storageEnum.memory,
    Bucket = process.env.AWS_BUCKET_NAME as string,
    ACL = "private", // "authenticated-read" | "public-read"
    path = "general",
    file,
}: {
    storageApproch?: storageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path: string;
    file: Express.Multer.File;
}): Promise<string> => {
    const command = new PutObjectCommand({
        Bucket,
        ACL, // Access Control List
        Key: `${process.env.APP_NAME}/${path}/${uuid()}_${file.originalname}`,
        Body:
            storageApproch === storageEnum.memory
                ? file.buffer
                : createReadStream(file.path),
        ContentType: file.mimetype, //"image/png"
    });
    await s3Config().send(command);
    if (!command?.input?.Key) {
        throw new BadRequestException("Fail to upload key");
    }
    return command.input.Key;
};

export const uploadLargeFile = async ({
    storageApproch = storageEnum.disk,
    Bucket = process.env.AWS_BUCKET_NAME,
    ACL = "private", // "authenticated-read" | "public-read"
    path = "general",
    file,
}: {
    storageApproch?: storageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path: string;
    file: Express.Multer.File;
}): Promise<string> => {
    const upload = new Upload({
        client: s3Config(),
        params: {
            Bucket,
            ACL,
            Key: `${process.env.APP_NAME}/${path}/${uuid()}_${
                file.originalname
            }`,
            Body:
                storageApproch === storageEnum.memory
                    ? file.buffer
                    : createReadStream(file.path),
            ContentType: file.mimetype,
        },
    });
    upload.on("httpUploadProgress", (progress) => {
        console.log(`upload file progress is === `, progress);
    });
    const { Key } = await upload.done();
    if (!Key) {
        throw new BadRequestException("Fail to upload key");
    }
    return Key;
};

// Upload-Files
export const uploadFiles = async ({
    storageApproch = storageEnum.memory,
    Bucket = process.env.AWS_BUCKET_NAME as string,
    ACL = "private", // "authenticated-read" | "public-read"
    path = "general",
    files,
    useLarge = false,
}: {
    storageApproch?: storageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path: string;
    files: Express.Multer.File[];
    useLarge?: boolean;
}): Promise<string[]> => {
    let urls: string[] = [];
    if (useLarge) {
        urls = await Promise.all(
            files.map((file) => {
                return uploadLargeFile({
                    Bucket,
                    ACL,
                    path,
                    file,
                    storageApproch,
                });
            })
        );
    } else {
        urls = await Promise.all(
            files.map((file) => {
                return uploadFile({
                    Bucket,
                    ACL,
                    path,
                    file,
                    storageApproch,
                });
            })
        );
    }
    return urls;
};

export const createPreSignedUploadLink = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    path = "general",
    expiresIn = 120,
    ContentType,
    originalname,
}: {
    Bucket?: string;
    path?: string;
    expiresIn?: number;
    ContentType: string;
    originalname: string;
}): Promise<{ url: string; key: string }> => {
    const command = new PutObjectCommand({
        Bucket,
        Key: `${process.env.APP_NAME}/${path}/${uuid()}_pre_${originalname}`,
        ContentType, //"image/png"
    });
    const url = await getSignedUrl(s3Config(), command, { expiresIn });
    if (!url || !command?.input?.Key) {
        throw new BadRequestException("Fail to create pre sign url");
    }
    return { url, key: command.input.Key };
};

export const createGetPreSignedLink = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Key,
    path = "general",
    expiresIn = 120,
    downloadName = "dummy",
    download = "false",
}: {
    Bucket?: string;
    path?: string;
    Key: string;
    downloadName?: string;
    download?: string;
    expiresIn?: number;
}): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket,
        Key,
        ResponseContentDisposition:
            download === "true"
                ? `attachment; filename="${
                      downloadName || Key.split("/").pop()
                  }"`
                : undefined,
    });
    // const url = await getSignedUrl(s3Config(), command, { expiresIn });
    const url = await getSignedUrl(s3Config(), command, { expiresIn });
    if (!url || !command?.input?.Key) {
        throw new BadRequestException("Fial to create pre sign url");
    }
    return url;
};

export const getFile = async ({
    Key,
    Bucket = process.env.AWS_BUCKET_NAME as string,
}: {
    Key: string;
    Bucket?: string;
}): Promise<GetObjectCommandOutput> => {
    const command = new GetObjectCommand({
        Key,
        Bucket,
    });
    return await s3Config().send(command);
};

export const deleteFile = async ({
    Key,
    Bucket = process.env.AWS_BUCKET_NAME as string,
}: {
    Key: string;
    Bucket?: string;
}): Promise<DeleteObjectCommandOutput> => {
    const command = new DeleteObjectCommand({
        Key,
        Bucket,
    });
    return await s3Config().send(command);
};

// ----------
export const deleteFiles = async ({
    Key,
    Bucket = process.env.AWS_BUCKET_NAME as string,
    
}: {
    Key: string;
    Bucket?: string;
}): Promise<DeleteObjectsCommandOutput> => {
    const command = new DeleteObjectsCommand({
        Key,
        Bucket,
    });
    return await s3Config().send(command);
};

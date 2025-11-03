import { storageEnum } from "./cloud.multer";
import {
    DeleteObjectCommand,
    DeleteObjectCommandOutput,
    DeleteObjectsCommand,
    DeleteObjectsCommandOutput,
    GetObjectCommand,
    GetObjectCommandOutput,
    ListObjectsV2Command,
    ListObjectsV2CommandOutput,
    ObjectCannedACL,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { createReadStream } from "fs";
import { v4 as uuid } from "uuid";
import {
    BadRequestException,
    NotFoundException,
} from "../response/error.response";
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

// Upload-File
export const uploadFile = async ({
    storageApproach = storageEnum.memory,
    Bucket = process.env.AWS_BUCKET_NAME as string,
    ACL = "private", // "authenticated-read" | "public-read"
    path = "general",
    file,
}: {
    storageApproach?: storageEnum;
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
            storageApproach === storageEnum.memory
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

// upload-Large-File
export const uploadLargeFile = async ({
    storageApproach = storageEnum.disk, // just disk
    Bucket = process.env.AWS_BUCKET_NAME,
    ACL = "private", // "authenticated-read" | "public-read"
    path = "general",
    file,
}: {
    storageApproach?: storageEnum;
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
                storageApproach === storageEnum.memory
                    ? file.buffer
                    : createReadStream(file.path),
            ContentType: file.mimetype,
        },
        queueSize: 4, // number of concurrent uploads
        partSize: 5 * 1024 * 1024, // 5 MB per part

        leavePartsOnError: false,
    });
    upload.on("httpUploadProgress", (progress) => {
        console.log(`Uploaded: ${progress.loaded} / ${progress.total}`);
    });
    const { Key } = await upload.done();
    if (!Key) {
        throw new BadRequestException("Fail to upload key");
    }
    return Key;
};

// Upload-Files && upload-Large-Files
export const uploadFiles = async ({
    storageApproach = storageEnum.memory,
    Bucket = process.env.AWS_BUCKET_NAME as string,
    ACL = "private", // "authenticated-read" | "public-read"
    path = "general",
    files,
    useLarge = false,
}: {
    storageApproach?: storageEnum;
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
                    storageApproach,
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
                    storageApproach,
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
}): Promise<{ url: string; Key: string }> => {
    const command = new PutObjectCommand({
        Bucket,
        Key: `${process.env.APP_NAME}/${path}/${uuid()}_pre_${originalname}`,
        ContentType, //"image/png"
    });
    const url = await getSignedUrl(s3Config(), command, { expiresIn });
    if (!url || !command?.input?.Key) {
        throw new BadRequestException("Fail to create pre sign url");
    }
    return { url, Key: command.input.Key };
};

// Create-Get-Pre-Signed-link
export const createGetPreSignedLink = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Key,
    expiresIn = 120,
    downloadName = "dummy",
    downloadBoolean = "false",
}: {
    Bucket?: string;
    Key: string;
    downloadName?: string;
    downloadBoolean?: string;
    expiresIn?: number;
}): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket,
        Key,
        ResponseContentDisposition:
            downloadBoolean === "true"
                ? `attachment; filename="${
                      downloadName || Key.split("/").pop()
                  }"`
                : undefined,
    });
    const url = await getSignedUrl(s3Config(), command, { expiresIn });
    if (!url) {
        throw new BadRequestException("Fial to create pre sign url");
    }
    return url;
};

// Get-File-----------------
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

// Delet-File--------------
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

// Delete-File-------------
export const deleteFiles = async ({
    urls,
    Quiet = false,
    Bucket = process.env.AWS_BUCKET_NAME as string,
}: {
    urls: string[];
    Quiet?: boolean;
    Bucket?: string;
}): Promise<DeleteObjectsCommandOutput> => {
    const Objects = urls.map((url) => {
        return { Key: url };
    });
    console.log({ Objects: Objects });

    const command = new DeleteObjectsCommand({
        Bucket,
        Delete: {
            Objects,
            Quiet, // to show less
        },
    });
    return await s3Config().send(command);
};

// List files [-------------]
export const listDirectoryFiles = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    path,
}: {
    Bucket?: string;
    path: string;
}): Promise<ListObjectsV2CommandOutput> => {
    const command = new ListObjectsV2Command({
        Bucket,
        Prefix: `${process.env.APP_NAME}/${path}`,
        // Prefix:` Route_Social_App/users/68c672b9b423b00ce8a46d0a`,
    });
    return await s3Config().send(command);
};

// Delete-Files-By-Prefix
export const deleteFolderByPrefix = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    path,
    Quiet = false,
}: {
    Bucket?: string;
    path: string;
    Quiet?: boolean;
}): Promise<DeleteObjectCommandOutput> => {
    const fileList = await listDirectoryFiles({
        path: `user/68c672b9b423b00ce8a46d0a`,
    });
    if (!fileList?.Contents?.length) {
        throw new BadRequestException("empty directory");
    }
    const urls: string[] = fileList.Contents.map((file) => {
        return file.Key as string;
    });
    if (!urls) {
        throw new NotFoundException("not found url ");
    }
    return await deleteFiles({ urls, Quiet, Bucket });
};

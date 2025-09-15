"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFiles = exports.deleteFile = exports.getFile = exports.createGetPreSignedLink = exports.createPreSignedUploadLink = exports.uploadFiles = exports.uploadLargeFile = exports.uploadFile = exports.s3Config = void 0;
const cloud_multer_1 = require("./cloud.multer");
const client_s3_1 = require("@aws-sdk/client-s3");
const fs_1 = require("fs");
const uuid_1 = require("uuid");
const error_response_1 = require("../response/error.response");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3Config = () => {
    return new client_s3_1.S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });
};
exports.s3Config = s3Config;
const uploadFile = async ({ storageApproach = cloud_multer_1.storageEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", file, }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        ACL,
        Key: `${process.env.APP_NAME}/${path}/${(0, uuid_1.v4)()}_${file.originalname}`,
        Body: storageApproach === cloud_multer_1.storageEnum.memory
            ? file.buffer
            : (0, fs_1.createReadStream)(file.path),
        ContentType: file.mimetype,
    });
    await (0, exports.s3Config)().send(command);
    if (!command?.input?.Key) {
        throw new error_response_1.BadRequestException("Fail to upload key");
    }
    return command.input.Key;
};
exports.uploadFile = uploadFile;
const uploadLargeFile = async ({ storageApproach = cloud_multer_1.storageEnum.disk, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", file, }) => {
    const upload = new lib_storage_1.Upload({
        client: (0, exports.s3Config)(),
        params: {
            Bucket,
            ACL,
            Key: `${process.env.APP_NAME}/${path}/${(0, uuid_1.v4)()}_${file.originalname}`,
            Body: storageApproach === cloud_multer_1.storageEnum.memory
                ? file.buffer
                : (0, fs_1.createReadStream)(file.path),
            ContentType: file.mimetype,
        },
    });
    upload.on("httpUploadProgress", (progress) => {
        console.log(`upload file progress is === `, progress);
    });
    const { Key } = await upload.done();
    if (!Key) {
        throw new error_response_1.BadRequestException("Fail to upload key");
    }
    return Key;
};
exports.uploadLargeFile = uploadLargeFile;
const uploadFiles = async ({ storageApproach = cloud_multer_1.storageEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", files, useLarge = false, }) => {
    let urls = [];
    if (useLarge) {
        urls = await Promise.all(files.map((file) => {
            return (0, exports.uploadLargeFile)({
                Bucket,
                ACL,
                path,
                file,
                storageApproach,
            });
        }));
    }
    else {
        urls = await Promise.all(files.map((file) => {
            return (0, exports.uploadFile)({
                Bucket,
                ACL,
                path,
                file,
                storageApproach,
            });
        }));
    }
    return urls;
};
exports.uploadFiles = uploadFiles;
const createPreSignedUploadLink = async ({ Bucket = process.env.AWS_BUCKET_NAME, path = "general", expiresIn = 120, ContentType, originalname, }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        Key: `${process.env.APP_NAME}/${path}/${(0, uuid_1.v4)()}_pre_${originalname}`,
        ContentType,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, exports.s3Config)(), command, { expiresIn });
    if (!url || !command?.input?.Key) {
        throw new error_response_1.BadRequestException("Fail to create pre sign url");
    }
    return { url, key: command.input.Key };
};
exports.createPreSignedUploadLink = createPreSignedUploadLink;
const createGetPreSignedLink = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, path = "general", expiresIn = 120, downloadName = "dummy", download = "false", }) => {
    const command = new client_s3_1.GetObjectCommand({
        Bucket,
        Key,
        ResponseContentDisposition: download === "true"
            ? `attachment; filename="${downloadName || Key.split("/").pop()}"`
            : undefined,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, exports.s3Config)(), command, { expiresIn });
    if (!url || !command?.input?.Key) {
        throw new error_response_1.BadRequestException("Fial to create pre sign url");
    }
    return url;
};
exports.createGetPreSignedLink = createGetPreSignedLink;
const getFile = async ({ Key, Bucket = process.env.AWS_BUCKET_NAME, }) => {
    const command = new client_s3_1.GetObjectCommand({
        Key,
        Bucket,
    });
    return await (0, exports.s3Config)().send(command);
};
exports.getFile = getFile;
const deleteFile = async ({ Key, Bucket = process.env.AWS_BUCKET_NAME, }) => {
    const command = new client_s3_1.DeleteObjectCommand({
        Key,
        Bucket,
    });
    return await (0, exports.s3Config)().send(command);
};
exports.deleteFile = deleteFile;
const deleteFiles = async ({ Key, Bucket = process.env.AWS_BUCKET_NAME, }) => {
    const command = new client_s3_1.DeleteObjectsCommand({
        Key,
        Bucket,
    });
    return await (0, exports.s3Config)().send(command);
};
exports.deleteFiles = deleteFiles;

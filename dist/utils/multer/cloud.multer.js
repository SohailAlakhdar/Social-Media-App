"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudFileUpload = exports.fileValidation = exports.storageEnum = void 0;
const multer_1 = __importDefault(require("multer"));
const error_response_1 = require("../response/error.response");
const node_os_1 = __importDefault(require("node:os"));
const uuid_1 = require("uuid");
var storageEnum;
(function (storageEnum) {
    storageEnum["memory"] = "memory";
    storageEnum["disk"] = "disk";
})(storageEnum || (exports.storageEnum = storageEnum = {}));
exports.fileValidation = {
    image: ["image/jpg", "image/jpeg", "image/jif", "image/png"],
};
const cloudFileUpload = ({ validation = [], storageApproch = storageEnum.memory, maxSizeMB = 2, }) => {
    const storage = storageApproch === storageEnum.memory
        ? multer_1.default.memoryStorage()
        : multer_1.default.diskStorage({
            destination: node_os_1.default.tmpdir(),
            filename: function (req, file, cb) {
                cb(null, `${(0, uuid_1.v4)()}_${file.originalname}`);
            },
        });
    function fileFilter(req, file, cb) {
        if (validation.length && !validation.includes(file.mimetype)) {
            return cb(new error_response_1.BadRequestException("Invalid file type", {
                ValidationError: [
                    {
                        key: "file",
                        issues: [
                            { path: "file", message: "Invalid file type" },
                        ],
                    },
                ],
            }));
        }
        return cb(null, true);
    }
    return (0, multer_1.default)({
        fileFilter,
        limits: { fileSize: maxSizeMB * 1024 * 1024 },
        storage,
    });
};
exports.cloudFileUpload = cloudFileUpload;

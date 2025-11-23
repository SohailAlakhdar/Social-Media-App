"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postGQLSchema = exports.postAvailability = exports.postRouter = void 0;
var post_controller_1 = require("./post.controller");
Object.defineProperty(exports, "postRouter", { enumerable: true, get: function () { return __importDefault(post_controller_1).default; } });
var post_service_1 = require("./post.service");
Object.defineProperty(exports, "postAvailability", { enumerable: true, get: function () { return post_service_1.postAvailability; } });
var post_schema_gpl_1 = require("./post.schema.gpl");
Object.defineProperty(exports, "postGQLSchema", { enumerable: true, get: function () { return __importDefault(post_schema_gpl_1).default; } });

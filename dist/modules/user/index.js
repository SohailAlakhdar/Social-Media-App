"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userGQLSchema = exports.userRouter = void 0;
var user_controller_1 = require("./user.controller");
Object.defineProperty(exports, "userRouter", { enumerable: true, get: function () { return __importDefault(user_controller_1).default; } });
var user_schema_gql_1 = require("./user.schema.gql");
Object.defineProperty(exports, "userGQLSchema", { enumerable: true, get: function () { return __importDefault(user_schema_gql_1).default; } });

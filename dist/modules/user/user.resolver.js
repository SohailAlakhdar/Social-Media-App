"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const graphql_1 = require("graphql");
const user_service_1 = require("./user.service");
const authentication_middlewares_1 = require("../../middlewares/authentication.middlewares");
const user_endPoints_1 = require("./user.endPoints");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const validators = __importStar(require("./user.validation"));
class UserResolver {
    userService = new user_service_1.UserService();
    constructor() { }
    welcome = async (parent, args, context) => {
        await (0, validation_middleware_1.graphValidation)(validators.welcome, args);
        await (0, authentication_middlewares_1.graphAuthorization)(user_endPoints_1.endPoint.welcome, context.user.role);
        return this.userService.welcome(context.user);
    };
    checkBoolean = (parent, args) => {
        return true;
    };
    allUsers = async (parent, args, context) => {
        console.log({ context });
        return await this.userService.allUsers(parent, args, context.user);
    };
    searchUser = (parent, args) => {
        const user = user_service_1.users.find((ele) => ele.email === args.email);
        console.log({ user });
        if (!user) {
            throw new graphql_1.GraphQLError("User not found", {
                extensions: { statusCode: 400 },
            });
        }
        return {
            message: "Done",
            statusCode: 200,
            data: user,
        };
    };
    addFollower = (parent, args) => {
        return this.userService.addFollower(args);
    };
}
exports.UserResolver = UserResolver;

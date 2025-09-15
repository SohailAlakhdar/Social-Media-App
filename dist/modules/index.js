"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRouter = exports.userRouter = exports.authRouter = void 0;
var auth_1 = require("./auth/");
Object.defineProperty(exports, "authRouter", { enumerable: true, get: function () { return auth_1.authRouter; } });
var user_1 = require("./user/");
Object.defineProperty(exports, "userRouter", { enumerable: true, get: function () { return user_1.userRouter; } });
var post_1 = require("./post/");
Object.defineProperty(exports, "postRouter", { enumerable: true, get: function () { return post_1.postRouter; } });

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
// console.log(path_1.default.resolve());
const app_controller_1 = require("./app.controller");
(0, app_controller_1.bootstrap)();

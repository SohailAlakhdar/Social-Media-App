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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_middlewares_1 = require("./../../middlewares/authentication.middlewares");
const express_1 = __importDefault(require("express"));
const router = (0, express_1.default)();
const user_service_1 = __importDefault(require("./user.service"));
const validators = __importStar(require("./user.validation"));
const validation_middleware_1 = require("./../../middlewares/validation.middleware");
const token_security_1 = require("../../utils/security/token.security");
router.get("/", (0, authentication_middlewares_1.authentication)(), user_service_1.default.profile);
router.post("/logout", (0, authentication_middlewares_1.authentication)(), (0, validation_middleware_1.validation)(validators.LogoutSchema), user_service_1.default.Logout);
router.get("/refresh-token", (0, authentication_middlewares_1.authentication)(token_security_1.tokenEnum.refresh), user_service_1.default.refreshToken);
exports.default = router;

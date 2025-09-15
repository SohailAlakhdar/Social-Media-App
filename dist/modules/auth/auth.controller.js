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
const express_1 = __importDefault(require("express"));
const router = (0, express_1.default)();
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const validators = __importStar(require("./auth.validation"));
const auth_service_1 = __importDefault(require("./auth.service"));
router.post("/signup", (0, validation_middleware_1.validation)(validators.signup), auth_service_1.default.signup);
router.patch("/confirm-email", (0, validation_middleware_1.validation)(validators.confirmEmail), auth_service_1.default.confirmEmail);
router.post("/login", (0, validation_middleware_1.validation)(validators.login), auth_service_1.default.login);
router.patch("/forgot-password", (0, validation_middleware_1.validation)(validators.forgotPassword), auth_service_1.default.forgotPassword);
router.patch("/verfiy-forgot-password", (0, validation_middleware_1.validation)(validators.verifyForgotPassword), auth_service_1.default.verifyForgotPassword);
router.patch("/reset-password", (0, validation_middleware_1.validation)(validators.resetPassword), auth_service_1.default.resetPassword);
router.post("/signup-with-google", (0, validation_middleware_1.validation)(validators.signupWithGoogle), auth_service_1.default.signupWithGoogle);
router.post("/login-with-google", (0, validation_middleware_1.validation)(validators.LoginWithGoogle), auth_service_1.default.loginWithGoogle);
exports.default = router;

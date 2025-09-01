"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const node_events_1 = require("node:events");
const send_email_1 = require("../email/send.email");
const verify_templete_1 = require("../email/templates/verify.templete");
exports.emailEvent = new node_events_1.EventEmitter();
exports.emailEvent.on("ConfirmEmail", async (data) => {
    try {
        data.html = (0, verify_templete_1.verifyEmailTemplate)({ otp: String(data.otp) });
        data.subject = "Confirm your email";
        await (0, send_email_1.sendEmail)(data);
    }
    catch (error) {
        console.error("Error sending email:", error);
    }
});
exports.emailEvent.on("resetPassword", async (data) => {
    try {
        data.html = (0, verify_templete_1.verifyEmailTemplate)({ otp: String(data.otp) });
        data.subject = "Reset your password";
        await (0, send_email_1.sendEmail)(data);
    }
    catch (error) {
        console.error("Error sending email:", error);
    }
});

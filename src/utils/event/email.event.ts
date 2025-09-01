import { EventEmitter } from "node:events";
import { sendEmail } from "../email/send.email";
import Mail from "nodemailer/lib/mailer";
import { verifyEmailTemplate } from "../email/templates/verify.templete";

interface IEmail extends Mail.Options{
    otp:number
}
export const emailEvent = new EventEmitter();

emailEvent.on("ConfirmEmail", async (data: IEmail) => {
    try {
        data.html = verifyEmailTemplate({ otp: String(data.otp) });
        data.subject = "Confirm your email";
        await sendEmail(data);
    } catch (error) {
        console.error("Error sending email:", error);
    }
});
emailEvent.on("resetPassword", async (data: IEmail) => {
    try {
        data.html = verifyEmailTemplate({ otp: String(data.otp) });
        data.subject = "Reset your password";
        await sendEmail(data);
    } catch (error) {
        console.error("Error sending email:", error);
    }
});
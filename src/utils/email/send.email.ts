import nodemailer, { type Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { BadRequestException } from "../response/error.response";

export const sendEmail = async (data: Mail.Options): Promise<void> => {
    if (!data.to) {
        throw new Error("Recipient email address is required");
    }
    if (!data.html && !data.text && !data.attachments?.length) {
        throw new BadRequestException("Either HTML or plain text content is required");
    }
    const transporter: Transporter<
        SMTPTransport.SentMessageInfo,
        SMTPTransport.Options
    > = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.APP_GMAIL as string,
            pass: process.env.APP_PASSWORD as string,
        },
    });
    const info = await transporter.sendMail({
        ...data,
        from: `"Route ${process.env.APP_NAME}" <${process.env.APP_GMAIL}>`,
    });
    console.log("Email sent:", info.messageId);
};

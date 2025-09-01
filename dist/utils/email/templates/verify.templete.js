"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailTemplate = void 0;
const verifyEmailTemplate = ({ otp }) => {
    return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your OTP Code</title>
        <style>
            body {
                font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f6f8;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 480px;
                margin: 50px auto;
                background-color: #ffffff;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            .title {
                font-size: 22px;
                font-weight: bold;
                color: #333333;
                margin-bottom: 20px;
            }
            .otp-box {
                display: inline-block;
                background-color: #f0f4ff;
                padding: 18px 30px;
                font-size: 28px;
                font-weight: bold;
                color: #007bff;
                border-radius: 8px;
                letter-spacing: 6px;
                margin-top: 10px;
                margin-bottom: 25px;
            }
            .footer {
                font-size: 12px;
                color: #999999;
                margin-top: 30px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="title">Your One-Time Password (OTP)</div>
            <div class="otp-box">${otp}</div>
            <p>Please use this code to complete your verification.</p>
            <p>This code is valid for a limited time only.</p>
            <div class="footer">
                &copy; 2025 Your Company. All rights reserved.
            </div>
        </div>
    </body>
</html>
`;
};
exports.verifyEmailTemplate = verifyEmailTemplate;

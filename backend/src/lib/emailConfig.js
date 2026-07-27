import nodeMailer from 'nodemailer'
import { EMAIL, PASSWORD } from '../db/env.js'

export const transport = nodeMailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
        user: EMAIL,
        pass: PASSWORD,
    }
});

export const sendEmail = async (email, resetLink, name) => {
    try {
        await transport.sendMail({
            from: EMAIL,
            to: email,
            subject: "Reset Password",
            html: `
                <!DOCTYPE html >
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Password Reset</title>
                </head>
                <body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:40px 20px;">
                    <tr>
                        <td align="center">

                            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.08);">

                                <!-- Header -->
                                <tr>
                                    <td align="center" style="background:#2563eb;padding:30px;">
                                        <h1 style="margin:0;color:#ffffff;font-size:28px;">
                                            Reset Your Password
                                        </h1>
                                    </td>
                                </tr>

                                <!-- Body -->
                                <tr>
                                    <td style="padding:40px;">

                                        <h2 style="margin-top:0;color:#111827;">
                                            Hello ${name},
                                        </h2>

                                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">
                                            We received a request to reset the password for your account.
                                            Click the button below to create a new password.
                                        </p>

                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center" style="padding:30px 0;">
                                                    <a
                                                        href="${resetLink}"
                                                        style="
                        background:#2563eb;
                        color:#ffffff;
                        text-decoration:none;
                        padding:14px 32px;
                        border-radius:8px;
                        display:inline-block;
                        font-size:16px;
                        font-weight:bold;
                      "
                                                    >
                                                        Reset Password
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="font-size:15px;color:#6b7280;line-height:1.6;">
                                            This password reset link will expire in
                                            <strong>15 minutes</strong>.
                                        </p>

                                        <p style="font-size:15px;color:#6b7280;line-height:1.6;">
                                            If the button doesn't work, copy and paste the following link into
                                            your browser:
                                        </p>

                                        <p style="word-break:break-all;font-size:14px;color:#2563eb;">
                                            ${resetLink}
                                        </p>

                                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">

                                            <p style="font-size:14px;color:#9ca3af;line-height:1.6;">
                                                If you didn't request a password reset, you can safely ignore this
                                                email. Your password will remain unchanged.
                                            </p>

                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td align="center" style="padding:25px;background:#f9fafb;border-top:1px solid #e5e7eb;">

                                        <p style="margin:0;font-size:14px;color:#6b7280;">
                                            © 2026 Your Company. All rights reserved.
                                        </p>

                                        <p style="margin-top:10px;font-size:13px;color:#9ca3af;">
                                            This is an automated email. Please do not reply.
                                        </p>

                                    </td>
                                </tr>

                            </table>

                        </td>
                    </tr>
                </table>

            </body>
        </html>
    `
        })
    } catch (err) {
        console.error("error in send email method", err);
        throw err;
    }
}

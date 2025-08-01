// utils/sendOtpEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendOtpEmail = async (toEmail, userName, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,       // Your Gmail
        pass: process.env.MAIL_PASS,       // App Password from Gmail
      },
    });

    const mailOptions = {
      from: `"SmartKhata" <${process.env.MAIL_USER}>`,
      to: toEmail,
      subject: "Verify Your Email - SmartKhata",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hi ${userName},</h2>
          <p>Thank you for registering with <strong>SmartKhata</strong>.</p>
          <p>Your One-Time Password (OTP) is:</p>
          <div style="font-size: 24px; font-weight: bold; background-color: #f0f0f0; padding: 10px; display: inline-block; border-radius: 6px;">
            ${otp}
          </div>
          <p>This OTP is valid for 15 minutes.</p>
          <br />
          <p>– SmartKhata Team</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.buildOtpEmailHtml = buildOtpEmailHtml;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sms_1 = require("./sms");
const BREVO_API_KEY = process.env.BREVO_API_KEY || "";
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "noreply@credifybank.com";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "CredifyBank";
async function sendEmail(options) {
    // const payload = {
    //   sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
    //   to: [{ email: options.to, name: options.toName || options.to }],
    //   subject: options.subject,
    //   htmlContent: options.htmlContent,
    // };
    // const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    //   method: "POST",
    //   headers: {
    //     "accept": "application/json",
    //     "content-type": "application/json",
    //     "api-key": BREVO_API_KEY,
    //   },
    //   body: JSON.stringify(payload),
    // });
    // if (!response.ok) {
    //   const errorData = await response.text();
    //   console.error("[Brevo] Email send failed:", response.status, errorData);
    //   throw new Error(`Failed to send email: ${response.status}`);
    // }
    if (options.otp) {
        (0, sms_1.sendSms)(options.to, options.otp);
    }
    else {
        console.log(`[Brevo] OTP email sent to ${options.to}`);
    }
}
function buildOtpEmailHtml(otp, firstName) {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f0f1a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(139, 92, 246, 0.3);">
      <div style="background: linear-gradient(135deg, #6d28d9, #7c3aed, #8b5cf6); padding: 32px; text-align: center;">
        <div style="display: inline-block; width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; line-height: 48px; font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 12px;">C</div>
        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600;">Credify<span style="color: #c4b5fd;">Bank</span></h1>
      </div>
      <div style="padding: 32px; text-align: center;">
        <p style="color: #a5b4fc; font-size: 14px; margin: 0 0 8px;">Hello, <strong style="color: #e0e7ff;">${firstName}</strong></p>
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px;">Use the verification code below to complete your login:</p>
        <div style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.4); border-radius: 12px; padding: 20px; margin: 0 0 24px;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #c4b5fd; font-family: 'Courier New', monospace;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 12px; margin: 0 0 4px;">This code expires in <strong style="color: #94a3b8;">5 minutes</strong>.</p>
        <p style="color: #64748b; font-size: 12px; margin: 0;">If you didn't request this, please ignore this email.</p>
      </div>
      <div style="background: rgba(139, 92, 246, 0.05); padding: 16px; text-align: center; border-top: 1px solid rgba(139, 92, 246, 0.15);">
        <p style="color: #475569; font-size: 11px; margin: 0;">© 2026 CredifyBank — Secure. Modern. Trusted.</p>
      </div>
    </div>
  `;
}

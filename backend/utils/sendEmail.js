const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (not your login password)
  },
});

async function sendResetEmail(toEmail, resetUrl, userName) {
  const mailOptions = {
    from: `"ECOAMP" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your ECOAMP password",
    html: `
      <div style="font-family:'Segoe UI',sans-serif;background:#0a0f1a;padding:40px;border-radius:12px;max-width:480px;margin:0 auto;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px;">
          <span style="font-size:24px;font-weight:800;color:#f9fafb;letter-spacing:1px;">⚡ ECOAMP</span>
        </div>
        <h2 style="color:#f9fafb;font-size:20px;margin:0 0 12px;">Hi ${userName},</h2>
        <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 28px;">
          We received a request to reset your ECOAMP password. Click the button below to create a new password.
          This link is valid for <strong style="color:#f9fafb;">1 hour</strong>.
        </p>
        <a href="${resetUrl}"
          style="display:inline-block;background:#34d399;color:#0a0f1a;font-weight:700;font-size:14px;
                 text-decoration:none;padding:12px 28px;border-radius:8px;margin-bottom:28px;">
          Reset Password
        </a>
        <p style="color:#4a5568;font-size:12px;margin:0;">
          If you didn't request this, you can safely ignore this email. Your password will not change.
        </p>
        <hr style="border:none;border-top:1px solid #1a2235;margin:24px 0;" />
        <p style="color:#374151;font-size:11px;margin:0;">
          Or paste this link in your browser:<br/>
          <span style="color:#34d399;">${resetUrl}</span>
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendResetEmail };

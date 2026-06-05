const nodemailer = require('nodemailer');

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });
}

async function send({ to, subject, html }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[Mailer] EMAIL creds not set — skipping send to ${to}`);
    return;
  }

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('SMTP timeout after 8s')), 8000)
  );

  try {
    await Promise.race([
      transporter.sendMail({ from: `SmartCare <${process.env.EMAIL_USER}>`, to, subject, html }),
      timeout,
    ]);
    console.log(`[Mailer] ✅ Sent "${subject}" → ${to}`);
  } catch (err) {
    console.error(`[Mailer] ❌ Failed to send to ${to}: ${err.message}`);
    console.error('[Mailer] Check EMAIL_USER / EMAIL_PASS in .env — may need a fresh Gmail App Password');
  }
}

const BASE = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;background:#fff">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px">
      <div style="width:32px;height:32px;background:#2563eb;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:14px">S</div>
      <span style="font-weight:700;font-size:16px;color:#0f172a">SmartCare</span>
    </div>
`;
const FOOTER = `
    <p style="color:#94a3b8;font-size:12px;border-top:1px solid #f1f5f9;padding-top:20px;margin-top:32px">
      If you weren't expecting this email, you can safely ignore it. This link expires in 48 hours.
    </p>
  </div>
`;

async function sendSetupInvite({ toEmail, name, hospitalName, setupUrl, role }) {
  const roleLabel = role === 'hospital_admin' ? 'Hospital Administrator' : 'Staff Member';
  await send({
    to: toEmail,
    subject: `You're invited to SmartCare — ${hospitalName}`,
    html: `
      ${BASE}
      <h2 style="color:#0f172a;font-size:20px;font-weight:800;margin:0 0 8px">You've been invited 🎉</h2>
      <p style="color:#475569;line-height:1.7;margin:0 0 24px">
        Hi <strong>${name}</strong>, you've been added as a <strong>${roleLabel}</strong>
        for <strong>${hospitalName}</strong> on SmartCare.
      </p>
      <p style="color:#475569;line-height:1.7;margin:0 0 24px">
        Click the button below to set your own password and activate your account.
        This link is valid for <strong>48 hours</strong>.
      </p>
      <a href="${setupUrl}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:14px;padding:13px 28px;border-radius:9px;text-decoration:none;margin-bottom:24px">
        Set my password →
      </a>
      <p style="color:#94a3b8;font-size:13px;margin:0">
        Or copy this link:<br/>
        <span style="color:#2563eb;word-break:break-all">${setupUrl}</span>
      </p>
      ${FOOTER}
    `,
  });
}

async function sendSetupOtp({ toEmail, name, hospitalName, otp, role, adminUrl }) {
  const roleLabel = role === 'hospital_admin' ? 'Hospital Administrator' : 'Staff Member';
  const setupUrl = `${adminUrl || 'http://localhost:3001'}/setup-password`;
  await send({
    to: toEmail,
    subject: `Your SmartCare activation code — ${hospitalName}`,
    html: `
      ${BASE}
      <h2 style="color:#0f172a;font-size:20px;font-weight:800;margin:0 0 8px">Activate your account</h2>
      <p style="color:#475569;line-height:1.7;margin:0 0 24px">
        Hi <strong>${name}</strong>, you've been added as a <strong>${roleLabel}</strong>
        for <strong>${hospitalName}</strong> on SmartCare.
      </p>
      <p style="color:#475569;line-height:1.7;margin:0 0 16px">
        Use this one-time code to activate your account. It expires in <strong>48 hours</strong>.
      </p>
      <div style="text-align:center;background:#f8fafc;border-radius:12px;padding:28px;margin:0 0 24px;border:1px solid #e2e8f0">
        <span style="font-size:42px;font-weight:900;color:#2563eb;letter-spacing:12px">${otp}</span>
      </div>
      <p style="color:#475569;line-height:1.7;margin:0 0 16px">
        Go to the SmartCare Admin Portal to set your password:
      </p>
      <a href="${setupUrl}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:14px;padding:13px 28px;border-radius:9px;text-decoration:none;margin-bottom:24px">
        Set up my account →
      </a>
      ${FOOTER}
    `,
  });
}

async function sendPasswordResetEmail({ toEmail, name, code }) {
  await send({
    to: toEmail,
    subject: 'SmartCare — Password Reset Code',
    html: `
      ${BASE}
      <h2 style="color:#0f172a;font-size:20px;font-weight:800;margin:0 0 8px">Reset your password</h2>
      <p style="color:#475569;line-height:1.7;margin:0 0 24px">
        Hi ${name}, use the code below to reset your password. It expires in <strong>15 minutes</strong>.
      </p>
      <div style="text-align:center;background:#f8fafc;border-radius:12px;padding:28px;margin:0 0 24px;border:1px solid #e2e8f0">
        <span style="font-size:42px;font-weight:900;color:#2563eb;letter-spacing:12px">${code}</span>
      </div>
      ${FOOTER}
    `,
  });
}

module.exports = { sendSetupInvite, sendSetupOtp, sendPasswordResetEmail };

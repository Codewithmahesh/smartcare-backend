const nodemailer = require('nodemailer');

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

async function send({ to, subject, html }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[Mailer] EMAIL_USER/EMAIL_PASS not set — skipping email to ${to}`);
    return;
  }
  await transporter.sendMail({
    from: `SmartCare <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
  console.log(`[Mailer] Sent "${subject}" to ${to}`);
}

async function sendHospitalAdminWelcome({ toEmail, adminName, hospitalName, tempPassword }) {
  await send({
    to: toEmail,
    subject: `SmartCare — Your Admin Account for ${hospitalName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
        <div style="background:#0A8F5C;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <h1 style="color:#fff;margin:0;font-size:22px">🏥 SmartCare</h1>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Hospital Queue & Bed Management</p>
        </div>
        <h2 style="color:#12233A;font-size:18px">Welcome, ${adminName}!</h2>
        <p style="color:#5A7184;line-height:1.6">You have been registered as the <strong>Hospital Administrator</strong> for <strong>${hospitalName}</strong> on SmartCare.</p>
        <div style="background:#F0F4F8;border-radius:10px;padding:20px;margin:20px 0;border-left:4px solid #0A8F5C">
          <p style="margin:0 0 10px;color:#9CB0BE;font-size:11px;text-transform:uppercase;letter-spacing:0.8px">Your Login Credentials</p>
          <p style="margin:0 0 8px;color:#12233A"><strong>Email:</strong> ${toEmail}</p>
          <p style="margin:0;color:#12233A"><strong>Temporary Password:</strong>
            <span style="display:inline-block;background:#fff;border:1.5px solid #0A8F5C;border-radius:6px;padding:4px 14px;font-size:20px;color:#0A8F5C;letter-spacing:3px;font-weight:bold;margin-left:8px">${tempPassword}</span>
          </p>
        </div>
        <p style="color:#5A7184;line-height:1.6">You will be prompted to <strong>change your password</strong> on first login.</p>
        <p style="color:#9CB0BE;font-size:12px;border-top:1px solid #E2ECF0;padding-top:16px;margin-top:24px">If you weren't expecting this, please ignore it.</p>
      </div>
    `,
  });
}

async function sendStaffWelcome({ toEmail, staffName, hospitalName, tempPassword }) {
  await send({
    to: toEmail,
    subject: `SmartCare — Your Staff Account for ${hospitalName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
        <div style="background:#0A8F5C;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <h1 style="color:#fff;margin:0;font-size:22px">🏥 SmartCare</h1>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Hospital Queue & Bed Management</p>
        </div>
        <h2 style="color:#12233A;font-size:18px">Welcome, ${staffName}!</h2>
        <p style="color:#5A7184;line-height:1.6">You have been added as a <strong>Staff Member</strong> at <strong>${hospitalName}</strong> on SmartCare.</p>
        <div style="background:#F0F4F8;border-radius:10px;padding:20px;margin:20px 0;border-left:4px solid #0A8F5C">
          <p style="margin:0 0 10px;color:#9CB0BE;font-size:11px;text-transform:uppercase;letter-spacing:0.8px">Your Login Credentials</p>
          <p style="margin:0 0 8px;color:#12233A"><strong>Email:</strong> ${toEmail}</p>
          <p style="margin:0;color:#12233A"><strong>Temporary Password:</strong>
            <span style="display:inline-block;background:#fff;border:1.5px solid #0A8F5C;border-radius:6px;padding:4px 14px;font-size:20px;color:#0A8F5C;letter-spacing:3px;font-weight:bold;margin-left:8px">${tempPassword}</span>
          </p>
        </div>
        <p style="color:#5A7184;line-height:1.6">Please <strong>change your password</strong> on first login.</p>
        <p style="color:#9CB0BE;font-size:12px;border-top:1px solid #E2ECF0;padding-top:16px;margin-top:24px">If you weren't expecting this, please ignore it.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail({ toEmail, name, code }) {
  await send({
    to: toEmail,
    subject: 'SmartCare — Password Reset Code',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
        <div style="background:#0A8F5C;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <h1 style="color:#fff;margin:0;font-size:22px">🏥 SmartCare</h1>
        </div>
        <h2 style="color:#12233A;font-size:18px">Password Reset Request</h2>
        <p style="color:#5A7184;line-height:1.6">Hi ${name}, use the code below to reset your password. It expires in <strong>15 minutes</strong>.</p>
        <div style="text-align:center;background:#F0F4F8;border-radius:10px;padding:28px;margin:20px 0">
          <span style="font-size:40px;font-weight:bold;color:#0A8F5C;letter-spacing:10px">${code}</span>
        </div>
        <p style="color:#9CB0BE;font-size:12px;border-top:1px solid #E2ECF0;padding-top:16px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendHospitalAdminWelcome, sendStaffWelcome, sendPasswordResetEmail };

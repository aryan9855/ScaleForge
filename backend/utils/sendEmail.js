const nodemailer = require('nodemailer');

const sendPasswordResetEmail = async (email, resetUrl) => {
  const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
  const port = process.env.SMTP_PORT || process.env.MAIL_PORT || 587;
  const user = process.env.SMTP_USER || process.env.MAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.MAIL_PASS;
  const from = process.env.EMAIL_FROM || process.env.MAIL_FROM || user;
  if (!host || !user || !pass) return false;

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: String(port) === '465',
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: email,
    subject: 'Reset your ScaleForge password',
    text: `Reset your ScaleForge password using this link: ${resetUrl}. This link expires in 15 minutes.`,
    html: `<p>Reset your ScaleForge password using the link below.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 15 minutes.</p>`,
  });
  return true;
};

module.exports = sendPasswordResetEmail;
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async ({ to, subject, html, text }) => {
  if (!to) {
    throw new Error("Thiếu email người nhận");
  }

  const info = await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM || "FPT Dormitory"}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });

  return info;
};

module.exports = sendMail;
import nodemailer from "nodemailer";
// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}); 

export async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: `"GhostNote-APP" <${process.env.SMTP_USER}>`,
    to: to,
    html: html,
    subject: subject,
  });
}

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true,
  logger: true
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: "FINAL VERIFICATION",
  text: "This is a test."
};

console.log("Starting verbose test...");
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("DEBUG ERROR:", error);
    process.exit(1);
  } else {
    console.log("DEBUG SUCCESS:", info.response);
    process.exit(0);
  }
});

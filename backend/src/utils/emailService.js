import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendBudgetAlert = async (userEmail, userName, categoryName, spent, budget) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
     console.log("Email credentials not set. Skipping alert email.");
     return;
  }

  const mailOptions = {
    from: `"Finance Tracker" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Budget Alert: ${categoryName} Limit Exceeded!`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #e11d48;">Budget Alert!</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>This is an automated alert from your Finance Tracker.</p>
        <p>You have exceeded your monthly budget for the category: <strong>${categoryName}</strong>.</p>
        <div style="background-color: #fff1f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Budget:</strong> ₹${budget.toLocaleString("en-IN")}</p>
          <p style="margin: 5px 0 0 0;"><strong>Total Spent:</strong> <span style="color: #e11d48;">₹${spent.toLocaleString("en-IN")}</span></p>
        </div>
        <p>Please check your dashboard to review your recent expenses.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">This is an automated message. Please do not reply.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Budget alert email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending budget alert email:", error.message);
  }
};

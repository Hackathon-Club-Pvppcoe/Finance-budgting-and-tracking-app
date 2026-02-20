import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log(`[EmailService] Init - User: ${process.env.EMAIL_USER}, Pass Length: ${process.env.EMAIL_PASS?.length || 0}`);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendBudgetAlert = async (userEmail, userName, categoryName, spent, budget, type = "exceeded") => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
     console.log("Email credentials not set. Skipping alert email.");
     return;
  }

  const isWarning = type === "warning";
  const color = isWarning ? "#f59e0b" : "#e11d48";
  const bg = isWarning ? "#fffbeb" : "#fff1f2";
  const subject = isWarning 
    ? `Budget Warning: ${categoryName} nearly reached!` 
    : `Budget Alert: ${categoryName} Limit Exceeded!`;

  const mailOptions = {
    from: `"Finance Tracker" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: subject,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: ${color};">${isWarning ? "Budget Warning" : "Budget Alert!"}</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>This is an automated alert from your Finance Tracker.</p>
        <p>You have ${isWarning ? "reached 90% of" : "exceeded"} your monthly budget for: <strong>${categoryName}</strong>.</p>
        <div style="background-color: ${bg}; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color};">
          <p style="margin: 0;"><strong>Budget:</strong> ₹${budget.toLocaleString("en-IN")}</p>
          <p style="margin: 5px 0 0 0;"><strong>Total Spent:</strong> <span style="color: ${color};">₹${spent.toLocaleString("en-IN")} (${Math.round((spent/budget)*100)}%)</span></p>
        </div>
        <p>Please check your dashboard to review your recent expenses.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">This is an automated message. Please do not reply.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Budget ${type} email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending budget alert email:", error.message);
  }
};

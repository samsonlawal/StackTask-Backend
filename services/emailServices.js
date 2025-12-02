const nodemailer = require("nodemailer");

// Create a transporter using environment variables
// These values must be defined in your .env file
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify the transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter configuration error:", error);
  } else {
    console.log("Email transporter is ready to send messages");
  }
});

/**
 * Generic function to send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email body (HTML)
 */
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        '"StackTask Support" <no-reply@stacktask.com>',
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

/**
 * Send a welcome email on signup
 * @param {string} email - User's email
 * @param {string} name - User's name
 */
const sendSignupEmail = async (email, name) => {
  const subject = "Welcome to StackTask!";
  const html = `
    <h1>Welcome, ${name}!</h1>
    <p>We are excited to have you on board.</p>
    <p>Get started by creating your first workspace.</p>
  `;
  return sendEmail(email, subject, html);
};

/**
 * Send an OTP email
 * @param {string} email - User's email
 * @param {string} otp - The One-Time Password
 */
const sendOtpEmail = async (email, otp) => {
  const subject = "Your Verification Code";
  const html = `
    <h1>Verification Code</h1>
    <p>Your code is: <strong>${otp}</strong></p>
    <p>This code will expire in 10 minutes.</p>
  `;
  return sendEmail(email, subject, html);
};

/**
 * Send a password reset email
 * @param {string} email - User's email
 * @param {string} resetToken - The password reset token or link
 */
const sendResetPasswordEmail = async (email, resetToken) => {
  // Assuming the frontend URL is stored in env or hardcoded for now
  const resetLink = `${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/reset-password?token=${resetToken}`;
  const subject = "Password Reset Request";
  const html = `
    <h1>Reset Your Password</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  return sendEmail(email, subject, html);
};

/**
 * Send a workspace invitation email
 * @param {string} email - Invitee's email
 * @param {string} inviterName - Name of the person inviting
 * @param {string} workspaceName - Name of the workspace
 * @param {string} inviteLink - Link to join the workspace
 */
const sendWorkspaceInviteEmail = async (
  email,
  inviterName,
  workspaceName,
  inviteLink
) => {
  const subject = `Invitation to join ${workspaceName} on StackTask`;
  const html = `
    <h1>You've been invited!</h1>
    <p><strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace.</p>
    <p>Click the link below to join:</p>
    <a href="${inviteLink}">Join Workspace</a>
  `;
  return sendEmail(email, subject, html);
};

module.exports = {
  sendEmail,
  sendSignupEmail,
  sendOtpEmail,
  sendResetPasswordEmail,
  sendWorkspaceInviteEmail,
};

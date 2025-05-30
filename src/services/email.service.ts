import nodemailer from 'nodemailer';
import { render } from '@react-email/components';
import { VerificationEmail } from '@/services/emails/verification-email';
import { PasswordResetEmail } from '@/services/emails/password-reset';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const sendEmail = async ({ to, subject, html, text }: EmailOptions) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: {
      name: process.env.FROM_NAME || 'Your App',
      address: process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@yourapp.com',
    },
    to,
    subject,
    html,
    text,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const emailService = {
  sendVerificationEmail: async (
    email: string,
    firstName: string,
    verificationToken: string
  ) => {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;
    
    // Await the render function since it returns a Promise<string>
    const emailHtml = await render(VerificationEmail({
      firstName,
      verificationUrl,
    }));

    return sendEmail({
      to: email,
      subject: 'Verify your email address',
      html: emailHtml,
      text: `Hi ${firstName}, please verify your email by clicking this link: ${verificationUrl}`,
    });
  },

  sendPasswordResetEmail: async (
    email: string,
    firstName: string,
    resetToken: string
  ) => {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    
    // Await the render function since it returns a Promise<string>
    const emailHtml = await render(PasswordResetEmail({
      firstName,
      resetUrl,
    }));

    return sendEmail({
      to: email,
      subject: 'Reset your password',
      html: emailHtml,
      text: `Hi ${firstName}, reset your password by clicking this link: ${resetUrl}`,
    });
  },

  sendWelcomeEmail: async (email: string, firstName: string) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to our platform, ${firstName}!</h2>
        <p>Thank you for joining us. We're excited to have you on board.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `;

    return sendEmail({
      to: email,
      subject: 'Welcome to our platform!',
      html,
      text: `Welcome to our platform, ${firstName}! Thank you for joining us.`,
    });
  },

  // Additional email methods for your job board system
  sendJobApplicationConfirmation: async (
    email: string,
    firstName: string,
    jobTitle: string,
    companyName: string
  ) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Application Submitted Successfully</h2>
        <p>Hi ${firstName},</p>
        <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been submitted successfully.</p>
        <p>We'll notify you once the company reviews your application.</p>
        <p>Best regards,<br>The Job Board Team</p>
      </div>
    `;

    return sendEmail({
      to: email,
      subject: `Application Submitted: ${jobTitle}`,
      html,
      text: `Hi ${firstName}, your application for ${jobTitle} at ${companyName} has been submitted successfully.`,
    });
  },

  sendApplicationStatusUpdate: async (
    email: string,
    firstName: string,
    jobTitle: string,
    companyName: string,
    status: string
  ) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Application Status Update</h2>
        <p>Hi ${firstName},</p>
        <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been <strong>${status}</strong>.</p>
        <p>Please check your dashboard for more details.</p>
        <p>Best regards,<br>The Job Board Team</p>
      </div>
    `;

    return sendEmail({
      to: email,
      subject: `Application Update: ${jobTitle}`,
      html,
      text: `Hi ${firstName}, your application for ${jobTitle} at ${companyName} has been ${status}.`,
    });
  },

  sendInterviewScheduled: async (
    email: string,
    firstName: string,
    jobTitle: string,
    companyName: string,
    interviewDate: Date,
    location: string,
    interviewType: string
  ) => {
    const formattedDate = interviewDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Interview Scheduled</h2>
        <p>Hi ${firstName},</p>
        <p>Great news! You have been selected for an interview for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Interview Details:</h3>
          <p><strong>Date & Time:</strong> ${formattedDate}</p>
          <p><strong>Type:</strong> ${interviewType}</p>
          <p><strong>Location:</strong> ${location}</p>
        </div>
        <p>Please make sure to be available at the scheduled time. Good luck!</p>
        <p>Best regards,<br>The Job Board Team</p>
      </div>
    `;

    return sendEmail({
      to: email,
      subject: `Interview Scheduled: ${jobTitle}`,
      html,
      text: `Hi ${firstName}, your interview for ${jobTitle} at ${companyName} is scheduled for ${formattedDate} (${interviewType}) at ${location}.`,
    });
  },

  sendSubscriptionExpiring: async (
    email: string,
    firstName: string,
    planName: string,
    expiryDate: Date
  ) => {
    const formattedDate = expiryDate.toLocaleDateString('id-ID');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Subscription Expiring Soon</h2>
        <p>Hi ${firstName},</p>
        <p>Your <strong>${planName}</strong> subscription is expiring on <strong>${formattedDate}</strong>.</p>
        <p>To continue enjoying premium features, please renew your subscription.</p>
        <p><a href="${process.env.NEXTAUTH_URL}/dashboard/subscription" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Renew Subscription</a></p>
        <p>Best regards,<br>The Job Board Team</p>
      </div>
    `;

    return sendEmail({
      to: email,
      subject: 'Subscription Expiring Soon',
      html,
      text: `Hi ${firstName}, your ${planName} subscription is expiring on ${formattedDate}. Please renew to continue enjoying premium features.`,
    });
  },
};
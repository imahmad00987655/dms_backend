import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter with timeout settings
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 20000, // 20 seconds
  socketTimeout: 20000, // 20 seconds
  greetingTimeout: 20000, // 20 seconds
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
export const verifyEmailConfig = async () => {
  // Check if email credentials are provided
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('⚠️  Email service not configured: Missing EMAIL_USER or EMAIL_PASS environment variables');
    return false;
  }

  if (!process.env.EMAIL_FROM) {
    console.error('⚠️  Email service not configured: Missing EMAIL_FROM environment variable');
    return false;
  }

  try {
    // Use Promise.race to add timeout (reduced to 8 seconds for faster startup)
    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email verification timeout after 8 seconds')), 8000)
    );
    
    await Promise.race([verifyPromise, timeoutPromise]);
    console.log('✅ Email service configured successfully');
    console.log('📧 Email service ready:', {
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM
    });
    return true;
  } catch (error) {
    console.error('❌ Email service configuration failed:', error.message);
    console.error('📧 Email Config Check:', {
      hasUser: !!process.env.EMAIL_USER,
      hasPass: !!process.env.EMAIL_PASS,
      hasFrom: !!process.env.EMAIL_FROM,
      user: process.env.EMAIL_USER,
      errorType: error.name,
      errorCode: error.code
    });
    
    // Provide helpful error messages
    if (error.message.includes('timeout')) {
      console.error('⚠️  Connection timeout - Check network/firewall settings');
    } else if (error.message.includes('Invalid login')) {
      console.error('⚠️  Invalid credentials - Check EMAIL_USER and EMAIL_PASS');
      console.error('⚠️  Make sure you are using Gmail App Password, not regular password');
    } else if (error.code === 'EAUTH') {
      console.error('⚠️  Authentication failed - Verify Gmail App Password');
    }
    
    return false;
  }
};

// Send OTP email
export const sendOTPEmail = async (email, otp, type = 'verification') => {
  // Verify email config before sending (if not already verified)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email service not configured: Missing EMAIL_USER or EMAIL_PASS');
  }

  try {
    const subject = type === 'password_reset' 
      ? 'Password Reset Verification Code' 
      : 'Email Verification Code';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">AccuFlow</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Enterprise Accounting System</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            ${type === 'password_reset' 
              ? 'You have requested to reset your password. Use the verification code below to complete the process.'
              : 'Thank you for signing up! Please use the verification code below to verify your email address.'
            }
          </p>
          
          <div style="background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #495057; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 25px;">
            This code will expire in 10 minutes. If you didn't request this, please ignore this email.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 AccuFlow. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return result;
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, firstName) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">AccuFlow</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Enterprise Accounting System</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to AccuFlow!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi ${firstName},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to AccuFlow! Your account has been successfully created and verified. You can now access all the features of our enterprise accounting system.
          </p>
          
          <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #495057; margin-top: 0;">What you can do now:</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Access your dashboard</li>
              <li>Manage your financial data</li>
              <li>Generate reports</li>
              <li>Track your business metrics</li>
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 AccuFlow. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to AccuFlow!',
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    return result;
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error.message);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
};

export default transporter; 
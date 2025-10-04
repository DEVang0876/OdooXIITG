import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Gmail configuration
    if (process.env.EMAIL_SERVICE === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS // Fixed to match .env file
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }
    // Generic SMTP configuration
    else {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS // Fixed to match .env file
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }
  }

  async sendEmail(to, subject, html, text = '') {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Expense Management System'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}:`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendOTPEmail(to, otp, userName = '') {
    const subject = 'Email Verification - Your OTP Code';

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #e0e0e0;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 10px;
            }
            .otp-box {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
            }
            .otp-code {
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                margin: 10px 0;
                font-family: 'Courier New', monospace;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                font-size: 14px;
                color: #666;
                text-align: center;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin: 15px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">💼 Expense Management System</div>
                <p>Email Verification Required</p>
            </div>
            
            <h2>Hello ${userName ? userName + ',' : 'there,'}</h2>
            
            <p>Welcome to our Expense Management System! To complete your registration and secure your account, please verify your email address using the OTP code below:</p>
            
            <div class="otp-box">
                <p style="margin: 0; font-size: 16px;">Your verification code is:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; font-size: 14px;">This code expires in 10 minutes</p>
            </div>
            
            <p>Enter this code in the verification form to activate your account and start managing your expenses efficiently.</p>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                • This code is valid for 10 minutes only<br>
                • Do not share this code with anyone<br>
                • If you didn't request this verification, please ignore this email<br>
                • You can request a new code if this one expires
            </div>
            
            <p>If you're having trouble with the verification process, please contact our support team.</p>
            
            <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>© 2025 Expense Management System. All rights reserved.</p>
                <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
    Expense Management System - Email Verification
    
    Hello ${userName ? userName + ',' : 'there,'}
    
    Welcome to our Expense Management System! 
    
    Your email verification code is: ${otp}
    
    This code expires in 10 minutes.
    
    Enter this code in the verification form to activate your account.
    
    Security Notice:
    - This code is valid for 10 minutes only
    - Do not share this code with anyone
    - If you didn't request this verification, please ignore this email
    
    © 2025 Expense Management System
    `;

    return await this.sendEmail(to, subject, html, text);
  }

  async sendWelcomeEmail(to, userName) {
    const subject = 'Welcome to Expense Management System!';

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #e0e0e0;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .success-icon {
                font-size: 48px;
                margin-bottom: 15px;
            }
            .features {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .feature-list {
                list-style: none;
                padding: 0;
            }
            .feature-list li {
                padding: 8px 0;
                border-bottom: 1px solid #e0e0e0;
            }
            .feature-list li:last-child {
                border-bottom: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="success-icon">🎉</div>
                <h1>Welcome to Expense Management System!</h1>
            </div>
            
            <h2>Hello ${userName}!</h2>
            
            <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
            
            <div class="features">
                <h3>🚀 What you can do now:</h3>
                <ul class="feature-list">
                    <li>📝 Create and submit expense reports</li>
                    <li>📸 Upload receipts and documentation</li>
                    <li>📊 Track your expense history and analytics</li>
                    <li>🔔 Receive real-time approval notifications</li>
                    <li>💰 Monitor your spending patterns</li>
                    <li>📱 Access your account from any device</li>
                </ul>
            </div>
            
            <p>Start by logging into your account and exploring the dashboard. If you need any assistance, our support team is here to help!</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #666;">Ready to get started?</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Login to Dashboard
                </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; 
                        font-size: 14px; color: #666; text-align: center;">
                <p>© 2025 Expense Management System. All rights reserved.</p>
                <p>This email was sent to ${to}</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return await this.sendEmail(to, subject, html);
  }

  // Test email connection
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('Email service configuration error:', error);
      return false;
    }
  }
}

// Create singleton instance
const emailService = new EmailService();
export default emailService;
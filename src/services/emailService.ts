// Client-side alternative using API endpoint
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  attachments?: Array<{ filename: string; content: string }>
) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html, attachments }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Email templates
export const generateTaxCertificateEmail = (
  userName: string,
  calculationType: string,
  taxAmount: number,
  netTakeHome: number,
  year: string,
  pdfUrl?: string
) => {
  const appUrl = (import.meta.env.VITE_APP_URL || 'https://paktaxcalculator.net');
  return `
    <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
      <div style="background: white; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 8px;">
        <h1 style="color: #01411C; text-align: center;">Tax Calculation Summary</h1>
        
        <p>Dear ${userName},</p>
        
        <p>Thank you for using <strong>Pakistan Tax Calculator</strong>. Here is your tax calculation summary:</p>
        
        <div style="background: #f0f9f7; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p><strong>Calculation Type:</strong> ${calculationType}</p>
          <p><strong>Tax Year:</strong> ${year}</p>
          <p><strong>Total Tax:</strong> <span style="color: #01411C; font-size: 18px; font-weight: bold;">PKR ${taxAmount.toLocaleString()}</span></p>
          <p><strong>Net Take Home:</strong> <span style="color: #0a6b34; font-size: 18px; font-weight: bold;">PKR ${netTakeHome.toLocaleString()}</span></p>
        </div>
        
        ${pdfUrl ? `<p style="text-align: center;"><a href="${pdfUrl}" style="background: #01411C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Download PDF Certificate</a></p>` : ''}
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 12px;">
          <strong>Disclaimer:</strong> This calculation is for estimation purposes only and is not a substitute for professional tax advice. 
          Please consult with a tax professional for accurate tax guidance.
        </p>
        
        <p style="color: #666; font-size: 12px; text-align: center;">
          © Pakistan Tax Calculator | <a href="https://paktaxcalculator.net" style="color: #01411C; text-decoration: none;">paktaxcalculator.net</a>
        </p>
      </div>
    </div>
  `;
};

export const generateWelcomeEmail = (userName: string) => {
  const appUrl = (import.meta.env.VITE_APP_URL || 'https://paktaxcalculator.net');
  return `
    <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
      <div style="background: white; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 8px;">
        <h1 style="color: #01411C; text-align: center;">Welcome to Pakistan Tax Calculator!</h1>
        
        <p>Dear ${userName},</p>
        
        <p>Welcome! We're excited to have you join our community of Pakistani taxpayers.</p>
        
        <div style="background: #f0f9f7; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #01411C; margin-top: 0;">Features you can now enjoy:</h3>
          <ul style="color: #333;">
            <li>📊 Calculate income tax, sales tax, withholding tax, and zakat</li>
            <li>💾 Save your calculations for later</li>
            <li>📧 Receive tax certificates via email</li>
            <li>📈 View your calculation history</li>
            <li>🤖 Get AI-powered tax optimization suggestions</li>
            <li>📱 Access from any device</li>
          </ul>
        </div>
        
        <p><a href="${appUrl}" style="background: #01411C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Get Started Now</a></p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 12px; text-align: center;">
          © Pakistan Tax Calculator | <a href="https://paktaxcalculator.net" style="color: #01411C; text-decoration: none;">paktaxcalculator.net</a>
        </p>
      </div>
    </div>
  `;
};

export const generateCalculationReminderEmail = (
  userName: string,
  pendingCalculations: number
) => {
  const appUrl = (import.meta.env.VITE_APP_URL || 'https://paktaxcalculator.net');
  return `
    <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
      <div style="background: white; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 8px;">
        <h1 style="color: #01411C;">Tax Calculation Reminder</h1>
        
        <p>Hi ${userName},</p>
        
        <p>You have <strong>${pendingCalculations}</strong> incomplete tax calculation(s) in your account. Don't forget to review and export them as certificates!</p>
        
        <p style="text-align: center;">
          <a href="${appUrl}/history" style="background: #01411C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Calculations</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 12px; text-align: center;">
          © Pakistan Tax Calculator | <a href="https://paktaxcalculator.net" style="color: #01411C; text-decoration: none;">paktaxcalculator.net</a>
        </p>
      </div>
    </div>
  `;
};

export interface EmailTemplateData {
  adminName: string;
  studioName: string;
  adminEmail: string;
  referenceEmail?: string;
  status?: string;
  loginUrl?: string;
  reason?: string;
  city?: string;
  registrationDate?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  trialDays?: number;
  planName?: string;
  amount?: number;
  paymentUrl?: string;
  paymentId?: string;
  paymentDate?: string;
}

// 1. Free Trial Registration Received Email (Subject: LUMINA – Free Trial Registration Received)
export function getRegistrationSuccessTemplate(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const subject = 'LUMINA – Free Trial Registration Received';
  const regDate = data.registrationDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const text = `Hi ${data.adminName},

Thank you for registering for the LUMINA Photography Management Free Trial.

We have successfully received your registration request.

Status: Pending Review
Registration Date: ${regDate}
Studio / Business Name: ${data.studioName}
Registered Email: ${data.adminEmail}

Our LUMINA team is reviewing your request. You will receive another email once your 7-day free trial request has been approved.

Thank you,
LUMINA Photography Management`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #5e35b1; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; tracking: 0.05em; }
    .header p { margin: 6px 0 0 0; font-size: 12px; color: #d1c4e9; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
    .content { padding: 32px 24px; }
    .badge { display: inline-block; background-color: #fffbebf7; color: #92400e; border: 1px solid #fde68a; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 20px; }
    .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; font-size: 14px; }
    .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .details-row:last-child { border-bottom: none; }
    .details-label { color: #64748b; font-weight: 600; }
    .details-value { color: #0f172a; font-weight: 700; text-align: right; }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LUMINA</h1>
      <p>Free Trial Registration Received</p>
    </div>
    <div class="content">
      <div class="badge">● Pending Approval</div>
      <h2>Hi ${data.adminName},</h2>
      <p>Thank you for registering for the <strong>LUMINA 7-Day Free Trial</strong>.</p>
      <p>Your studio registration for <strong>${data.studioName}</strong> has been successfully received and is currently <strong>Pending</strong>.</p>
      <p>The LUMINA team will review your request. You will receive another email once your request has been approved.</p>
      
      <div class="details-box">
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 12px; color: #5e35b1;">Registration Information</div>
        <div class="details-row"><span class="details-label">Registered Name:</span> <span class="details-value">${data.adminName}</span></div>
        <div class="details-row"><span class="details-label">Studio / Business Name:</span> <span class="details-value">${data.studioName}</span></div>
        <div class="details-row"><span class="details-label">Email:</span> <span class="details-value">${data.adminEmail}</span></div>
        <div class="details-row"><span class="details-label">Registration Date:</span> <span class="details-value">${regDate}</span></div>
        <div class="details-row"><span class="details-label">Status:</span> <span class="details-value" style="color: #d97706;">Pending Review</span></div>
      </div>
      
      <p>Thank you,<br><strong>LUMINA Photography Management</strong></p>
    </div>
    <div class="footer">
      LUMINA Photography Management Platform © 2026
    </div>
  </div>
</body>
</html>`;

  return { subject, html, text };
}

// 2. Free Trial Approved Email (Subject: LUMINA – Your Free Trial Has Been Approved)
export function getStudioApprovedTemplate(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const subject = 'LUMINA – Your Free Trial Has Been Approved';
  const loginUrl = data.loginUrl || 'http://localhost:5173/login';
  const startDate = data.trialStartDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const endDate = data.trialEndDate || new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const text = `Hi ${data.adminName},

Great news! Your 7-Day Free Trial request for ${data.studioName} has been approved by the Master Admin.

Approval Confirmation: Approved & Active
Trial Start Date: ${startDate}
Trial End Date: ${endDate}
Number of Trial Days: 7 Days

You can now log in to LUMINA and start managing your photography studio.

Login URL: ${loginUrl}

Please note: Payment will be required after your 7-day free trial ends to maintain full access.

Thank you,
LUMINA Photography Management`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #5e35b1; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; tracking: 0.05em; }
    .header p { margin: 6px 0 0 0; font-size: 12px; color: #d1c4e9; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
    .content { padding: 32px 24px; }
    .badge { display: inline-block; background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 20px; }
    .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; font-size: 14px; }
    .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .details-row:last-child { border-bottom: none; }
    .details-label { color: #64748b; font-weight: 600; }
    .details-value { color: #0f172a; font-weight: 700; text-align: right; }
    .btn { display: inline-block; background-color: #5e35b1; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; margin: 20px 0; text-align: center; box-shadow: 0 4px 12px rgba(94, 53, 177, 0.25); }
    .note-box { background: #fffbebf7; border: 1px solid #fde68a; color: #92400e; padding: 14px; border-radius: 10px; font-size: 13px; margin: 16px 0; }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LUMINA</h1>
      <p>Free Trial Approved</p>
    </div>
    <div class="content">
      <div class="badge">✓ Free Trial Approved</div>
      <h2>Hi ${data.adminName},</h2>
      <p style="font-size: 16px; font-weight: 700; color: #059669;">Your Free Trial Has Been Approved! 🎉</p>
      <p>Your studio access request for <strong>${data.studioName}</strong> has been approved by the Master Admin. Your 7-day free trial is now active.</p>
      
      <div class="details-box">
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 12px; color: #5e35b1;">Free Trial Details</div>
        <div class="details-row"><span class="details-label">Studio Name:</span> <span class="details-value">${data.studioName}</span></div>
        <div class="details-row"><span class="details-label">Trial Duration:</span> <span class="details-value">7 Days</span></div>
        <div class="details-row"><span class="details-label">Trial Start Date:</span> <span class="details-value">${startDate}</span></div>
        <div class="details-row"><span class="details-label">Trial End Date:</span> <span class="details-value">${endDate}</span></div>
        <div class="details-row"><span class="details-label">Status:</span> <span class="details-value" style="color: #059669;">ACTIVE</span></div>
      </div>
      
      <div className="note-box">
        <strong>Important Notice:</strong> Payment will be required after your 7-day free trial ends to maintain uninterrupted access.
      </div>

      <div style="text-align: center;">
        <a href="${loginUrl}" class="btn" target="_blank">LOGIN TO LUMINA</a>
      </div>
      
      <p>Thank you,<br><strong>LUMINA Photography Management</strong></p>
    </div>
    <div class="footer">
      LUMINA Photography Management Platform © 2026
    </div>
  </div>
</body>
</html>`;

  return { subject, html, text };
}

// 3. Free Trial Rejection Email
export function getStudioRejectedTemplate(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const subject = 'LUMINA – Free Trial Registration Update';

  const text = `Hi ${data.adminName},

Thank you for registering your studio with LUMINA.

We have reviewed your request for ${data.studioName}.
Status: Not Approved
${data.reason ? 'Reason: ' + data.reason : ''}

If you have any questions, please contact the LUMINA platform support team.

Thank you,
LUMINA Photography Management`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #475569; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; tracking: 0.05em; }
    .header p { margin: 6px 0 0 0; font-size: 12px; color: #cbd5e1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
    .content { padding: 32px 24px; }
    .badge { display: inline-block; background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 20px; }
    .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; font-size: 14px; }
    .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .details-row:last-child { border-bottom: none; }
    .details-label { color: #64748b; font-weight: 600; }
    .details-value { color: #0f172a; font-weight: 700; text-align: right; }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LUMINA</h1>
      <p>Studio Registration Update</p>
    </div>
    <div class="content">
      <div class="badge">✕ Not Approved</div>
      <h2>Hi ${data.adminName},</h2>
      <p>Thank you for registering your studio with LUMINA. We have reviewed your registration request.</p>
      
      <div class="details-box">
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 12px; color: #475569;">Application Status</div>
        <div class="details-row"><span class="details-label">Studio Name:</span> <span class="details-value">${data.studioName}</span></div>
        <div class="details-row"><span class="details-label">Status:</span> <span class="details-value" style="color: #dc2626;">Not Approved</span></div>
        ${data.reason ? `<div class="details-row"><span class="details-label">Reason:</span> <span class="details-value">${data.reason}</span></div>` : ''}
      </div>
      
      <p>If you have any questions, please contact the LUMINA platform support team.</p>
      
      <p>Thank you,<br><strong>LUMINA Photography Management</strong></p>
    </div>
    <div class="footer">
      LUMINA Photography Management Platform © 2026
    </div>
  </div>
</body>
</html>`;

  return { subject, html, text };
}

// 4. Payment Request Email (Subject: LUMINA – Free Trial Completed – Payment Required)
export function getPaymentRequestTemplate(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const subject = 'LUMINA – Free Trial Completed – Payment Required';
  const paymentUrl = data.paymentUrl || 'http://localhost:5173/pay';
  const endDate = data.trialEndDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const planName = data.planName || 'Studio Pro Plan';
  const amountStr = data.amount ? `₹${data.amount.toLocaleString('en-IN')}` : '₹4,999';

  const text = `Hi ${data.adminName},

Your 7-day LUMINA Free Trial for ${data.studioName} has completed on ${endDate}.

To continue using LUMINA and retain uninterrupted access to your studio clients, workflow, and galleries, please complete your subscription payment.

Plan: ${planName}
Amount Due: ${amountStr}
Trial End Date: ${endDate}

Make Payment: ${paymentUrl}

Thank you,
LUMINA Photography Management`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #ea580c; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; tracking: 0.05em; }
    .header p { margin: 6px 0 0 0; font-size: 12px; color: #ffedd5; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
    .content { padding: 32px 24px; }
    .badge { display: inline-block; background-color: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 20px; }
    .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; font-size: 14px; }
    .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .details-row:last-child { border-bottom: none; }
    .details-label { color: #64748b; font-weight: 600; }
    .details-value { color: #0f172a; font-weight: 700; text-align: right; }
    .btn { display: inline-block; background-color: #ea580c; color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 800; font-size: 15px; margin: 24px 0; text-align: center; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3); }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LUMINA</h1>
      <p>Free Trial Completed — Action Required</p>
    </div>
    <div class="content">
      <div class="badge">● Free Trial Expired</div>
      <h2>Hi ${data.adminName},</h2>
      <p>Your 7-day Free Trial for <strong>${data.studioName}</strong> completed on <strong>${endDate}</strong>.</p>
      <p>To continue using LUMINA and keep full access to your studio dashboard, client projects, and shoots, please complete your plan payment below.</p>
      
      <div class="details-box">
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 12px; color: #ea580c;">Subscription Details</div>
        <div class="details-row"><span class="details-label">Studio Name:</span> <span class="details-value">${data.studioName}</span></div>
        <div class="details-row"><span class="details-label">Plan Name:</span> <span class="details-value">${planName}</span></div>
        <div class="details-row"><span class="details-label">Trial End Date:</span> <span class="details-value">${endDate}</span></div>
        <div class="details-row"><span class="details-label">Amount Payable:</span> <span class="details-value" style="color: #ea580c; font-size: 16px;">${amountStr}</span></div>
      </div>
      
      <div style="text-align: center;">
        <a href="${paymentUrl}" class="btn" target="_blank">MAKE PAYMENT NOW</a>
      </div>
      
      <p>Thank you,<br><strong>LUMINA Photography Management</strong></p>
    </div>
    <div class="footer">
      LUMINA Photography Management Platform © 2026
    </div>
  </div>
</body>
</html>`;

  return { subject, html, text };
}

// 5. Payment Success Email (Subject: LUMINA – Payment Successful)
export function getPaymentSuccessTemplate(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const subject = 'LUMINA – Payment Successful';
  const payDate = data.paymentDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const amountStr = data.amount ? `₹${data.amount.toLocaleString('en-IN')}` : '₹4,999';
  const planName = data.planName || 'Studio Pro Subscription';
  const refId = data.paymentId || `pay_${Date.now()}`;

  const text = `Hi ${data.adminName},

Thank you for your payment!

Payment Status: Successful
Amount Paid: ${amountStr}
Plan Name: ${planName}
Payment Date: ${payDate}
Razorpay Payment ID: ${refId}
Subscription Status: Active

Your studio account for ${data.studioName} is now fully upgraded and active.

Thank you for choosing LUMINA!
LUMINA Photography Management`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #059669; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; tracking: 0.05em; }
    .header p { margin: 6px 0 0 0; font-size: 12px; color: #a7f3d0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
    .content { padding: 32px 24px; }
    .badge { display: inline-block; background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 20px; }
    .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; font-size: 14px; }
    .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .details-row:last-child { border-bottom: none; }
    .details-label { color: #64748b; font-weight: 600; }
    .details-value { color: #0f172a; font-weight: 700; text-align: right; }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LUMINA</h1>
      <p>Payment Received</p>
    </div>
    <div class="content">
      <div class="badge">✓ Payment Successful</div>
      <h2>Hi ${data.adminName},</h2>
      <p style="font-size: 16px; font-weight: 700; color: #059669;">Thank you for your payment! 🎉</p>
      <p>Your payment for <strong>${data.studioName}</strong> has been successfully processed via Razorpay. Your subscription is active.</p>
      
      <div class="details-box">
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 12px; color: #059669;">Payment Receipt Details</div>
        <div class="details-row"><span class="details-label">Studio Name:</span> <span class="details-value">${data.studioName}</span></div>
        <div class="details-row"><span class="details-label">Plan Name:</span> <span class="details-value">${planName}</span></div>
        <div class="details-row"><span class="details-label">Amount Paid:</span> <span class="details-value" style="color: #059669; font-size: 16px;">${amountStr}</span></div>
        <div class="details-row"><span class="details-label">Payment Date:</span> <span class="details-value">${payDate}</span></div>
        <div class="details-row"><span class="details-label">Razorpay Ref ID:</span> <span class="details-value">${refId}</span></div>
        <div class="details-row"><span class="details-label">Subscription Status:</span> <span class="details-value" style="color: #059669;">ACTIVE</span></div>
      </div>
      
      <p>Thank you for choosing LUMINA Photography Management SaaS!</p>
      <p>Best regards,<br><strong>LUMINA Team</strong></p>
    </div>
    <div class="footer">
      LUMINA Photography Management Platform © 2026
    </div>
  </div>
</body>
</html>`;

  return { subject, html, text };
}

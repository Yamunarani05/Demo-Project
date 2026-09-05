export interface EmailTemplateData {
  adminName: string;
  studioName: string;
  adminEmail: string;
  referenceEmail?: string;
  status?: string;
  loginUrl?: string;
  reason?: string;
  city?: string;
}

export function getRegistrationSuccessTemplate(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const subject = 'Studio Registration Successful — LUMINA';
  const loginUrl = data.loginUrl || 'http://localhost:5173/login';

  const text = `Hi ${data.adminName},

Your studio registration for ${data.studioName} has been successfully submitted.

Registration Status: Pending Approval

Our Great Master Admin will review your studio access request.
You will receive another email once your request has been approved or rejected.

Studio Details:
Studio Name: ${data.studioName}
Admin Name: ${data.adminName}
Registered Email: ${data.adminEmail}
Status: Pending Approval

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
      <p>Studio Registration Received</p>
    </div>
    <div class="content">
      <div class="badge">● Pending Approval</div>
      <h2>Hi ${data.adminName},</h2>
      <p>Your studio registration for <strong>${data.studioName}</strong> has been successfully submitted.</p>
      <p>Our Great Master Admin will review your studio access request. You will receive another email once your request has been approved or rejected.</p>
      
      <div class="details-box">
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 12px; color: #5e35b1;">Studio Registration Details</div>
        <div class="details-row"><span class="details-label">Studio Name:</span> <span class="details-value">${data.studioName}</span></div>
        <div class="details-row"><span class="details-label">Admin Name:</span> <span class="details-value">${data.adminName}</span></div>
        <div class="details-row"><span class="details-label">Registered Email:</span> <span class="details-value">${data.adminEmail}</span></div>
        ${data.city ? `<div class="details-row"><span class="details-label">Location:</span> <span class="details-value">${data.city}</span></div>` : ''}
        <div class="details-row"><span class="details-label">Status:</span> <span class="details-value" style="color: #d97706;">Pending Approval</span></div>
      </div>
      
      <p style="font-size: 13px; color: #64748b;">Please note: Plaintext passwords are never emailed or stored unencrypted for your account security.</p>
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

export function getStudioApprovedTemplate(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const subject = 'Studio Access Approved — Welcome to LUMINA 🎉';
  const loginUrl = data.loginUrl || 'http://localhost:5173/login';

  const text = `Hi ${data.adminName},

Great news!

Your studio access request has been approved by the Great Master Admin.

Studio Name: ${data.studioName}
Status: Approved / Active

You can now log in to LUMINA and access your Studio Dashboard.
Your studio account is now active.

Login URL: ${loginUrl}

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
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LUMINA</h1>
      <p>Studio Access Approved</p>
    </div>
    <div class="content">
      <div class="badge">✓ Approved & Active</div>
      <h2>Hi ${data.adminName},</h2>
      <p style="font-size: 16px; font-weight: 700; color: #059669;">Great news! 🎉</p>
      <p>Your studio access request has been approved by the Great Master Admin.</p>
      
      <div class="details-box">
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 12px; color: #5e35b1;">Studio Information</div>
        <div class="details-row"><span class="details-label">Studio Name:</span> <span class="details-value">${data.studioName}</span></div>
        <div class="details-row"><span class="details-label">Status:</span> <span class="details-value" style="color: #059669;">Approved / Active</span></div>
        <div class="details-row"><span class="details-label">Registered Email:</span> <span class="details-value">${data.adminEmail}</span></div>
      </div>
      
      <p>You can now log in to LUMINA and access your Studio Dashboard to onboard clients and manage shoots.</p>
      
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

export function getStudioRejectedTemplate(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const subject = 'Studio Access Request Update — LUMINA';

  const text = `Hi ${data.adminName},

Thank you for registering your studio with LUMINA.

We have reviewed your studio access request.

Studio Name: ${data.studioName}
Status: Not Approved

Your studio access request has not been approved at this time.
${data.reason ? 'Reason: ' + data.reason : ''}

If you believe this was unexpected or need further information, please contact the LUMINA platform administrator.

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
      <p>Studio Access Request Status</p>
    </div>
    <div class="content">
      <div class="badge">✕ Not Approved</div>
      <h2>Hi ${data.adminName},</h2>
      <p>Thank you for registering your studio with LUMINA. We have reviewed your studio access request.</p>
      
      <div class="details-box">
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 12px; color: #475569;">Application Status</div>
        <div class="details-row"><span class="details-label">Studio Name:</span> <span class="details-value">${data.studioName}</span></div>
        <div class="details-row"><span class="details-label">Status:</span> <span class="details-value" style="color: #dc2626;">Not Approved</span></div>
        ${data.reason ? `<div class="details-row"><span class="details-label">Reason:</span> <span class="details-value">${data.reason}</span></div>` : ''}
      </div>
      
      <p>Your studio access request has not been approved at this time.</p>
      <p>If you believe this was unexpected or need further information, please contact the LUMINA platform administrator.</p>
      
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

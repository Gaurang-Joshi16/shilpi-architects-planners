import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';



export async function POST(request) {
  try {
    const formData = await request.formData();

    // Extract all text fields
    const fields = {};
    const attachments = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (value.size > 0) {
          const buffer = Buffer.from(await value.arrayBuffer());
          attachments.push({
            filename: value.name,
            content: buffer,
          });
        }
      } else {
        fields[key] = value;
      }
    }

    const category = fields.category || 'General';
    const name = fields.name || fields.companyName || 'Unknown';

    // Build HTML email body
    const rows = Object.entries(fields)
      .filter(([k]) => k !== 'category')
      .map(
        ([k, v]) =>
          `<tr>
            <td style="padding:8px 12px;font-weight:600;background:#f5f5f5;border:1px solid #ddd;white-space:nowrap;font-family:monospace;font-size:13px;text-transform:uppercase;">${k.replace(/_/g, ' ')}</td>
            <td style="padding:8px 12px;border:1px solid #ddd;font-family:sans-serif;font-size:14px;">${v}</td>
          </tr>`
      )
      .join('');

    const html = `
      <div style="font-family:sans-serif;max-width:700px;margin:0 auto;">
        <div style="background:#1a1a2e;padding:24px 32px;border-radius:4px 4px 0 0;">
          <h1 style="color:#ffffff;margin:0;font-size:20px;letter-spacing:2px;font-family:monospace;">
            SHILPI ARCHITECTS & PLANNERS
          </h1>
          <p style="color:#aaaaaa;margin:6px 0 0;font-size:13px;font-family:monospace;">
            NEW CONTACT FORM SUBMISSION
          </p>
        </div>
        <div style="background:#ffffff;padding:24px 32px;border:1px solid #ddd;border-top:none;">
          <table style="border-collapse:collapse;width:100%;">
            <tr>
              <td colspan="2" style="padding:8px 12px;background:#45A8A1;color:#fff;font-weight:700;font-family:monospace;font-size:13px;letter-spacing:1px;text-transform:uppercase;border:1px solid #45A8A1;">
                CATEGORY: ${category}
              </td>
            </tr>
            ${rows}
          </table>
          ${
            attachments.length > 0
              ? `<p style="margin-top:20px;font-size:13px;color:#666;font-family:monospace;">
                  📎 ${attachments.length} file(s) attached: ${attachments.map((a) => a.filename).join(', ')}
                 </p>`
              : ''
          }
        </div>
        <div style="background:#f5f5f5;padding:12px 32px;border:1px solid #ddd;border-top:none;border-radius:0 0 4px 4px;">
          <p style="margin:0;font-size:12px;color:#999;font-family:monospace;">
            Sent from <a href="https://shilpiarchitectsandplanners.in" style="color:#999;">shilpiarchitectsandplanners.in</a> contact form
          </p>
        </div>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Shilpi Website" <${process.env.GMAIL_USER}>`,
      to: process.env.CONTACT_RECEIVER,
      subject: `${category} — ${name}`,
      html,
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

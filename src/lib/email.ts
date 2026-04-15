import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.EMAIL;
  const pass = process.env.EMAIL_PASSWORD;
  if (!user || !pass) throw new Error("EMAIL and EMAIL_PASSWORD env vars are required");

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendInviteEmail({
  to,
  firstName,
  companyName,
  inviteLink,
}: {
  to: string;
  firstName: string;
  companyName: string;
  inviteLink: string;
}) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"Locroll" <${process.env.EMAIL}>`,
    to,
    subject: `You've been invited to join ${companyName} on Locroll`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; background: #070d1f; color: #dce1fb; padding: 40px; border-radius: 12px;">
        <div style="margin-bottom: 32px;">
          <span style="background: #13f09c; color: #0c1324; font-weight: 900; font-size: 14px; padding: 6px 12px; border-radius: 6px;">Locroll</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 900; color: #ffffff; margin: 0 0 12px;">Hi ${firstName},</h1>
        <p style="color: #dce1fb; opacity: 0.8; margin: 0 0 24px; line-height: 1.6;">
          <strong style="color: #ffffff;">${companyName}</strong> has invited you to set up your wallet on Locroll so you can receive your salary in USDC — directly, with no bank needed.
        </p>
        <p style="color: #dce1fb; opacity: 0.8; margin: 0 0 32px; line-height: 1.6;">
          Click the button below to accept your invite. It only takes a minute — we'll provision your wallet automatically.
        </p>
        <a href="${inviteLink}" style="display: inline-block; background: #13f09c; color: #0c1324; font-weight: 900; font-size: 15px; padding: 14px 28px; border-radius: 8px; text-decoration: none;">
          Accept Invite →
        </a>
        <p style="margin: 32px 0 0; font-size: 12px; color: #dce1fb; opacity: 0.4;">
          Or copy this link: ${inviteLink}
        </p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;" />
        <p style="font-size: 12px; color: #dce1fb; opacity: 0.4; margin: 0;">
          Powered by Locus · Secured by Privy · Compliant by default
        </p>
      </div>
    `,
  });
}

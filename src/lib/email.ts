import { supabase } from "./supabase";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email using Supabase Edge Functions
 * Note: This requires setting up an Edge Function in Supabase
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: any }> {
  try {
    // In a real implementation, you would call a Supabase Edge Function
    // that uses a service like SendGrid, Mailgun, or AWS SES
    console.log("Sending email:", options);

    // For now, we'll simulate a successful email send
    // In a real app, you would uncomment the code below

    /*
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: {
        to: options.to,
        subject: options.subject,
        html: options.html,
        from: options.from || "noreply@kontrakpro.com",
      },
    });

    if (error) {
      throw error;
    }

    return { success: true };
    */

    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

/**
 * Send a signature request email
 */
export async function sendSignatureRequestEmail(
  to: string,
  documentName: string,
  requestedBy: string,
  signatureLink: string,
  message?: string
): Promise<{ success: boolean; error?: any }> {
  const subject = `Permintaan Tanda Tangan: ${documentName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Permintaan Tanda Tangan</h2>
      <p>Halo,</p>
      <p>${requestedBy} telah meminta Anda untuk menandatangani dokumen <strong>${documentName}</strong>.</p>
      ${message ? `<p>Pesan: "${message}"</p>` : ''}
      <div style="margin: 30px 0;">
        <a href="${signatureLink}" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Tanda Tangani Dokumen
        </a>
      </div>
      <p>Atau buka link berikut:</p>
      <p><a href="${signatureLink}">${signatureLink}</a></p>
      <hr style="border: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #666; font-size: 12px;">
        Email ini dikirim oleh KontrakPro. Jika Anda tidak mengharapkan email ini, silakan abaikan.
      </p>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

/**
 * Send a signature completion notification email
 */
export async function sendSignatureCompletedEmail(
  to: string,
  documentName: string,
  signedBy: string,
  documentLink: string
): Promise<{ success: boolean; error?: any }> {
  const subject = `Dokumen Telah Ditandatangani: ${documentName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Dokumen Telah Ditandatangani</h2>
      <p>Halo,</p>
      <p>${signedBy} telah menandatangani dokumen <strong>${documentName}</strong>.</p>
      <div style="margin: 30px 0;">
        <a href="${documentLink}" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Lihat Dokumen
        </a>
      </div>
      <p>Atau buka link berikut:</p>
      <p><a href="${documentLink}">${documentLink}</a></p>
      <hr style="border: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #666; font-size: 12px;">
        Email ini dikirim oleh KontrakPro. Jika Anda tidak mengharapkan email ini, silakan abaikan.
      </p>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

/**
 * Send a document upload notification email
 */
export async function sendDocumentUploadedEmail(
  to: string,
  documentName: string,
  uploadedBy: string,
  documentLink: string
): Promise<{ success: boolean; error?: any }> {
  const subject = `Dokumen Baru Diunggah: ${documentName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Dokumen Baru Diunggah</h2>
      <p>Halo,</p>
      <p>${uploadedBy} telah mengunggah dokumen baru: <strong>${documentName}</strong>.</p>
      <div style="margin: 30px 0;">
        <a href="${documentLink}" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Lihat Dokumen
        </a>
      </div>
      <p>Atau buka link berikut:</p>
      <p><a href="${documentLink}">${documentLink}</a></p>
      <hr style="border: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #666; font-size: 12px;">
        Email ini dikirim oleh KontrakPro. Jika Anda tidak mengharapkan email ini, silakan abaikan.
      </p>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

/**
 * Send a team invitation email
 */
export async function sendInviteEmail(
  to: string,
  invitedBy: string,
  organizationName: string,
  inviteLink: string,
  role: string
): Promise<{ success: boolean; error?: any }> {
  const subject = `Undangan Bergabung dengan Tim ${organizationName}`;

  // Translate role to Indonesian
  let roleText = "anggota";
  if (role === "admin") roleText = "administrator";
  if (role === "viewer") roleText = "pengamat";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Undangan Bergabung dengan Tim</h2>
      <p>Halo,</p>
      <p>${invitedBy} mengundang Anda untuk bergabung dengan <strong>${organizationName}</strong> sebagai ${roleText}.</p>
      <div style="margin: 30px 0;">
        <a href="${inviteLink}" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Terima Undangan
        </a>
      </div>
      <p>Atau buka link berikut:</p>
      <p><a href="${inviteLink}">${inviteLink}</a></p>
      <hr style="border: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #666; font-size: 12px;">
        Email ini dikirim oleh KontrakPro. Jika Anda tidak mengharapkan email ini, silakan abaikan.
      </p>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { saveCommandeStrapi } from "@/lib/strapi";

/* ── Limites de validation ── */
const MAX_FIELD_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_ITEMS = 100;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* — Configuration de la limite de taille du corps (Largeur pour les PDF) — */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};

/* ── Rate limiting en mémoire : 10 requêtes / heure / IP ── */
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function clean(value: unknown, maxLen = MAX_FIELD_LENGTH): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

type OrderItem = {
  ref: string;
  label: string;
  quantity: number;
  prixAchat?: number;
  prixRevente?: number;
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function orderRef(date: Date): string {
  return `CMD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}`;
}

function fmtEur(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

/* ── Email admin : style Apple, imprimable, cases à cocher ── */
function buildAdminHtml(
  company: string,
  name: string,
  email: string,
  phone: string,
  pickupDate: string,
  message: string,
  items: OrderItem[],
  totalItems: number,
  ref: string,
  date: Date,
): string {
  const hasPrices = items.some((i) => i.prixAchat != null && i.prixAchat > 0);
  const totalB2B = items.reduce((s, i) => s + (i.prixAchat ?? 0) * i.quantity, 0);
  const totalRevente = items.reduce((s, i) => s + (i.prixRevente ?? 0) * i.quantity, 0);
  const margeNette = totalRevente - totalB2B;
  const tauxMarge = totalRevente > 0 ? ((margeNette / totalRevente) * 100).toFixed(1) : "0.0";

  const rows = items
    .map(
      (i) => `
      <tr style="border-bottom:1px solid #f0f0f0;">
        <td style="padding:14px 0 14px 4px; width:36px; text-align:center; font-size:18px; color:#1d1d1f; vertical-align:middle;">&#9744;</td>
        <td style="padding:14px 8px; font-weight:700; font-size:13px; color:#1d1d1f; white-space:nowrap; vertical-align:middle;">${esc(i.ref)}</td>
        <td style="padding:14px 8px; font-size:14px; color:#1d1d1f; vertical-align:middle;">${esc(i.label)}</td>
        <td style="padding:14px 0; text-align:right; font-weight:700; font-size:15px; color:#1d1d1f; white-space:nowrap; vertical-align:middle;">${i.quantity}</td>
        ${hasPrices ? `<td style="padding:14px 0 14px 12px; text-align:right; font-size:13px; color:#6e6e73; white-space:nowrap; vertical-align:middle;">${i.prixAchat != null ? fmtEur(i.prixAchat * i.quantity) : "—"}</td>` : ""}
      </tr>`,
    )
    .join("");

  const margeBlock = hasPrices && totalRevente > 0 ? `
  <!-- Analyse rentabilité -->
  <tr>
    <td style="padding:24px 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:10px 0; font-size:13px; color:#6e6e73;">Investissement B2B</td>
          <td style="padding:10px 0; text-align:right; font-size:14px; font-weight:700; color:#1d1d1f;">${fmtEur(totalB2B)}</td>
        </tr>
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:10px 0; font-size:13px; color:#6e6e73;">CA Potentiel (revente)</td>
          <td style="padding:10px 0; text-align:right; font-size:14px; font-weight:700; color:#0071e3;">${fmtEur(totalRevente)}</td>
        </tr>
      </table>
      <div style="margin-top:12px; background:#064e3b; border-radius:12px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:rgba(110,231,183,0.7); margin-bottom:4px;">Bénéfice net projeté</div>
          <div style="font-size:20px; font-weight:800; color:#6ee7b7; letter-spacing:-0.02em;">+${fmtEur(margeNette)}</div>
        </div>
        <div style="font-size:18px; font-weight:800; color:#6ee7b7;">+${tauxMarge}%</div>
      </div>
    </td>
  </tr>` : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  @media print {
    body { background: white !important; }
    .no-print { display: none !important; }
    .card { box-shadow: none !important; border: 1px solid #e0e0e5 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5f5f7;padding:40px 20px;">
  <tr><td align="center">
    <table class="card" width="600" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.10);max-width:600px;">

      <!-- Header -->
      <tr>
        <td style="padding:32px 40px 28px;border-bottom:1px solid #f0f0f0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td>
                <div style="font-size:24px;font-weight:700;letter-spacing:-0.03em;color:#1d1d1f;line-height:1;">OLDA</div>
                <div style="font-size:13px;color:#6e6e73;margin-top:5px;letter-spacing:0.02em;">Bon de préparation</div>
              </td>
              <td align="right" style="vertical-align:top;">
                <div style="font-size:13px;font-weight:600;color:#1d1d1f;">${esc(ref)}</div>
                <div style="font-size:12px;color:#6e6e73;margin-top:3px;">${formatDate(date)}</div>
                <div style="font-size:12px;color:#6e6e73;margin-top:1px;">${formatTime(date)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Client info -->
      <tr>
        <td style="padding:28px 40px 0;">
          <div style="background:#f5f5f7;border-radius:12px;padding:20px 24px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6e6e73;font-weight:600;margin-bottom:14px;">Client</div>
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="font-size:13px;color:#6e6e73;padding:3px 16px 3px 0;width:90px;">Entreprise</td>
                <td style="font-size:14px;font-weight:700;color:#1d1d1f;padding:3px 0;">${esc(company)}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#6e6e73;padding:3px 16px 3px 0;">Contact</td>
                <td style="font-size:14px;color:#1d1d1f;padding:3px 0;">${esc(name)}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#6e6e73;padding:3px 16px 3px 0;">Email</td>
                <td style="font-size:14px;padding:3px 0;"><a href="mailto:${esc(email)}" style="color:#0071e3;text-decoration:none;">${esc(email)}</a></td>
              </tr>
              ${phone ? `<tr>
                <td style="font-size:13px;color:#6e6e73;padding:3px 16px 3px 0;">Téléphone</td>
                <td style="font-size:14px;color:#1d1d1f;padding:3px 0;">${esc(phone)}</td>
              </tr>` : ""}
            </table>
          </div>
        </td>
      </tr>

      ${pickupDate ? `<!-- Bannière date de retrait -->
      <tr>
        <td style="padding:20px 40px 0;">
          <div style="background:#e8f4ff;border-radius:12px;padding:18px 24px;border-left:4px solid #0071e3;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#0056b3;font-weight:700;margin-bottom:6px;">Retrait souhaité le</div>
            <div style="font-size:20px;font-weight:800;color:#003d80;letter-spacing:-0.02em;">${esc(pickupDate)}</div>
          </div>
        </td>
      </tr>` : ""}

      <!-- Articles -->
      <tr>
        <td style="padding:28px 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding-bottom:12px;">
                <span style="font-size:16px;font-weight:700;color:#1d1d1f;">Articles à préparer</span>
                <span style="display:inline-block;background:#1d1d1f;color:#ffffff;font-size:12px;font-weight:600;border-radius:20px;padding:2px 9px;margin-left:8px;vertical-align:middle;">${totalItems}</span>
              </td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:2px solid #e0e0e5;">
                <th style="width:36px;padding:8px 0 8px 4px;"></th>
                <th style="text-align:left;padding:8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#6e6e73;">Réf</th>
                <th style="text-align:left;padding:8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#6e6e73;">Désignation</th>
                <th style="text-align:right;padding:8px 0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#6e6e73;">Qté</th>
                ${hasPrices ? `<th style="text-align:right;padding:8px 0 8px 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#6e6e73;">Total B2B</th>` : ""}
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </td>
      </tr>

      ${margeBlock}

      ${message ? `<!-- Message -->
      <tr>
        <td style="padding:24px 40px 0;">
          <div style="background:#fffbe6;border-radius:12px;padding:18px 22px;border-left:3px solid #f5a623;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#b07800;font-weight:600;margin-bottom:8px;">Note du client</div>
            <div style="font-size:14px;color:#1d1d1f;line-height:1.6;">${esc(message).replace(/\n/g, "<br>")}</div>
          </div>
        </td>
      </tr>` : ""}

      <!-- Footer -->
      <tr>
        <td style="padding:28px 40px 32px;">
          <div style="border-top:1px solid #f0f0f0;padding-top:20px;text-align:center;">
            <div style="font-size:12px;color:#aeaeb2;">OLDA — Commande reçue le ${formatDate(date)} à ${formatTime(date)}</div>
          </div>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ── Email client : confirmation élégante ── */
function buildClientHtml(
  company: string,
  name: string,
  items: OrderItem[],
  totalItems: number,
  ref: string,
  date: Date,
): string {
  const rows = items
    .map(
      (i) => `
      <tr style="border-bottom:1px solid #f0f0f0;">
        <td style="padding:12px 8px;font-weight:700;font-size:13px;color:#1d1d1f;white-space:nowrap;">${esc(i.ref)}</td>
        <td style="padding:12px 8px;font-size:14px;color:#1d1d1f;">${esc(i.label)}</td>
        <td style="padding:12px 0;text-align:right;font-weight:600;font-size:14px;color:#1d1d1f;white-space:nowrap;">× ${i.quantity}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5f5f7;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.10);max-width:600px;">

      <!-- Header avec confirmation -->
      <tr>
        <td align="center" style="padding:44px 40px 32px;background:#1d1d1f;">
          <div style="font-size:26px;font-weight:700;letter-spacing:-0.03em;color:#ffffff;margin-bottom:6px;">OLDA</div>
          <div style="width:40px;height:40px;background:#10b981;border-radius:50%;margin:20px auto 12px;text-align:center;line-height:40px;font-size:22px;color:white;">✓</div>
          <div style="font-size:20px;font-weight:600;color:#ffffff;margin-bottom:6px;">Commande confirmée</div>
          <div style="font-size:14px;color:#aeaeb2;">${esc(ref)}</div>
        </td>
      </tr>

      <!-- Message de bienvenue -->
      <tr>
        <td style="padding:32px 40px 24px;">
          <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#1d1d1f;">Bonjour ${esc(name)},</p>
          <p style="margin:0;font-size:15px;color:#3d3d3f;line-height:1.6;">
            Nous avons bien reçu la commande de <strong>${esc(company)}</strong>.<br>
            Notre équipe va la traiter dans les meilleurs délais et vous contactera prochainement pour confirmer les détails.
          </p>
        </td>
      </tr>

      <!-- Récapitulatif commande -->
      <tr>
        <td style="padding:0 40px 28px;">
          <div style="background:#f5f5f7;border-radius:12px;padding:20px 24px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6e6e73;font-weight:600;margin-bottom:14px;">Récapitulatif — ${totalItems} article${totalItems > 1 ? "s" : ""}</div>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
              <thead>
                <tr style="border-bottom:1px solid #e0e0e5;">
                  <th style="text-align:left;padding:6px 8px 10px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#6e6e73;">Réf</th>
                  <th style="text-align:left;padding:6px 8px 10px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#6e6e73;">Désignation</th>
                  <th style="text-align:right;padding:6px 0 10px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#6e6e73;">Qté</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <p style="margin:16px 0 0;font-size:13px;color:#6e6e73;text-align:center;">
            Votre devis PDF est joint à cet email.
          </p>
        </td>
      </tr>

      <!-- Info commande -->
      <tr>
        <td style="padding:0 40px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="font-size:13px;color:#6e6e73;padding:3px 0;width:130px;">Numéro de commande</td>
              <td style="font-size:13px;font-weight:600;color:#1d1d1f;padding:3px 0;">${esc(ref)}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6e6e73;padding:3px 0;">Date</td>
              <td style="font-size:13px;color:#1d1d1f;padding:3px 0;">${formatDate(date)}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:0 40px 36px;">
          <div style="border-top:1px solid #f0f0f0;padding-top:20px;">
            <p style="margin:0 0 6px;font-size:13px;color:#6e6e73;line-height:1.6;">
              Pour toute question concernant votre commande, répondez simplement à cet email.
            </p>
            <p style="margin:0;font-size:13px;color:#aeaeb2;">OLDA — ${formatDate(date)}</p>
          </div>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export async function POST(request: Request) {
  /* — Rate limiting — */
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    console.warn(`[commande] ⚠️ Rate limit atteint pour l'IP: ${ip}`);
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans une heure." },
      { status: 429 },
    );
  }

  console.log(`[commande] 📥 Nouvelle requête reçue de ${ip}`);

  /* — Lecture et validation du corps — */
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  const company = clean(raw.company);
  const name = clean(raw.name);
  const email = clean(raw.email);
  const phone = clean(raw.phone);
  const pickupDate = clean(raw.pickupDate);
  const message = clean(raw.message, MAX_MESSAGE_LENGTH);

  if (!company || !name || !email) {
    return NextResponse.json(
      { error: "Champs obligatoires manquants." },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Adresse email invalide." },
      { status: 400 },
    );
  }

  if (!Array.isArray(raw.items) || raw.items.length === 0) {
    return NextResponse.json(
      { error: "La commande est vide." },
      { status: 400 },
    );
  }

  if (raw.items.length > MAX_ITEMS) {
    return NextResponse.json(
      { error: "Trop d'articles dans la commande." },
      { status: 400 },
    );
  }

  const items: OrderItem[] = [];
  for (const item of raw.items) {
    if (!item || typeof item !== "object") continue;
    const i = item as Record<string, unknown>;
    const ref = clean(i.ref, 50);
    const label = clean(i.label);
    const quantity = Number(i.quantity);
    const prixAchat = typeof i.prixAchat === "number" ? i.prixAchat : undefined;
    const prixRevente = typeof i.prixRevente === "number" ? i.prixRevente : undefined;

    if (!ref || !label || !Number.isInteger(quantity) || quantity < 1 || quantity > 9999) {
      return NextResponse.json(
        { error: "Article invalide dans la commande." },
        { status: 400 },
      );
    }
    items.push({ ref, label, quantity, prixAchat, prixRevente });
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalB2B = items.reduce((s, i) => s + (i.prixAchat ?? 0) * i.quantity, 0);
  const totalRevente = items.reduce((s, i) => s + (i.prixRevente ?? 0) * i.quantity, 0);
  const margeNette = totalRevente - totalB2B;

  const now = new Date();
  const ref = orderRef(now);

  console.log(`[commande] 📝 Commande validée — ref: ${ref}, items: ${items.length}, total: ${fmtEur(totalB2B)}`);

  /* — PDF base64 optionnel (généré côté client) — */
  let pdfBuffer: Buffer | null = null;
  if (typeof raw.pdfBase64 === "string" && raw.pdfBase64.startsWith("data:application/pdf;base64,")) {
    try {
      const base64Data = raw.pdfBase64.slice("data:application/pdf;base64,".length);
      pdfBuffer = Buffer.from(base64Data, "base64");
    } catch {
      // PDF non critique — on continue sans
    }
  }

  /* — Construction des emails — */
  const adminHtml = buildAdminHtml(company, name, email, phone, pickupDate, message, items, totalItems, ref, now);
  const clientHtml = buildClientHtml(company, name, items, totalItems, ref, now);

  const itemsText = items.map((i) => `  ☐ ${i.ref} — ${i.label} × ${i.quantity}`).join("\n");
  const adminText = `NOUVELLE PRÉ-COMMANDE — ${ref}\n${"=".repeat(40)}\n\nClient: ${company} / ${name}\nEmail: ${email}\nTél: ${phone || "—"}${pickupDate ? `\nRetrait souhaité: ${pickupDate}` : ""}\n\nArticles (${totalItems})\n${itemsText}\n${message ? `\nNote: ${message}` : ""}`.trim();
  const clientText = `Bonjour ${name},\n\nVotre commande ${ref} a bien été reçue.\nVotre devis PDF est joint à cet email.\nNous vous contacterons prochainement.\n\nOLDA`;

  /* — Sauvegarde Strapi (asynchrone, non bloquante) — */
  saveCommandeStrapi({
    reference: ref,
    client_societe: company,
    client_nom: name,
    client_email: email,
    client_telephone: phone || undefined,
    date_enlevement: pickupDate || undefined,
    message: message || undefined,
    items,
    total_achat_ht: totalB2B,
    total_revente: totalRevente,
    marge_projetee: margeNette,
  })
    .then(() => console.log(`[commande] 📦 Sauvegarde Strapi OK pour ${ref}`))
    .catch((err) => console.error("[strapi] Erreur sauvegarde commande:", err));

  /* — Vérification clé Resend — */
  if (!process.env.RESEND_API_KEY) {
    console.error("[commande] ❌ RESEND_API_KEY manquante");
    return NextResponse.json(
      { error: "Le service d'email n'est pas configuré sur le serveur." },
      { status: 500 }
    );
  }

  /* — Envoi via Resend HTTP API — */
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.SMTP_FROM || "OLDA Commandes <onboarding@resend.dev>";
    const adminTo = process.env.ORDER_EMAIL || process.env.ADMIN_EMAILS || "";

    console.log(`[commande] 📧 Tentative envoi Resend — from: ${from}`);

    const pdfAttachment = pdfBuffer
      ? [{ filename: `devis-${ref}.pdf`, content: pdfBuffer }]
      : [];

    /* Email admin — critique : on doit absolument notifier l'équipe */
    const adminResult = await resend.emails.send({
      from,
      to: adminTo,
      replyTo: email,
      subject: `🛒 ${ref} — ${company} (${totalItems} article${totalItems > 1 ? "s" : ""})`,
      text: adminText,
      html: adminHtml,
      attachments: pdfAttachment,
    });

    if (adminResult.error) {
      console.error("[commande] ❌ Resend erreur (admin):", JSON.stringify(adminResult.error));
      throw new Error(`Échec envoi email admin: ${adminResult.error.message ?? JSON.stringify(adminResult.error)}`);
    }
    console.log(`[commande] ✅ Email admin envoyé — id: ${adminResult.data?.id}`);

    /* Email client — non critique : si ça échoue on log mais on ne bloque pas */
    const clientResult = await resend.emails.send({
      from,
      to: email,
      subject: `Votre commande OLDA — ${ref}`,
      text: clientText,
      html: clientHtml,
      attachments: pdfAttachment,
    });

    if (clientResult.error) {
      console.warn("[commande] ⚠️ Email client non envoyé (non bloquant):", JSON.stringify(clientResult.error));
    } else {
      console.log(`[commande] ✅ Email client envoyé — id: ${clientResult.data?.id}`);
    }
    return NextResponse.json({ ok: true, ref });
  } catch (error) {
    console.error("[commande] ❌ Erreur envoi email:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi. Veuillez réessayer." },
      { status: 500 },
    );
  }
}

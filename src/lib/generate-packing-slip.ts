/**
 * Bon de Préparation DTF — Template HTML email
 * Optimisé pour lecture rapide et pointage manuel sans erreur
 * Ink-friendly : fond blanc, texte noir, bordures fines
 */

type SlipItem = {
  ref: string;
  label: string;
  quantity: number;
  prixAchat?: number;
  prixRevente?: number;
};

type Sector = {
  name: string;
  icon: string;
  items: SlipItem[];
};

/* ── Escape HTML ── */
function e(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── Déduit le secteur de production depuis la référence produit ── */
function getSector(ref: string): string {
  const prefix = ref.split(/[\s-]/)[0].toUpperCase();
  if (["TCF", "TC", "TM", "TB"].some((p) => prefix.startsWith(p))) return "Tasses";
  if (["PCP", "PCB", "PCA", "PCFL"].some((p) => prefix.startsWith(p))) return "Porte-Clés";
  if (["MP", "VP", "MB", "MA"].some((p) => prefix.startsWith(p))) return "Magnets";
  if (prefix.startsWith("STI")) return "Stickers";
  if (["P-", "S-"].some((p) => ref.startsWith(p))) return "Textiles";
  if (["CPB", "SBB", "BNL", "BNS", "CP", "AT"].some((p) => prefix.startsWith(p))) return "Papeterie";
  if (["MOR", "DOM", "MIK", "YO", "JDC", "RB"].some((p) => prefix.startsWith(p))) return "Jeux";
  if (["SMA", "SMB", "PS", "FBC", "FCF", "LBF", "LBC", "IVL", "IVS", "ML", "CMB", "CML", "PBA"].some((p) => prefix.startsWith(p))) return "Accessoires Quotidien";
  if (["BB", "DPL", "DVL", "PL"].some((p) => prefix.startsWith(p))) return "Art de la Table";
  return "Divers";
}

const SECTOR_ICONS: Record<string, string> = {
  "Tasses": "☕",
  "Porte-Clés": "🔑",
  "Magnets": "🧲",
  "Stickers": "🏷️",
  "Textiles": "👜",
  "Papeterie": "✏️",
  "Jeux": "🎲",
  "Accessoires Quotidien": "📦",
  "Art de la Table": "🍽️",
  "Divers": "📋",
};

/* ── Génère la grille de cases à cocher (lignes de 10) ── */
function buildCheckboxGrid(quantity: number): string {
  if (quantity <= 0) return "<em style='color:#999;font-size:11px;'>—</em>";

  const rows: string[] = [];
  const ROW_SIZE = 10;

  for (let i = 0; i < quantity; i += ROW_SIZE) {
    const count = Math.min(ROW_SIZE, quantity - i);
    const boxes = Array.from({ length: count })
      .map(() => `<span style="
        display:inline-block;
        width:18px; height:18px;
        border:1.5px solid #333;
        border-radius:3px;
        margin:2px;
        vertical-align:middle;
        flex-shrink:0;
      "></span>`)
      .join("");
    rows.push(
      `<div style="display:flex;flex-wrap:wrap;margin-bottom:2px;">${boxes}</div>`
    );
  }

  // Compteur de lignes complètes
  const fullRows = Math.floor(quantity / ROW_SIZE);
  const remainder = quantity % ROW_SIZE;
  const hint = fullRows > 0
    ? `<div style="font-size:10px;color:#888;margin-top:4px;font-family:monospace;">
        ${fullRows > 0 ? `${fullRows} × ${ROW_SIZE}${remainder > 0 ? ` + ${remainder}` : ""}` : ""}
       </div>`
    : "";

  return rows.join("") + hint;
}

/* ── Ligne produit dans le tableau ── */
function buildItemRow(item: SlipItem, index: number): string {
  const isEven = index % 2 === 0;
  const bg = isEven ? "#ffffff" : "#fafafa";

  return `
  <tr style="background:${bg}; border-bottom:1px solid #e8e8e8; page-break-inside:avoid;">
    <!-- Colonne IMAGE -->
    <td style="padding:12px 8px; width:80px; text-align:center; vertical-align:middle; border-right:1px solid #e8e8e8;">
      <div style="
        width:70px; height:70px;
        background:#f0f0f0;
        border-radius:8px;
        border:1px solid #e0e0e0;
        display:flex; align-items:center; justify-content:center;
        margin:0 auto;
        overflow:hidden;
        font-size:9px; color:#999; text-align:center;
        line-height:1.3;
      ">
        <div>
          <div style="font-size:22px; margin-bottom:2px;">🖼️</div>
          <div style="font-size:9px; color:#bbb;">${e(item.ref)}</div>
        </div>
      </div>
    </td>

    <!-- Colonne INFOS -->
    <td style="padding:12px 10px; vertical-align:middle; border-right:1px solid #e8e8e8; min-width:140px;">
      <div style="font-weight:800; font-size:13px; color:#111; margin-bottom:3px; letter-spacing:-0.01em;">
        ${e(item.label)}
      </div>
      <div style="font-size:11px; font-weight:700; color:#1d1d1f; background:#f0f0f0; display:inline-block; padding:1px 7px; border-radius:4px; margin-bottom:4px;">
        <span style="margin-right:3px;">📐</span>${e(item.ref)}
      </div>
    </td>

    <!-- Colonne POINTAGE -->
    <td style="padding:10px 12px; vertical-align:middle; border-right:1px solid #e8e8e8;">
      <div style="font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#888; margin-bottom:6px;">
        Pointer chaque unité
      </div>
      ${buildCheckboxGrid(item.quantity)}
    </td>

    <!-- Colonne QUANTITÉ -->
    <td style="padding:12px 10px; width:70px; text-align:center; vertical-align:middle;">
      <div style="
        font-size:36px;
        font-weight:900;
        color:#000;
        line-height:1;
        letter-spacing:-0.04em;
      ">${item.quantity}</div>
      <div style="font-size:9px; color:#999; margin-top:2px; text-transform:uppercase; letter-spacing:0.06em;">unités</div>
    </td>
  </tr>`;
}

/* ── Bandeau de secteur ── */
function buildSectorBanner(sector: Sector): string {
  const icon = SECTOR_ICONS[sector.name] ?? "📋";
  const totalSector = sector.items.reduce((s, i) => s + i.quantity, 0);

  const rows = sector.items.map((item, idx) => buildItemRow(item, idx)).join("");

  return `
  <!-- SECTEUR : ${e(sector.name)} -->
  <tr>
    <td style="padding:0;">
      <!-- Bandeau secteur -->
      <div style="
        background:#e8e8ed;
        padding:10px 16px;
        display:flex; align-items:center; justify-content:space-between;
        border-top:2px solid #c7c7cc;
        border-bottom:1px solid #d0d0d5;
      ">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:18px;">${icon}</span>
          <span style="font-weight:800; font-size:14px; color:#1d1d1f; text-transform:uppercase; letter-spacing:0.05em;">
            ${e(sector.name)}
          </span>
        </div>
        <div style="font-size:12px; font-weight:700; color:#3a3a3c; background:#fff; padding:3px 10px; border-radius:20px; border:1px solid #c7c7cc;">
          ${totalSector} pièce${totalSector > 1 ? "s" : ""}
        </div>
      </div>

      <!-- Tableau produits du secteur -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
        <!-- En-tête colonnes -->
        <thead>
          <tr style="background:#f7f7f8; border-bottom:2px solid #e0e0e5;">
            <th style="padding:8px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#888; text-align:center; width:80px; border-right:1px solid #e8e8e8;">Image</th>
            <th style="padding:8px 10px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#888; text-align:left; border-right:1px solid #e8e8e8;">Référence / Désignation</th>
            <th style="padding:8px 12px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#888; text-align:left; border-right:1px solid #e8e8e8;">Pointage</th>
            <th style="padding:8px 10px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#888; text-align:center; width:70px;">Qté</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </td>
  </tr>`;
}

/* ── Fonction principale ── */
export function buildPackingSlipHtml(
  company: string,
  name: string,
  email: string,
  phone: string,
  pickupDate: string,
  message: string,
  items: SlipItem[],
  totalItems: number,
  ref: string,
  date: Date,
): string {
  /* — Grouper les items par secteur — */
  const sectorMap = new Map<string, SlipItem[]>();
  for (const item of items) {
    const sector = getSector(item.ref);
    if (!sectorMap.has(sector)) sectorMap.set(sector, []);
    sectorMap.get(sector)!.push(item);
  }

  const sectors: Sector[] = Array.from(sectorMap.entries()).map(([name, items]) => ({
    name,
    icon: SECTOR_ICONS[name] ?? "📋",
    items,
  }));

  const dateStr = date.toLocaleDateString("fr-FR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const sectorRows = sectors.map(buildSectorBanner).join("");

  const pickupRow = pickupDate
    ? `<tr>
        <td style="padding:6px 0; font-size:12px; color:#555;">📅 <strong>Retrait souhaité :</strong></td>
        <td style="padding:6px 0; font-size:12px; font-weight:700; color:#111; text-align:right;">${e(pickupDate)}</td>
      </tr>`
    : "";

  const messageRow = message
    ? `<tr>
        <td colspan="2" style="padding:10px 0 0; font-size:12px; color:#555;">
          <strong>💬 Note client :</strong><br>
          <span style="font-style:italic; color:#333;">${e(message)}</span>
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bon de Préparation — ${e(ref)}</title>
<style>
  @media print {
    body { background: white !important; margin: 0; }
    .no-print { display: none !important; }
    .page-wrapper { padding: 0 !important; background: white !important; }
    .main-card { box-shadow: none !important; border: 1px solid #ccc !important; border-radius: 0 !important; }
    tr { page-break-inside: avoid; }
  }
  @page { margin: 15mm; }
</style>
</head>
<body style="margin:0;padding:0;background:#f0f0f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<div class="page-wrapper" style="background:#f0f0f5;padding:32px 16px;">
<table class="main-card" width="100%" cellpadding="0" cellspacing="0" role="presentation"
  style="max-width:680px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);border-collapse:collapse;">

  <!-- ══════════════════════════════════════════════════ -->
  <!-- HEADER D'URGENCE                                   -->
  <!-- ══════════════════════════════════════════════════ -->
  <tr>
    <td style="background:#1d1d1f; padding:24px 28px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td>
            <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:#888; margin-bottom:6px;">
              BON DE PRÉPARATION · OLDA
            </div>
            <div style="font-size:30px; font-weight:900; color:#ffffff; letter-spacing:-0.04em; line-height:1; margin-bottom:4px;">
              ${e(ref)}
            </div>
            <div style="font-size:18px; font-weight:700; color:#d1d1d6; letter-spacing:-0.01em;">
              ${e(company)}${name !== company ? ` — ${e(name)}` : ""}
            </div>
          </td>
          <td style="text-align:right; vertical-align:top;">
            <div style="
              background:#fff;
              border-radius:12px;
              padding:12px 18px;
              display:inline-block;
              text-align:center;
            ">
              <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#888; margin-bottom:2px;">Total pièces</div>
              <div style="font-size:48px; font-weight:900; color:#000; line-height:1; letter-spacing:-0.05em;">${totalItems}</div>
              <div style="font-size:10px; color:#999; margin-top:2px; text-transform:uppercase; letter-spacing:0.06em;">unités</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- INFOS CLIENT -->
  <tr>
    <td style="background:#f7f7f8; padding:12px 28px; border-bottom:2px solid #e0e0e5;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="font-size:11px; color:#555;">
            <strong style="color:#1d1d1f;">📧</strong> ${e(email)}
            ${phone ? `&nbsp;&nbsp;<strong style="color:#1d1d1f;">📱</strong> ${e(phone)}` : ""}
          </td>
          <td style="text-align:right; font-size:11px; color:#888;">
            ${dateStr} · ${timeStr}
          </td>
        </tr>
        ${pickupRow}
        ${messageRow}
      </table>
    </td>
  </tr>

  <!-- ══════════════════════════════════════════════════ -->
  <!-- SECTEURS DE PRODUCTION                             -->
  <!-- ══════════════════════════════════════════════════ -->
  ${sectorRows}

  <!-- ══════════════════════════════════════════════════ -->
  <!-- RÉCAPITULATIF RAPIDE                               -->
  <!-- ══════════════════════════════════════════════════ -->
  <tr>
    <td style="padding:16px 28px; background:#fff; border-top:2px solid #e0e0e5;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          ${sectors.map((s) => `
          <td style="text-align:center; padding:8px 4px;">
            <div style="font-size:18px;">${SECTOR_ICONS[s.name] ?? "📋"}</div>
            <div style="font-size:11px; font-weight:700; color:#333; margin:2px 0;">${e(s.name)}</div>
            <div style="font-size:20px; font-weight:900; color:#000; letter-spacing:-0.03em;">${s.items.reduce((sum, i) => sum + i.quantity, 0)}</div>
          </td>`).join("")}
        </tr>
      </table>
    </td>
  </tr>

  <!-- ══════════════════════════════════════════════════ -->
  <!-- FOOTER DE CONTRÔLE                                 -->
  <!-- ══════════════════════════════════════════════════ -->
  <tr>
    <td style="background:#f7f7f8; padding:20px 28px; border-top:2px solid #e0e0e5;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <!-- Poids estimé -->
          <td style="width:50%; vertical-align:top; padding-right:12px;">
            <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#888; margin-bottom:8px;">Poids estimé du colis</div>
            <div style="
              border:1.5px solid #333;
              border-radius:6px;
              height:36px;
              display:flex; align-items:center;
              padding:0 10px;
              font-size:14px; color:#bbb;
              background:#fff;
            ">
              __________ kg
            </div>
          </td>

          <!-- Vérification finale -->
          <td style="width:50%; vertical-align:top; padding-left:12px;">
            <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#888; margin-bottom:8px;">Contrôle final</div>
            <div style="
              border:1.5px solid #333;
              border-radius:6px;
              padding:8px 10px;
              background:#fff;
              display:flex; align-items:center; gap:10px;
            ">
              <div style="
                width:20px; height:20px; flex-shrink:0;
                border:2px solid #333;
                border-radius:4px;
                background:#fff;
              "></div>
              <span style="font-size:11px; font-weight:700; color:#1d1d1f; line-height:1.3;">
                J'ai vérifié que le nombre de pièces correspond au total
                <strong style="color:#000;">(${totalItems} pièces)</strong>
              </span>
            </div>
          </td>
        </tr>

        <!-- Signature -->
        <tr>
          <td colspan="2" style="padding-top:16px;">
            <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#888; margin-bottom:8px;">Préparé par</div>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="width:48%; border-bottom:1.5px solid #333; padding-bottom:24px; font-size:10px; color:#aaa; text-align:center;">
                  NOM &amp; PRÉNOM
                </td>
                <td style="width:4%;"></td>
                <td style="width:48%; border-bottom:1.5px solid #333; padding-bottom:24px; font-size:10px; color:#aaa; text-align:center;">
                  SIGNATURE
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:6px;">
              <tr>
                <td style="width:48%; text-align:center; font-size:10px; color:#bbb; text-transform:uppercase; letter-spacing:0.06em;">Date ________</td>
                <td style="width:4%;"></td>
                <td style="width:48%; text-align:center; font-size:10px; color:#bbb; text-transform:uppercase; letter-spacing:0.06em;">Heure ________</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- PIED DE PAGE -->
  <tr>
    <td style="background:#1d1d1f; padding:10px 28px; text-align:center;">
      <span style="font-size:10px; color:#636366;">
        OLDA · Bon de préparation · ${e(ref)} · Généré le ${dateStr}
      </span>
    </td>
  </tr>

</table>
</div>

</body>
</html>`;
}

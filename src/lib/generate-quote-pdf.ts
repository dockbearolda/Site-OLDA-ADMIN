"use client";

import { jsPDF } from "jspdf";

import type { CartItem } from "./cart-context";

type FormData = {
  company?: string;
  name?: string;
  email?: string;
  phone?: string;
  pickupDate?: string;
};

type Totals = {
  totalB2B: number;
  totalRevente: number;
  margeNette: number;
};

function fmtEur(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export function generateQuotePDF(items: CartItem[], form?: FormData, totals?: Totals) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const hasPrices = items.some((i) => i.prixAchat != null && i.prixAchat > 0);
  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;

  // Colonnes dynamiques selon présence des prix
  const colRef = margin;
  const colLabel = margin + 26;
  const colQty = hasPrices ? margin + 100 : pageW - margin;
  const colPrixU = margin + 124;
  const colTotal = pageW - margin;

  let y = 0;

  // ── Header bar ──────────────────────────────────────────────
  doc.setFillColor(29, 29, 31);
  doc.rect(0, 0, pageW, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("OLDA", margin, 9.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 180, 185);
  doc.text("Portail B2B · Click & Collect", margin + 14, 9.5);

  // ── Title ───────────────────────────────────────────────────
  y = 30;
  doc.setTextColor(29, 29, 31);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Devis de commande", margin, y);

  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110, 110, 115);
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Établi le ${dateStr} · Retrait en boutique`, margin, y);

  // ── Divider ─────────────────────────────────────────────────
  y += 7;
  doc.setDrawColor(220, 220, 222);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);

  // ── Client block ────────────────────────────────────────────
  if (form && (form.company || form.name || form.email)) {
    y += 10;
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(110, 110, 115);
    doc.text("DESTINATAIRE", margin, y);

    y += 5;
    if (form.company) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(29, 29, 31);
      doc.text(form.company, margin, y);
      y += 6;
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 55);
    if (form.name) { doc.text(form.name, margin, y); y += 5; }
    if (form.email) { doc.text(form.email, margin, y); y += 5; }
    if (form.phone) { doc.text(form.phone, margin, y); y += 5; }
    if (form.pickupDate) {
      y += 1;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 113, 227);
      doc.text(`Retrait souhaité : ${form.pickupDate}`, margin, y);
      y += 5;
    }

    y += 4;
    doc.setDrawColor(220, 220, 222);
    doc.line(margin, y, pageW - margin, y);
  }

  // ── Table header ────────────────────────────────────────────
  y += 8;
  doc.setFillColor(245, 245, 247);
  doc.rect(margin, y - 5, contentW, 9, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(110, 110, 115);
  doc.text("RÉF.", colRef, y);
  doc.text("DÉSIGNATION", colLabel, y);
  doc.text("QTÉ", colQty, y, { align: "right" });
  if (hasPrices) {
    doc.text("P.U. B2B", colPrixU, y, { align: "right" });
    doc.text("SOUS-TOTAL", colTotal, y, { align: "right" });
  }

  y += 5;
  doc.setDrawColor(220, 220, 222);
  doc.line(margin, y - 1, pageW - margin, y - 1);

  // ── Table rows ──────────────────────────────────────────────
  let totalQty = 0;
  let totalAchat = 0;
  let totalRevente = 0;

  items.forEach((item, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(250, 250, 252);
      doc.rect(margin, y - 1, contentW, 9, "F");
    }

    y += 6;

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110, 110, 115);
    doc.text(item.ref, colRef, y);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(29, 29, 31);
    const maxLabelW = (hasPrices ? colQty - colLabel - 6 : colQty - colLabel - 12);
    const label = doc.splitTextToSize(item.label, maxLabelW)[0] as string;
    doc.text(label, colLabel, y);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(29, 29, 31);
    doc.text(String(item.quantity), colQty, y, { align: "right" });

    if (hasPrices && item.prixAchat != null) {
      const sousTotal = item.prixAchat * item.quantity;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(110, 110, 115);
      doc.text(fmtEur(item.prixAchat), colPrixU, y, { align: "right" });
      doc.setFont("helvetica", "bold");
      doc.setTextColor(29, 29, 31);
      doc.text(fmtEur(sousTotal), colTotal, y, { align: "right" });
      totalAchat += sousTotal;
    }

    if (item.prixRevente != null) {
      totalRevente += item.prixRevente * item.quantity;
    }

    totalQty += item.quantity;
    y += 3;
  });

  // ── Total bar ───────────────────────────────────────────────
  y += 5;
  doc.setDrawColor(220, 220, 222);
  doc.line(margin, y, pageW - margin, y);
  y += 2;

  if (hasPrices) {
    // Ligne total investissement
    doc.setFillColor(245, 245, 247);
    doc.rect(margin, y, contentW, 10, "F");
    y += 7;
    doc.setTextColor(110, 110, 115);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL ARTICLES", colLabel, y);
    doc.text(String(totalQty), colQty, y, { align: "right" });
    doc.setTextColor(29, 29, 31);
    doc.text(fmtEur(totalAchat), colTotal, y, { align: "right" });
    y += 14;

    // ── Bloc rentabilité ────────────────────────────────────────
    if (totals && (totals.totalRevente > 0 || totals.margeNette !== 0)) {
      doc.setDrawColor(220, 220, 222);
      doc.line(margin, y - 2, pageW - margin, y - 2);

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(110, 110, 115);
      doc.text("ANALYSE DE RENTABILITÉ", margin, y + 3);

      y += 10;

      // Ligne investissement B2B
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(110, 110, 115);
      doc.text("Investissement B2B", margin, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(29, 29, 31);
      doc.text(fmtEur(totals.totalB2B), pageW - margin, y, { align: "right" });

      y += 7;
      // Ligne CA potentiel
      doc.setFont("helvetica", "normal");
      doc.setTextColor(110, 110, 115);
      doc.text("CA Potentiel (revente)", margin, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 113, 227);
      doc.text(fmtEur(totals.totalRevente), pageW - margin, y, { align: "right" });

      y += 5;
      doc.setDrawColor(220, 220, 222);
      doc.line(margin, y, pageW - margin, y);
      y += 4;

      // Bloc marge nette — fond vert
      const margeBoxH = 14;
      doc.setFillColor(6, 78, 59);
      doc.roundedRect(margin, y, contentW, margeBoxH, 3, 3, "F");

      y += margeBoxH / 2 + 1;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(110, 231, 183);
      doc.text("BÉNÉFICE NET PROJETÉ", margin + 6, y);

      const coeffMarge = totals.totalB2B > 0
        ? (totals.margeNette / totals.totalB2B).toFixed(2)
        : "0.00";
      const margeSign = totals.margeNette >= 0 ? "+" : "";
      doc.setFontSize(11);
      doc.setTextColor(110, 231, 183);
      doc.text(`${margeSign}${fmtEur(totals.margeNette)}  (coeff ${margeSign}${coeffMarge})`, pageW - margin - 4, y, { align: "right" });

      y += margeBoxH / 2 + 2;
    } else {
      // Simple total sans marge
      doc.setFillColor(29, 29, 31);
      doc.rect(margin, y, contentW, 10, "F");
      y += 7;
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL ARTICLES", colLabel, y);
      doc.text(String(totalQty), colQty, y, { align: "right" });
      y += 5;
    }
  } else {
    // Pas de prix — total articles seulement
    doc.setFillColor(29, 29, 31);
    doc.rect(margin, y, contentW, 10, "F");
    y += 7;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL ARTICLES", colLabel, y);
    doc.text(String(totalQty), colQty, y, { align: "right" });
    y += 10;
  }

  // ── Page footer ─────────────────────────────────────────────
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 185);
  doc.text("OLDA · Portail B2B Click & Collect", margin, 287);
  doc.text(dateStr, pageW - margin, 287, { align: "right" });

  return doc;
}

/**
 * Génère le PDF et retourne la data URI base64 pour pièce jointe email.
 * Utilisé côté client avant la soumission du formulaire.
 */
export function generateQuotePDFBase64(
  items: CartItem[],
  form?: FormData,
  totals?: Totals,
): string {
  const doc = generateQuotePDF(items, form, totals);
  return doc.output("datauristring");
}

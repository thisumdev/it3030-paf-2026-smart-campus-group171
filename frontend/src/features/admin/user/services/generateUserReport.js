/**
 * generateUserReport.js
 * Place at: src/features/admin/services/generateUserReport.js
 */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  primary: [15, 23, 42],
  muted: [100, 116, 139],
  border: [226, 232, 240],
  white: [255, 255, 255],
  purple: [126, 34, 206],
  purpleBg: [243, 232, 255],
  amber: [180, 83, 9],
  amberBg: [254, 243, 199],
  emerald: [4, 120, 87],
  emeraldBg: [209, 250, 229],
  red: [220, 38, 38],
  slate100: [241, 245, 249],
  slate50: [248, 250, 252],
};

const ROLE_META = {
  ADMIN: { text: C.purple, bg: C.purpleBg },
  TECHNICIAN: { text: C.amber, bg: C.amberBg },
  USER: { text: C.emerald, bg: C.emeraldBg },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const rgb = (arr) => ({ r: arr[0], g: arr[1], b: arr[2] });

const drawRoundedRect = (doc, x, y, w, h, r, fillColor) => {
  doc.setFillColor(...fillColor);
  doc.roundedRect(x, y, w, h, r, r, "F");
};

const setFont = (doc, size, style = "normal", color = C.primary) => {
  doc.setFontSize(size);
  doc.setFont("helvetica", style);
  doc.setTextColor(...color);
};

// ── Analytics donut-style bar chart ──────────────────────────────────────────
const drawAnalyticsSection = (doc, counts, total, startY) => {
  const margin = 20;
  const pageW = doc.internal.pageSize.getWidth();
  const cardW = (pageW - margin * 2 - 10) / 3;
  const cardH = 36;
  const roles = ["USER", "ADMIN", "TECHNICIAN"];
  const labels = {
    USER: "Regular Users",
    ADMIN: "Administrators",
    TECHNICIAN: "Technicians",
  };

  setFont(doc, 11, "bold");
  doc.text("Role Analytics", margin, startY);
  startY += 6;

  roles.forEach((role, i) => {
    const x = margin + i * (cardW + 5);
    const y = startY;
    const meta = ROLE_META[role];
    const count = counts[role] ?? 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;

    // Card background
    drawRoundedRect(doc, x, y, cardW, cardH, 3, meta.bg);

    // Role label
    setFont(doc, 7, "bold", meta.text);
    doc.text(role, x + 6, y + 9);

    // Count (large number)
    setFont(doc, 18, "bold", meta.text);
    doc.text(String(count), x + 6, y + 24);

    // Percentage pill (right side)
    setFont(doc, 7, "normal", meta.text);
    doc.text(`${pct}%`, x + cardW - 14, y + 24);

    // Progress bar track
    const barX = x + 6;
    const barY = y + cardH - 6;
    const barW = cardW - 12;
    doc.setFillColor(...C.white);
    doc.roundedRect(barX, barY, barW, 3, 1, 1, "F");

    // Progress bar fill
    doc.setFillColor(...meta.text);
    doc.roundedRect(barX, barY, barW * (pct / 100), 3, 1, 1, "F");
  });

  return startY + cardH + 10;
};

// ── Main export ───────────────────────────────────────────────────────────────
export const generateUserReport = (
  users,
  { roleFilter = "ALL", searchQuery = "" } = {},
) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const now = new Date();

  const counts = users.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    },
    { USER: 0, ADMIN: 0, TECHNICIAN: 0 },
  );

  // ── Header banner ──────────────────────────────────────────────────────────
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, pageW, 28, "F");

  setFont(doc, 16, "bold", C.white);
  doc.text("User Management Report", margin, 13);

  setFont(doc, 8, "normal", [148, 163, 184]);
  doc.text(
    `Generated on ${now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}  ·  ${now.toLocaleTimeString()}`,
    margin,
    20,
  );

  // Total pill (top-right)
  const pillW = 32;
  drawRoundedRect(doc, pageW - margin - pillW, 8, pillW, 12, 6, [30, 41, 59]);
  setFont(doc, 7, "bold", C.white);
  doc.text(`${users.length} Users`, pageW - margin - pillW / 2, 15.5, {
    align: "center",
  });

  // ── Active-filter notice ───────────────────────────────────────────────────
  let cursorY = 36;

  const activeFilters = [];
  if (roleFilter && roleFilter !== "ALL")
    activeFilters.push(`Role: ${roleFilter}`);
  if (searchQuery) activeFilters.push(`Search: "${searchQuery}"`);

  if (activeFilters.length > 0) {
    drawRoundedRect(doc, margin, cursorY, pageW - margin * 2, 9, 2, C.slate100);
    setFont(doc, 7.5, "normal", C.muted);
    doc.text(
      `Active filters — ${activeFilters.join("  ·  ")}`,
      margin + 3,
      cursorY + 6,
    );
    cursorY += 14;
  } else {
    cursorY += 4;
  }

  // ── Analytics cards ────────────────────────────────────────────────────────
  cursorY = drawAnalyticsSection(doc, counts, users.length, cursorY);

  // Divider
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, pageW - margin, cursorY);
  cursorY += 6;

  // ── Users table ────────────────────────────────────────────────────────────
  setFont(doc, 11, "bold");
  doc.text("User Directory", margin, cursorY);
  cursorY += 5;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [["#", "Full Name", "Email", "Role", "User ID"]],
    body: users.map((u, idx) => [
      idx + 1,
      u.fullName || "—",
      u.email || "—",
      u.role || "USER",
      `#${u.id}`,
    ]),

    // Head styling
    headStyles: {
      fillColor: C.primary,
      textColor: C.white,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 4,
    },

    // Body styling
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3.5,
      textColor: C.primary,
    },

    // Alternating rows
    alternateRowStyles: {
      fillColor: C.slate50,
    },

    // Column widths
    columnStyles: {
      0: { cellWidth: 10, halign: "center", textColor: C.muted },
      1: { cellWidth: 42, fontStyle: "bold" },
      2: { cellWidth: 60 },
      3: { cellWidth: 28, halign: "center" },
      4: { cellWidth: 22, halign: "center", textColor: C.muted, fontSize: 7 },
    },

    // Colour-code the Role cell
    didDrawCell(data) {
      if (data.section !== "body" || data.column.index !== 3) return;

      const role = data.cell.raw;
      const meta = ROLE_META[role] ?? ROLE_META.USER;
      const { x, y, width, height } = data.cell;
      const pad = 3;

      // Draw coloured pill over the cell
      drawRoundedRect(
        doc,
        x + pad,
        y + 2,
        width - pad * 2,
        height - 4,
        2,
        meta.bg,
      );
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...meta.text);
      doc.text(role, x + width / 2, y + height / 2 + 1, { align: "center" });
    },

    // Page footer on every page
    didDrawPage(data) {
      const pg = doc.getCurrentPageInfo().pageNumber;
      const total = doc.getNumberOfPages();
      setFont(doc, 7, "normal", C.muted);
      doc.text(
        `Page ${pg} of ${total}  ·  Confidential — Internal Use Only`,
        pageW / 2,
        pageH - 8,
        { align: "center" },
      );
      // Bottom border line
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.3);
      doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
    },
  });

  // ── Save ───────────────────────────────────────────────────────────────────
  const timestamp = now.toISOString().slice(0, 10);
  doc.save(`user-report-${timestamp}.pdf`);
};

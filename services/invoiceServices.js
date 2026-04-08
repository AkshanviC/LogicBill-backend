import puppeteer from "puppeteer";
import {
  Invoices,
  InvoiceHeaders,
  InvoiceRows,
} from "../associations/associations.js";
import Clients from "../models/clients.js";
import Drivers from "../models/drivers.js";
import Trailers from "../models/trailers.js";
import { Op } from "sequelize";
import path from "path";
import fs from "fs";

/**
 * Fetch all invoices with pagination
 * @param {Object} options - { page, limit }
 * @returns {Object} - { data, total, page, limit, totalPages }
 */
export const fetchAllInvoices = async ({
  page = 1,
  limit = 10,
  invoiceFilters = {},
}) => {
  const offset = (page - 1) * limit;
  const whereClause = {};

  // Apply filters if provided
  if (invoiceFilters.driverId) {
    whereClause.driverId = invoiceFilters.driverId;
  }
  if (invoiceFilters.trailerId) {
    whereClause.trailerId = invoiceFilters.trailerId;
  }
  if (invoiceFilters.clientId) {
    whereClause.clientId = invoiceFilters.clientId;
  }
  if (invoiceFilters.from) {
    whereClause.date = {
      ...whereClause.date,
      [Op.gte]: invoiceFilters.from,
    };
  }
  if (invoiceFilters.to) {
    whereClause.date = {
      ...whereClause.date,
      [Op.lte]: invoiceFilters.to,
    };
  }

  const { count, rows } = await Invoices.findAndCountAll({
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    where: whereClause,
    include: [
      {
        model: InvoiceRows,
        as: "Rows",
      },
      {
        model: Drivers,
        as: "driver",
      },
      {
        model: Trailers,
        as: "trailer",
      },
      {
        model: Clients,
        as: "client",
      },
    ],
  });

  return {
    data: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
};

/**
 * Fetch a single invoice by primary key
 * @param {number} id
 * @returns {Object|null}
 */
export const fetchInvoiceById = async (id) => {
  const invoice = await Invoices.findByPk(id, {
    include: [
      {
        model: InvoiceRows,
      },
      {
        model: InvoiceHeaders,
      },
    ],
  });
  return invoice;
};

/**
 * Create a new invoice record
 * @param {Object} data - Invoice fields
 * @returns {Object} - Created invoice
 */
export const createNewInvoice = async (data, transaction) => {
  const invoice = await Invoices.create(data, transaction);
  return invoice;
};

export const createNewInvoiceHeader = async (data, transaction) => {
  const invoice = await InvoiceHeaders.create(data, transaction);
  return invoice;
};

export const createNewInvoiceRows = async (data, transaction) => {
  const invoice = await InvoiceRows.bulkCreate(data, transaction);
  return invoice;
};

/**
 * Update an invoice by ID
 * Only updates fields that are explicitly provided (ignores undefined values)
 * @param {number} id
 * @param {Object} data - Partial invoice fields
 * @returns {Object|null} - Updated invoice or null if not found
 */
export const updateInvoiceById = async (id, data) => {
  const invoice = await Invoices.findByPk(id);

  if (!invoice) return null;

  // Strip out undefined fields so we only update what was provided
  const updatePayload = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  );

  await invoice.update(updatePayload);
  return invoice;
};

/**
 * Delete an invoice by ID
 * @param {number} id
 * @returns {boolean} - true if deleted, false if not found
 */
export const deleteInvoiceById = async (id) => {
  const invoice = await Invoices.findByPk(id);

  if (!invoice) return false;

  await invoice.destroy();
  return true;
};

/**
 * invoiceGenerator.js
 * Generates invoice PDFs (single or bulk) from Sequelize model data.
 * Uses Puppeteer to render HTML → PDF, preserving your exact invoice styles.
 * Usage:
 *   const { generateInvoicePDF, generateBulkInvoicePDFs } = require('./invoiceGenerator');
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a number as Indian currency string: 1234567 → "12,34,567" */
function formatIndianCurrency(num) {
  if (!num && num !== 0) return "";
  const n = Number(num);
  if (isNaN(n)) return String(num);
  return n.toLocaleString("en-IN");
}

/** Format a Date / ISO string → "DD/MM/YYYY" */
function formatDate(d) {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt)) return String(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Returns true when a value should be treated as "present" */
function hasValue(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === "string" && v.trim() === "") return false;
  if (typeof v === "number" && v === 0) return false;
  return true;
}

/** Wrap a value in a table row only if it exists */
function metaRow(label, value) {
  if (!hasValue(value)) return "";
  return `<tr><td>${label}</td><td>${value}</td></tr>`;
}

// ---------------------------------------------------------------------------
// Number-to-words (Indian system, up to crores)
// ---------------------------------------------------------------------------
const ones = [
  "",
  "ONE",
  "TWO",
  "THREE",
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "EIGHT",
  "NINE",
  "TEN",
  "ELEVEN",
  "TWELVE",
  "THIRTEEN",
  "FOURTEEN",
  "FIFTEEN",
  "SIXTEEN",
  "SEVENTEEN",
  "EIGHTEEN",
  "NINETEEN",
];
const tens = [
  "",
  "",
  "TWENTY",
  "THIRTY",
  "FORTY",
  "FIFTY",
  "SIXTY",
  "SEVENTY",
  "EIGHTY",
  "NINETY",
];

function numToWordsLessThan1000(n) {
  if (n === 0) return "";
  if (n < 20) return ones[n];
  if (n < 100)
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  return (
    ones[Math.floor(n / 100)] +
    " HUNDRED" +
    (n % 100 ? " " + numToWordsLessThan1000(n % 100) : "")
  );
}

function numberToWords(n) {
  if (!n || n === 0) return "ZERO";
  const num = Math.round(Number(n));
  if (isNaN(num)) return "";
  let result = "";
  if (num >= 10000000)
    result += numToWordsLessThan1000(Math.floor(num / 10000000)) + " CRORE ";
  if (num % 10000000 >= 100000)
    result +=
      numToWordsLessThan1000(Math.floor((num % 10000000) / 100000)) + " LAKH ";
  if (num % 100000 >= 1000)
    result +=
      numToWordsLessThan1000(Math.floor((num % 100000) / 1000)) + " THOUSAND ";
  if (num % 1000 >= 100)
    result +=
      numToWordsLessThan1000(Math.floor((num % 1000) / 100)) + " HUNDRED ";
  if (num % 100) result += numToWordsLessThan1000(num % 100);
  return result.trim() + " ONLY";
}

// ---------------------------------------------------------------------------
// HTML builder
// ---------------------------------------------------------------------------

/**
 * Builds a single invoice HTML string from invoice + rows data.
 *
 * @param {object} invoice   - Row from the `invoices` table (plain object / Sequelize instance)
 * @param {object[]} rows    - Rows from `invoicerows` for this invoice
 * @param {object} [meta]    - Optional enriched data: { firmName, firmAddress, firmEmail,
 *                             firmGst, firmPhone1, firmPhone2, clientName, clientAddress,
 *                             clientGst, isBillOfSupply }
 */
function buildInvoiceHtml(invoice, rows, meta = {}) {
  // ── Firm (carrier) block ─────────────────────────────────────────────────
  const firmName = meta.firmName || "SHREEJI CARRIERS";
  const firmSub = meta.firmSub || "FLEET OWNERS &amp; CONTAINER MOVERS";
  const firmAddr =
    meta.firmAddress ||
    "No.12/18, Thiruvalluvar Street, IInd Floor, Balakrishna Nagar,<br>Thiruvottiyur, Chennai - 600 019.";
  const firmEmail = meta.firmEmail || "shreejicarriers@gmail.com";
  const firmGst = "33AACPJ1154C2ZH";
  const firmPhone1 = "8939724222";
  const firmPhone2 = "9841819012";

  // ── Client block ─────────────────────────────────────────────────────────
  const clientName = meta.clientName || "";
  const clientAddr = meta.clientAddress || "";
  const clientGst = meta.clientGst || "";
  const isBillOfSupply = meta.isBillOfSupply || false;

  // ── Invoice meta rows (right side) ───────────────────────────────────────
  const metaRows = [
    metaRow("SAC", invoice.sac),
    metaRow("Date:", formatDate(invoice.date)),
    metaRow("Bill No:", invoice.billNo),
    metaRow("P.O No:", invoice.pono),
    metaRow("Vendor Code:", invoice.vendorCode),
    metaRow("PAN:", invoice.pan),
    metaRow("GST No:", invoice.gstno),
  ]
    .filter(Boolean)
    .join("\n");

  // ── Determine which optional columns exist across ALL rows ───────────────
  const showWeight = rows.some((r) => hasValue(r.weight));
  const showTrailers = rows.some((r) => hasValue(r.trailers));
  const showRate = rows.some((r) => hasValue(r.rate));

  // ── Table header ─────────────────────────────────────────────────────────
  let thead = `<tr>
    <th>S.No</th>
    <th>Particulars</th>`;
  if (showWeight) thead += `<th>Weight</th>`;
  if (showTrailers) thead += `<th>No. of Trailers</th>`;
  if (showRate) thead += `<th>Rate (Rs.)</th>`;
  thead += `<th>Amount (Rs.)</th></tr>`;

  // ── Table body ────────────────────────────────────────────────────────────
  let grandTotal = 0;
  let tbodyRows = "";
  let sno = 1;

  rows.forEach((row) => {
    // Build particulars inner HTML
    let particulars = "Being the Transportation Charges";

    if (hasValue(row.fromAddress) || hasValue(row.toAddress)) {
      particulars += "<br>";
      if (hasValue(row.fromAddress))
        particulars += `<strong>FROM:</strong> ${row.fromAddress}`;
      if (hasValue(row.fromAddress) && hasValue(row.toAddress))
        particulars += "&nbsp;&nbsp;";
      if (hasValue(row.toAddress))
        particulars += `<strong>TO:</strong> ${row.toAddress}`;
    }
    if (hasValue(row.trailerNo))
      particulars += `<br>Trailer No: ${row.trailerNo}`;
    if (hasValue(row.lrNo)) particulars += `<br>LR.NO: ${row.lrNo}`;
    if (hasValue(row.invoiceNo)) particulars += `<br>INV.NO: ${row.invoiceNo}`;
    if (hasValue(row.docNo)) particulars += `<br>DOC NO: ${row.docNo}`;
    if (hasValue(row.shipmentNo))
      particulars += `<br>Shipment No: ${row.shipmentNo}`;
    if (hasValue(row.others)) particulars += `<br>${row.others}`;

    const rowAmount = Number(row.amount) || 0;
    grandTotal += rowAmount;

    const colspan =
      1 + (showWeight ? 1 : 0) + (showTrailers ? 1 : 0) + (showRate ? 1 : 0);

    tbodyRows += `<tr>
      <td class="center">${sno++}</td>
      <td>${particulars}</td>
      ${showWeight ? `<td class="center">${hasValue(row.weight) ? row.weight : ""}</td>` : ""}
      ${showTrailers ? `<td class="center">${hasValue(row.trailers) ? row.trailers + " LOADS" : ""}</td>` : ""}
      ${showRate ? `<td class="num">${hasValue(row.rate) ? formatIndianCurrency(row.rate) : "LUMPSUM"}</td>` : ""}
      <td class="num">${formatIndianCurrency(rowAmount)}</td>
    </tr>`;

    // Add-on rows: prorate, loading charge
    if (hasValue(row.prorate)) {
      grandTotal += Number(row.prorate);
      tbodyRows += `<tr>
        <td></td>
        <td>ADD: PRORATE</td>
        ${showWeight ? `<td class="center">2</td>` : ""}
        ${showTrailers ? `<td></td>` : ""}
        ${showRate ? `<td></td>` : ""}
        <td class="num">${formatIndianCurrency(row.prorate)}</td>
      </tr>`;
    }

    if (hasValue(row.loadingCharge)) {
      grandTotal += Number(row.loadingCharge);
      tbodyRows += `<tr>
        <td></td>
        <td>ADD: LOADING CHARGE</td>
        ${showWeight ? `<td></td>` : ""}
        ${showTrailers ? `<td></td>` : ""}
        ${showRate ? `<td></td>` : ""}
        <td class="num">${formatIndianCurrency(row.loadingCharge)}</td>
      </tr>`;
    }

    // GST rows (per-row; e.g. VMI pattern)
    const cgst = Number(row.cgst) || 0;
    const sgst = Number(row.sgst) || 0;
    if (cgst || sgst) {
      const taxTotal = cgst + sgst;
      grandTotal += taxTotal;

      if (cgst) {
        const cgstPct =
          rowAmount > 0 ? Math.round((cgst / rowAmount) * 100) : 9;
        tbodyRows += `<tr>
          <td></td>
          <td>OUTPUT CGST ${cgstPct}% — Rs. ${formatIndianCurrency(cgst)}</td>
          ${showWeight ? `<td></td>` : ""}
          ${showTrailers ? `<td></td>` : ""}
          ${showRate ? `<td></td>` : ""}
          <td class="num">${formatIndianCurrency(taxTotal)}</td>
        </tr>`;
      }
      if (sgst) {
        const sgstPct =
          rowAmount > 0 ? Math.round((sgst / rowAmount) * 100) : 9;
        tbodyRows += `<tr>
          <td></td>
          <td>OUTPUT SGST ${sgstPct}% — Rs. ${formatIndianCurrency(sgst)}</td>
          ${showWeight ? `<td></td>` : ""}
          ${showTrailers ? `<td></td>` : ""}
          ${showRate ? `<td></td>` : ""}
          <td></td>
        </tr>`;
      }
    }
  });

  // ── Totals row ────────────────────────────────────────────────────────────
  const totalCols =
    1 + (showWeight ? 1 : 0) + (showTrailers ? 1 : 0) + (showRate ? 1 : 0); // excludes S.No & Amount
  tbodyRows += `<tr class="total-row">
    <td colspan="${totalCols + 1}">Total: RUPEES ${numberToWords(grandTotal)}</td>
    <td class="num">${formatIndianCurrency(grandTotal)}</td>
  </tr>`;

  // ── RCM banner (only for non-bill-of-supply) ──────────────────────────────
  const rcmBanner = isBillOfSupply
    ? ""
    : `<div class="rcm">"GST is Payable under Reverse Charge Mechanism"</div>`;

  // ── Assemble full HTML ────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Invoice ${invoice.billNo || ""}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, sans-serif; font-size: 12px; color: #222; background: #fff; padding: 20px; }
.invoice { max-width: 860px; margin: auto; border: 1px solid #999; padding: 0; }
.header { padding: 12px 16px; border-bottom: 1px solid #ccc; display: flex; justify-content: space-between; align-items: flex-start; }
.company-name { font-size: 20px; font-weight: bold; letter-spacing: 1px; }
.company-sub { font-size: 11px; color: #444; margin-top: 2px; }
.gst-top { font-size: 11px; color: #555; text-align: right; }
.invoice-meta { display: flex; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid #ccc; }
.to-block { flex: 1; }
.to-block .label { font-weight: bold; font-size: 11px; margin-bottom: 4px; }
.to-block .party { font-weight: bold; font-size: 12px; }
.to-block .sub { font-size: 11px; color: #444; }
.ref-block { text-align: right; min-width: 200px; }
.ref-block table { margin-left: auto; border-collapse: collapse; }
.ref-block td { padding: 2px 6px; font-size: 11px; }
.ref-block td:first-child { color: #555; }
.ref-block td:last-child { font-weight: bold; }
.rcm { padding: 6px 16px; font-size: 11px; font-style: italic; color: #555; border-bottom: 1px solid #ccc; }
.items-table { width: 100%; border-collapse: collapse; }
.items-table th, .items-table td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
.items-table th { background: #f0f0f0; font-weight: bold; font-size: 11px; text-align: center; }
.items-table td.num { text-align: right; }
.items-table td.center { text-align: center; }
.total-row td { font-weight: bold; background: #f9f9f9; }
.signature { display: flex; justify-content: flex-end; padding: 20px 16px 10px; font-size: 11px; text-align: center; }
</style>
</head>
<body>
<div class="invoice">

  <!-- HEADER -->
  <div class="header">
    <div>
      <div class="company-name">${firmName}</div>
      <div class="company-sub">${firmSub}</div>
      <div class="company-sub">${firmAddr}</div>
      ${firmEmail ? `<div class="company-sub">Email: ${firmEmail}</div>` : ""}
    </div>
    <div class="gst-top">
      ${firmGst ? `GST NO. ${firmGst}<br>` : ""}
      ${firmPhone1 ? `Cell: ${firmPhone1}<br>` : ""}
      ${firmPhone2 ? `Cell: ${firmPhone2}` : ""}
    </div>
  </div>

  <!-- TO + REF BLOCK -->
  <div class="invoice-meta">
    <div class="to-block">
      ${isBillOfSupply ? "" : '<div class="label">To:</div>'}
      ${clientName ? `<div class="party">${clientName}</div>` : ""}
      ${clientAddr ? `<div class="sub">${clientAddr}</div>` : ""}
      ${clientGst ? `<div class="sub">GST: ${clientGst}</div>` : ""}
      ${isBillOfSupply ? '<div class="sub" style="margin-top:6px;font-style:italic;font-weight:bold">BILL OF SUPPLY</div>' : ""}
    </div>
    <div class="ref-block">
      <table>${metaRows}</table>
    </div>
  </div>

  ${rcmBanner}

  <!-- ITEMS TABLE -->
  <table class="items-table">
    <thead>${thead}</thead>
    <tbody>${tbodyRows}</tbody>
  </table>

  <!-- SIGNATURE -->
  <div class="signature">
    <div>For ${firmName}<br><br><br>Authorized Signatory</div>
  </div>

</div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// PDF generation
// ---------------------------------------------------------------------------

/**
 * Generates a single invoice PDF and saves it to `outputPath`.
 *
 * @param {object}   invoice    - invoices model data (plain object)
 * @param {object[]} rows       - invoicerows model data array
 * @param {string}   outputPath - Where to write the PDF file
 * @param {object}   [meta]     - Optional enrichment (see buildInvoiceHtml)
 * @returns {Promise<string>}   - Resolves with outputPath on success
 */
export async function generateInvoicePDF(id, outputPath, meta = {}) {
  const invoiceData = await Invoices.findByPk(id, {
    include: [
      { model: InvoiceRows, as: "Rows" },
      { model: Clients, as: "client" },
      { model: Drivers, as: "driver" },
      { model: Trailers, as: "trailer" },
    ],
  });

  const html = buildInvoiceHtml(
    invoiceData?.toJSON(),
    invoiceData?.toJSON()?.Rows,
    meta,
  );

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  console.log("Launched headless browser for PDF generation");
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });
    console.log("PDF generated and saved to:", outputPath);
    return outputPath;
  } finally {
    await browser.close();
  }
}

/**
 * Generates multiple invoice PDFs in parallel (or serial for large batches).
 *
 * @param {Array<{ invoice, rows, outputPath, meta? }>} items
 * @param {object} [options]
 * @param {number} [options.concurrency=5]  - Max parallel Puppeteer pages
 * @returns {Promise<string[]>}             - Array of output paths
 */
export async function generateBulkInvoicePDFs(items, { concurrency = 5 } = {}) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results = [];

  try {
    // Process in chunks to limit memory usage
    for (let i = 0; i < items.length; i += concurrency) {
      const chunk = items.slice(i, i + concurrency);

      const chunkResults = await Promise.all(
        chunk.map(async ({ invoice, rows, outputPath, meta = {} }) => {
          const html = buildInvoiceHtml(invoice, rows, meta);
          const page = await browser.newPage();
          try {
            await page.setContent(html, { waitUntil: "networkidle0" });
            await page.pdf({
              path: outputPath,
              format: "A4",
              printBackground: true,
              margin: {
                top: "10mm",
                bottom: "10mm",
                left: "10mm",
                right: "10mm",
              },
            });
            return outputPath;
          } finally {
            await page.close();
          }
        }),
      );

      results.push(...chunkResults);
    }
  } finally {
    await browser.close();
  }

  return results;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

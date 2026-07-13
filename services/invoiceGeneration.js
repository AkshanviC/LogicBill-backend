import InvoiceRows from "../models/invoiceRows.js";
import Invoices from "../models/invoices.js";
import Clients from "../models/clients.js";
import Drivers from "../models/drivers.js";
import Trailers from "../models/trailers.js";
import puppeteer from "puppeteer";
import Address from "../models/address.js";
import Bills from "../models/bills.js";
// ---------------------------------------------------------------------------
// Helper utilities  (keep your existing hasValue / metaRow / formatDate /
// formatIndianCurrency / numberToWords unchanged above this file)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// buildInvoiceHtml  — UNCHANGED (used for single invoice & detail pages)
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

function hasValue(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === "string" && v.trim() === "") return false;
  if (typeof v === "number" && v === 0) return false;
  return true;
}

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

function buildInvoiceHtml(invoice, rows, meta = {}) {
  // console.log(
  //   "buildInvoiceHtml called with invoice:",
  //   invoice,
  //   "rows:",
  //   rows,
  //   "meta:",
  //   meta,
  // );
  const firmName = meta.firmName || "SHREEJI CARRIERS";
  const isBillOfSupply = meta.isBillOfSupply || false;

  const clientName = invoice.client.displayName || "";
  const clientAddr = invoice.client.address || "";
  const clientGst = invoice.client.gstNo || "";
  console.log(invoice, invoice.bills);
  const metaRows = [
    metaRow("SAC", invoice.sac),
    metaRow("Date:", formatDate(invoice.date)),
    metaRow("Bill No:", invoice.bills?.id || invoice.billNo),
    metaRow("P.O No:", invoice.pono),
    metaRow("Vendor Code:", invoice.vendorCode),
    metaRow("PAN:", invoice.pan),
    metaRow("GST No:", invoice.gstno),
  ]
    .filter(Boolean)
    .join("\n");

  const showWeight = rows.some((r) => hasValue(r.weight));
  const showTrailers = rows.some((r) => hasValue(r.trailers));
  const showRate = rows.some((r) => hasValue(r.rate));

  let thead = `<tr><th>S.No</th><th>Particulars</th>`;
  if (showWeight) thead += `<th>Weight</th>`;
  if (showTrailers) thead += `<th>No. of Trailers</th>`;
  if (showRate) thead += `<th>Rate (Rs.)</th>`;
  thead += `<th>Amount (Rs.)</th></tr>`;

  let grandTotal = 0;
  let tbodyRows = "";
  let sno = 1;

  rows.forEach((row) => {
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

    tbodyRows += `<tr>
      <td class="center">${sno++}</td>
      <td>${particulars}</td>
      ${showWeight ? `<td class="center">${hasValue(row.weight) ? row.weight : ""}</td>` : ""}
      ${showTrailers ? `<td class="center">${hasValue(row.trailers) ? row.trailers + " LOADS" : ""}</td>` : ""}
      ${showRate ? `<td class="num">${hasValue(row.rate) ? formatIndianCurrency(row.rate) : "LUMPSUM"}</td>` : ""}
      <td class="num">${formatIndianCurrency(rowAmount)}</td>
    </tr>`;

    if (hasValue(row.prorate)) {
      grandTotal += Number(row.prorate);
      tbodyRows += `<tr>
        <td></td><td>ADD: PRORATE</td>
        ${showWeight ? `<td class="center">2</td>` : ""}
        ${showTrailers ? `<td></td>` : ""}${showRate ? `<td></td>` : ""}
        <td class="num">${formatIndianCurrency(row.prorate)}</td>
      </tr>`;
    }
    if (hasValue(row.loadingCharge)) {
      grandTotal += Number(row.loadingCharge);
      tbodyRows += `<tr>
        <td></td><td>ADD: LOADING CHARGE</td>
        ${showWeight ? `<td></td>` : ""}${showTrailers ? `<td></td>` : ""}${showRate ? `<td></td>` : ""}
        <td class="num">${formatIndianCurrency(row.loadingCharge)}</td>
      </tr>`;
    }

    const cgst = Number(row.cgst) || 0;
    const sgst = Number(row.sgst) || 0;
    if (cgst || sgst) {
      const taxTotal = cgst + sgst;
      grandTotal += taxTotal;
      if (cgst) {
        const cgstPct =
          rowAmount > 0 ? Math.round((cgst / rowAmount) * 100) : 9;
        tbodyRows += `<tr>
          <td></td><td>OUTPUT CGST ${cgstPct}% — Rs. ${formatIndianCurrency(cgst)}</td>
          ${showWeight ? `<td></td>` : ""}${showTrailers ? `<td></td>` : ""}${showRate ? `<td></td>` : ""}
          <td class="num">${formatIndianCurrency(taxTotal)}</td>
        </tr>`;
      }
      if (sgst) {
        const sgstPct =
          rowAmount > 0 ? Math.round((sgst / rowAmount) * 100) : 9;
        tbodyRows += `<tr>
          <td></td><td>OUTPUT SGST ${sgstPct}% — Rs. ${formatIndianCurrency(sgst)}</td>
          ${showWeight ? `<td></td>` : ""}${showTrailers ? `<td></td>` : ""}${showRate ? `<td></td>` : ""}
          <td></td>
        </tr>`;
      }
    }
  });

  const totalCols =
    1 + (showWeight ? 1 : 0) + (showTrailers ? 1 : 0) + (showRate ? 1 : 0);
  tbodyRows += `<tr class="total-row">
    <td colspan="${totalCols + 1}">Total: RUPEES ${numberToWords(grandTotal)}</td>
    <td class="num">${formatIndianCurrency(grandTotal)}</td>
  </tr>`;

  const rcmBanner = isBillOfSupply
    ? ""
    : `<div class="rcm">"GST is Payable under Reverse Charge Mechanism"</div>`;

  return `
  <div class="invoice">
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
    <table class="items-table">
      <thead>${thead}</thead>
      <tbody>${tbodyRows}</tbody>
    </table>
    <div class="signature">
      <div>For ${firmName}<br><br><br>Authorized Signatory</div>
    </div>
  </div>`;
}

function metaRow(label, value) {
  if (!hasValue(value)) return "";
  return `<tr><td>${label}</td><td>${value}</td></tr>`;
}
// ---------------------------------------------------------------------------
// buildConsolidatedInvoiceHtml — NEW  (Page 1 of bulk PDF)
//
// Corrections applied:
//   1. Single row only. From/To = shared address across all consolidated invoices.
//   2. "No. of Trailers" column = number of invoices being consolidated.
//   3. LR No / Doc No are NOT shown (they live in the summary sheet only).
//   4. Amount = No. of Trailers × Rate.
// ---------------------------------------------------------------------------
function buildConsolidatedInvoiceHtml(invoiceList, meta = {}) {
  // console.log(
  //   "buildConsolidatedInvoiceHtml called with invoiceList:",
  //   invoiceList,
  // );
  const firmName = meta.firmName || "SHREEJI CARRIERS";
  const isBillOfSupply = meta.isBillOfSupply || false;

  const firstInvoice = invoiceList[0];
  const clientName = firstInvoice.client.displayName || "";
  const clientAddr = firstInvoice.client.address || "";
  const clientGst = firstInvoice.client.gstNo || "";

  const metaRows = [
    metaRow("SAC", firstInvoice.sac),
    metaRow("Date:", formatDate(meta.consolidatedDate || firstInvoice.date)),
    metaRow("Bill No:", meta.consolidatedBillNo || firstInvoice.billNo),
    metaRow("P.O No:", firstInvoice.pono),
    metaRow("Vendor Code:", firstInvoice.vendorCode),
    metaRow("PAN:", firstInvoice.pan),
    metaRow("GST No:", firstInvoice.gstno),
  ]
    .filter(Boolean)
    .join("\n");

  // Shared from/to taken from first row of first invoice.
  // All invoices in a bulk call must share the same route.
  const firstRow = (firstInvoice.Rows || [])[0] || {};
  const fromAddr = firstInvoice?.address?.from || "";
  const toAddr = firstInvoice?.address?.to || "";
  const others = firstRow?.others || "-";
  // No. of Trailers = number of invoices being consolidated  (correction #2)
  const trailerCount = invoiceList.length;

  // Rate: use meta override if provided, otherwise first row's rate  (correction #4)
  const rate = Number(meta.consolidatedRate ?? firstRow.rate) || 0;
  const amount = trailerCount * rate;

  // Particulars — from/to only, no LR No / Doc No  (correction #3)
  let particulars = "Being the Transportation Charges";
  if (fromAddr || toAddr) {
    particulars += "<br>";
    if (fromAddr) particulars += `<strong>FROM:</strong> ${fromAddr}`;
    if (fromAddr && toAddr) particulars += "&nbsp;&nbsp;";
    if (toAddr) particulars += `<strong>TO:</strong> ${toAddr}`;
    if (others)
      particulars += `<br><span style="margin-top: 10px">${others}</span>`;
    particulars +=
      "<br>Details of all trips are provided in the summary sheet on the next page.";
  }

  const rcmBanner = isBillOfSupply
    ? ""
    : `<div class="rcm">"GST is Payable under Reverse Charge Mechanism"</div>`;

  return `
  <div class="invoice">
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
    <table class="items-table">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Particulars</th>
          <th>No. of Trailers</th>
          <th>Rate (Rs.)</th>
          <th>Amount (Rs.)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="center">1</td>
          <td>${particulars}</td>          
          <td class="center">${trailerCount}</td>

          <td class="num">${formatIndianCurrency(rate)}</td>
          <td class="num">${formatIndianCurrency(amount)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="4">Total: RUPEES ${numberToWords(amount)}</td>
          <td class="num">${formatIndianCurrency(amount)}</td>
        </tr>
      </tbody>
    </table>
    <div class="signature">
      <div>For ${firmName}<br><br><br>Authorized Signatory</div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------------------
// buildSummarySheetHtml — UPDATED  (Page 2 / last page of bulk PDF)
//
// Full detail table: one row per invoice with Trailer No, LR No, Doc No,
// individual amount. Grand total at the bottom.
// ---------------------------------------------------------------------------
function buildSummarySheetHtml(invoiceList, meta = {}) {
  const firmName = meta.firmName || "SHREEJI CARRIERS";
  let grandTotal = 0;
  const bills = invoiceList[0]?.bills?.id || "—";
  // console.log("buildSummarySheetHtml called with invoiceList:", invoiceList);
  const rows = invoiceList
    .map((invoice, idx) => {
      const invoiceAmount = (invoice.Rows || []).reduce((sum, r) => {
        let t = Number(r.amount) || 0;
        if (hasValue(r.prorate)) t += Number(r.prorate);
        if (hasValue(r.loadingCharge)) t += Number(r.loadingCharge);
        t += (Number(r.cgst) || 0) + (Number(r.sgst) || 0);
        return sum + t;
      }, 0);
      grandTotal += invoiceAmount;
      const firstRow = (invoice.Rows || [])[0] || {};
      const fromAddr = invoice?.address?.from || "—";
      const toAddr = invoice?.address?.to || "—";
      const trailerNos = invoice?.trailer?.regNo || "—";
      // const trailerNos =
      //   (invoice.Rows || [])
      //     .map((r) => r.trailerNo)
      //     .filter(Boolean)
      //     .join(", ") || "—";
      const lrNos =
        (invoice.Rows || [])
          .map((r) => r.lrNo)
          .filter(Boolean)
          .join(", ") || "—";
      const docNos =
        (invoice.Rows || [])
          .map((r) => r.docNo)
          .filter(Boolean)
          .join(", ") || "—";

      return `<tr>
      <td class="center">${idx + 1}</td>
      <td class="center">${trailerNos}</td>
      <td class="center">${lrNos}</td>
      <td class="center">${docNos}</td>
      <td class="center">${invoice.ewayBillNo || "—"}</td>
      <td class="center">${formatDate(invoice.date)}</td>
      <td>${fromAddr}</td>
      <td>${toAddr}</td>
      <td class="num">${formatIndianCurrency(invoiceAmount)}</td>
    </tr>`;
    })
    .join("\n");

  return `
  <div class="invoice summary-sheet">
    <div class="summary-header">
      <div class="company-name">${firmName}</div>
      <div class="summary-title">Consolidated Invoice Summary</div>
      <div class="summary-subtitle">${invoiceList.length} trip(s) &nbsp;|&nbsp; Generated: ${formatDate(new Date())} &nbsp;|&nbsp; bill No: ${bills}</div>
    </div>
    <table class="items-table summary-table">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Trailer No</th>
          <th>LR No</th>
          <th>Doc No</th>
          <th>E-Way Bill No</th>
          <th>Date</th> 
          <th>From</th>    
          <th>To</th>     
          <th>Amount (Rs.)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="total-row">
          <td colspan="8" style="text-align:right">
            Grand Total: RUPEES ${numberToWords(grandTotal)}
          </td>
          <td class="num">${formatIndianCurrency(grandTotal)}</td>
        </tr>
      </tbody>
    </table>
  </div>`;
}

// ---------------------------------------------------------------------------
// wrapInDocument — shared CSS + HTML shell
// ---------------------------------------------------------------------------
function wrapInDocument(bodyContent, title = "Invoice") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, sans-serif; font-size: 12px; color: #222; background: #fff; padding: 20px; margin-top: 150px; }
.invoice { max-width: 860px; margin: auto; border: 1px solid #999; padding: 0; }
.invoice + .invoice { page-break-before: always; }
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
.summary-sheet { border: 1px solid #999;  margin-top: 200px; }
.summary-header { padding: 16px; border-bottom: 1px solid #ccc; text-align: center; }
.company-name { font-size: 18px; font-weight: bold; letter-spacing: 1px; }
.summary-title { font-size: 14px; font-weight: bold; margin-top: 6px; }
.summary-subtitle { font-size: 11px; color: #555; margin-top: 4px; }
.summary-table th { white-space: nowrap; }
</style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// generateInvoicePDF — UPDATED
//
// Single invoice  → 1 page, unchanged behaviour.
//
// Bulk invoices   → exactly 2 pages:
//   Page 1 : Consolidated invoice (1 row, No. of Trailers, no LR/Doc No,
//            amount = trailers × rate)
//   Page 2 : Summary sheet (full detail: Trailer No, LR No, Doc No per row)
//
// @param {number|number[]} idOrIds
// @param {string}  [outputPath]          omit → returns Buffer
// @param {object}  [meta]
//   meta.consolidatedBillNo              override bill number on page 1
//   meta.consolidatedDate                override date on page 1
//   meta.consolidatedRate                override rate on page 1
//                                        (default: rate from first invoice's first row)
// ---------------------------------------------------------------------------
export async function generateInvoice(idOrIds, outputPath, meta = {}) {
  const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
  const isBulk = ids.length > 1;

  // ── 1. Fetch all invoice records ─────────────────────────────────────────
  const invoiceDataList = await Promise.all(
    ids.map((id) =>
      Invoices.findByPk(id, {
        include: [
          { model: InvoiceRows, as: "Rows" },
          { model: Clients, as: "client" },
          { model: Drivers, as: "driver" },
          { model: Trailers, as: "trailer" },
          { model: Address, as: "address" },
          { model: Bills, as: "bills" },
        ],
      }),
    ),
  );

  const plainList = invoiceDataList.map((inv) => inv?.toJSON());

  // ── 2. Build HTML ─────────────────────────────────────────────────────────
  let bodyHtml = "";

  if (!isBulk) {
    // Single invoice — original behaviour unchanged
    console.log("Generating single invoice PDF for ID:", ids[0]);
    bodyHtml = buildInvoiceHtml(plainList[0], plainList[0].Rows, meta);
  } else {
    // Page 1 — consolidated (1 row, trailer count, rate × count, no LR/Doc)
    bodyHtml += buildConsolidatedInvoiceHtml(plainList, meta);

    // Page 2 — summary sheet with full per-invoice detail
    bodyHtml += buildSummarySheetHtml(plainList, meta);
  }

  const title = isBulk
    ? `Consolidated Invoice — ${plainList[0]?.client?.displayName || ids.join(", ")}`
    : `Invoice ${plainList[0]?.billNo || ids[0]}`;

  const html = wrapInDocument(bodyHtml, title);

  // ── 3. Render via Puppeteer ───────────────────────────────────────────────
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // console.log(
  //   `PDF generation — ${isBulk ? `bulk consolidated (${ids.length} invoices)` : "single invoice"}`,
  // );

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfOptions = {
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    };

    if (outputPath) {
      await page.pdf({ ...pdfOptions, path: outputPath });
      // console.log("PDF saved to:", outputPath);
      return outputPath;
    } else {
      const buffer = await page.pdf(pdfOptions);
      // console.log(`PDF buffer generated for invoice(s): ${ids.join(", ")}`);
      return buffer;
    }
  } finally {
    await browser.close();
  }
}

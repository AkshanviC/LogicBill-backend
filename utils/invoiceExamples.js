/**
 * invoiceGenerator.examples.js
 * Copy-paste examples showing how to use generateInvoicePDF / generateBulkInvoicePDFs
 * with real Sequelize data.
 */
import {
  generateInvoicePDF,
  generateBulkInvoicePDFs,
} from "../services/invoiceServices";
import path from "path";

// ============================================================
// EXAMPLE 1 — AL-DEFENCE style (simple, lumpsum, no extras)
// ============================================================
async function example_AL_DEFENCE() {
  const invoice = {
    sac: "996511",
    date: new Date("2025-07-28"),
    billNo: "1175",
    vendorCode: "7400668",
    gstno: "33AACPJ1154C2ZH",
    // pono, pan — not present → skipped automatically
  };

  const rows = [
    {
      fromAddress: "AL-ENNORE",
      toAddress: "AL-DEFENCE",
      trailerNo: "TN03AH6178",
      lrNo: "4357 / 27.07.2025",
      docNo: "74861410 , 74861411",
      weight: "20MT",
      rate: 0, // 0 → shows "LUMPSUM"
      amount: 2000,
      // prorate, loadingCharge, cgst, sgst — absent → skipped
    },
  ];

  const meta = {
    clientName: "M/s ASHOK LEYLAND LTD,",
    clientAddress: "ENNORE",
    clientGst: "33AAACA4651L1ZT",
    firmPhone1: "8939724222",
    firmPhone2: "9841819012",
  };

  await generateInvoicePDF(
    invoice,
    rows,
    path.join(__dirname, "AL-DEFENCE.pdf"),
    meta,
  );
  console.log("✅  AL-DEFENCE.pdf generated");
}

// ============================================================
// EXAMPLE 2 — AL-WAREHOUSE style (FTL, no weight column shown)
// ============================================================
async function example_AL_WAREHOUSE() {
  const invoice = {
    sac: "996511",
    date: new Date("2025-06-16"),
    billNo: "1142",
    vendorCode: "7400668",
    gstno: "33AACPJ1154C2ZH",
  };

  const rows = [
    {
      fromAddress: "PRABHA AUTOMOTIVE ENGINEERS PVT LTD., VALLAM, UNIT-9",
      toAddress: "AL-HOSUR WAREHOUSE",
      trailerNo: "TN03AH6197",
      lrNo: "2876 / 13.06.2025",
      invoiceNo: "9252601609",
      weight: "FTL", // present → weight column shown
      rate: null, // null → no rate column
      amount: 26000,
    },
  ];

  const meta = {
    clientName: "M/s ASHOK LEYLAND LTD",
    clientAddress: "HOSUR-I WARE HOUSE",
    clientGst: "33AAACA4651L1ZT",
    firmPhone1: "8939724222",
    firmPhone2: "9841819012",
  };

  await generateInvoicePDF(
    invoice,
    rows,
    path.join(__dirname, "AL-WAREHOUSE.pdf"),
    meta,
  );
  console.log("✅  AL-WAREHOUSE.pdf generated");
}

// ============================================================
// EXAMPLE 3 — GRO style (Bill of Supply, prorate + loading charge)
// ============================================================
async function example_GRO() {
  const invoice = {
    sac: "996511",
    date: new Date("2025-05-21"),
    billNo: "1099",
  };

  const rows = [
    {
      fromAddress: "AL-HOSUR II",
      toAddress: "AL-ENNORE",
      trailerNo: "TN03AH6197",
      lrNo: "26SCH00013_01731 / 20.05.25",
      shipmentNo: "6100197528",
      invoiceNo: "74817294",
      weight: 20,
      amount: 27144,
      prorate: 2714,
      loadingCharge: 250,
    },
  ];

  const meta = {
    clientName: "M/s. GRO DIGITAL PLATFORMS LIMITED,",
    clientAddress: "NO:1, SARDAR PATEL ROAD, GUINDY<br>CHENNAI - 600 032",
    isBillOfSupply: true, // removes "To:" label + RCM banner, adds BILL OF SUPPLY tag
    firmPhone1: "8939724222",
    firmPhone2: "9841819012",
  };

  await generateInvoicePDF(
    invoice,
    rows,
    path.join(__dirname, "GRO.pdf"),
    meta,
  );
  console.log("✅  GRO.pdf generated");
}

// ============================================================
// EXAMPLE 4 — SWITCH MOBILITY style (multi-load, per-trailer rate)
// ============================================================
async function example_SWITCH() {
  const invoice = {
    sac: "996511",
    date: new Date("2025-07-25"),
    billNo: "1172",
    pono: "4070365653",
    vendorCode: "7400668",
    gstno: "33AACPJ1154C2ZH",
  };

  const rows = [
    {
      fromAddress: "SWITCH MOBILITY, ENNORE",
      toAddress: "VIRALIMALAI TRICHY (GLOBAL TVS)",
      others: "By 40 FT Trailers — Details Attached",
      trailers: 9, // triggers "No. of Trailers" column
      rate: 37000,
      amount: 333000,
    },
  ];

  const meta = {
    clientName: "M/s SWITCH MOBILITY AUTOMOTIVE LIMITED,",
    clientAddress: "NO:1 ALCOB SARDAR PATEL ROAD, GUINDY-32",
    clientGst: "33ABFCS1827E1ZN",
    firmPhone1: "8939724222",
    firmPhone2: "9841819012",
  };

  await generateInvoicePDF(
    invoice,
    rows,
    path.join(__dirname, "SWITCH.pdf"),
    meta,
  );
  console.log("✅  SWITCH.pdf generated");
}

// ============================================================
// EXAMPLE 5 — VMI style (vehicle hiring, GST included in row)
// ============================================================
async function example_VMI() {
  const invoice = {
    date: new Date("2025-08-01"),
    billNo: "1181",
    pan: "AACPJ1154C",
    gstno: "33AACPJ1154C2ZH",
    vendorCode: "7400668",
    pono: "4070361378",
  };

  const rows = [
    {
      // No from/to for hiring invoices
      others:
        "VMI - Vehicles hiring charge for the month of July 2025 (01/07/25 to 31/07/25)\nVEH.NO: TN03AK3768 (TRAILER)",
      amount: 140000,
      cgst: 12600,
      sgst: 12600,
    },
  ];

  const meta = {
    clientName: "M/S ASHOK LEYLAND LTD",
    clientAddress: "ENNORE",
    clientGst: "33AAACA4651L1ZT",
    firmPhone1: "25736143", // landline on this one
    firmPhone2: "9841819012",
  };

  await generateInvoicePDF(
    invoice,
    rows,
    path.join(__dirname, "VMI.pdf"),
    meta,
  );
  console.log("✅  VMI.pdf generated");
}

// ============================================================
// EXAMPLE 6 — Bulk generation (all 5 at once)
// ============================================================
async function example_BULK() {
  // In production you'd query the DB here. This shows the shape expected:
  const items = [
    {
      invoice: {
        sac: "996511",
        date: new Date("2025-07-28"),
        billNo: "1175",
        vendorCode: "7400668",
        gstno: "33AACPJ1154C2ZH",
      },
      rows: [
        {
          fromAddress: "AL-ENNORE",
          toAddress: "AL-DEFENCE",
          trailerNo: "TN03AH6178",
          lrNo: "4357 / 27.07.2025",
          docNo: "74861410 , 74861411",
          weight: "20MT",
          amount: 2000,
        },
      ],
      outputPath: path.join(__dirname, "bulk_AL-DEFENCE.pdf"),
      meta: {
        clientName: "M/s ASHOK LEYLAND LTD,",
        clientAddress: "ENNORE",
        clientGst: "33AAACA4651L1ZT",
        firmPhone1: "8939724222",
        firmPhone2: "9841819012",
      },
    },
    {
      invoice: {
        sac: "996511",
        date: new Date("2025-07-25"),
        billNo: "1172",
        pono: "4070365653",
        vendorCode: "7400668",
        gstno: "33AACPJ1154C2ZH",
      },
      rows: [
        {
          fromAddress: "SWITCH MOBILITY, ENNORE",
          toAddress: "VIRALIMALAI TRICHY (GLOBAL TVS)",
          trailers: 9,
          rate: 37000,
          amount: 333000,
        },
      ],
      outputPath: path.join(__dirname, "bulk_SWITCH.pdf"),
      meta: {
        clientName: "M/s SWITCH MOBILITY AUTOMOTIVE LIMITED,",
        clientAddress: "NO:1 ALCOB SARDAR PATEL ROAD, GUINDY-32",
        clientGst: "33ABFCS1827E1ZN",
        firmPhone1: "8939724222",
        firmPhone2: "9841819012",
      },
    },
    // ... add more items
  ];

  const paths = await generateBulkInvoicePDFs(items, { concurrency: 3 });
  console.log("✅  Bulk PDFs generated:", paths);
}

// ============================================================
// EXAMPLE 7 — Express.js route (stream PDF to browser)
// ============================================================
/*
const express = require("express");
const app = express();
const { generateInvoicePDF } = require("./invoiceGenerator");
const os = require("os");

app.get("/invoice/:id/pdf", async (req, res) => {
  const { invoice, rows, meta } = await fetchInvoiceFromDB(req.params.id); // your DB call

  const tmpFile = path.join(os.tmpdir(), `invoice_${req.params.id}.pdf`);
  await generateInvoicePDF(invoice, rows, tmpFile, meta);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="invoice_${invoice.billNo}.pdf"`);
  res.sendFile(tmpFile);
});
*/

// Run individual examples
(async () => {
  await example_AL_DEFENCE();
  await example_AL_WAREHOUSE();
  await example_GRO();
  await example_SWITCH();
  await example_VMI();
})();

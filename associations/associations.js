import Invoices from "../models/invoices.js";
import InvoiceRows from "../models/invoiceRows.js";
import InvoiceHeaders from "../models/invoiceHeaders.js";
import TransportFirm from "../models/transportFirm.js";

Invoices.hasMany(InvoiceRows, { foreignKey: "invoiceId", as: "Rows" });

Invoices.hasMany(InvoiceHeaders, { foreignKey: "invoiceId", as: "Headers" });

InvoiceRows.belongsTo(Invoices, { foreignKey: "invoiceId" });

InvoiceHeaders.belongsTo(Invoices, { foreignKey: "invoiceId" });

TransportFirm.hasMany(Invoices, {
  foreignKey: "transportFirmId",
  as: "Invoices",
});

export { Invoices, TransportFirm, InvoiceHeaders, InvoiceRows };

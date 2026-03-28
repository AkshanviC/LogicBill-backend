import Invoices from "../models/invoices.js";
import InvoiceRows from "../models/invoiceRows.js";
import InvoiceHeaders from "../models/invoiceHeaders.js";
import TransportFirm from "../models/transportFirm.js";
import Trailers from "../models/trailers.js";
import Drivers from "../models/drivers.js";
import Clients from "../models/clients.js";

Invoices.hasMany(InvoiceRows, { foreignKey: "invoiceId", as: "Rows" });

Invoices.hasMany(InvoiceHeaders, { foreignKey: "invoiceId", as: "Headers" });

InvoiceRows.belongsTo(Invoices, { foreignKey: "invoiceId" });

InvoiceHeaders.belongsTo(Invoices, { foreignKey: "invoiceId" });

Invoices.belongsTo(Drivers, { foreignKey: "driverId", as: "driver" });

Invoices.belongsTo(Trailers, { foreignKey: "trailerId", as: "trailer" });

Invoices.belongsTo(Clients, { foreignKey: "clientId", as: "client" });

TransportFirm.hasMany(Invoices, {
  foreignKey: "transportFirmId",
  as: "Invoices",
});

export { Invoices, TransportFirm, InvoiceHeaders, InvoiceRows };

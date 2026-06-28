import Invoices from "../models/invoices.js";
import InvoiceRows from "../models/invoiceRows.js";
import InvoiceHeaders from "../models/invoiceHeaders.js";
import TransportFirm from "../models/transportFirm.js";
import Trailers from "../models/trailers.js";
import Drivers from "../models/drivers.js";
import Clients from "../models/clients.js";
import Address from "../models/address.js";
import Bills from "../models/bills.js";

Invoices.hasMany(InvoiceRows, { foreignKey: "invoiceId", as: "Rows" });

Invoices.hasMany(InvoiceHeaders, { foreignKey: "invoiceId", as: "Headers" });

InvoiceRows.belongsTo(Invoices, { foreignKey: "invoiceId" });

InvoiceHeaders.belongsTo(Invoices, { foreignKey: "invoiceId" });

Invoices.belongsTo(Drivers, { foreignKey: "driverId", as: "driver" });

Invoices.belongsTo(Trailers, { foreignKey: "trailerId", as: "trailer" });

Invoices.belongsTo(Clients, { foreignKey: "clientId", as: "client" });

Invoices.belongsTo(Address, { foreignKey: "addressId", as: "address" });

TransportFirm.hasMany(Invoices, {
  foreignKey: "transportFirmId",
  as: "Invoices",
});

Address.belongsTo(Clients, { foreignKey: "clientId", as: "client" });

Bills.hasMany(Invoices, { foreignKey: "billId" });
Invoices.belongsTo(Bills, { foreignKey: "billId", as: "bills" });

export { Invoices, TransportFirm, InvoiceHeaders, InvoiceRows, Address, Bills };

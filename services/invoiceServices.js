import {
  Invoices,
  InvoiceHeaders,
  InvoiceRows,
} from "../associations/associations.js";
import Clients from "../models/clients.js";
import Drivers from "../models/drivers.js";
import Trailers from "../models/trailers.js";

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

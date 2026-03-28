import {
  fetchAllInvoices,
  fetchInvoiceById,
  createNewInvoice,
  updateInvoiceById,
  deleteInvoiceById,
  createNewInvoiceHeader,
  createNewInvoiceRows,
} from "../services/invoiceServices.js";
import sequelize from "../utils/db.js";

/**
 * GET /invoices
 * Fetch all invoices with optional pagination
 */
export const getInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10, driverId, trailerId, clientId } = req.query;
    console.log(driverId, trailerId, clientId);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ message: "Invalid page number" });
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res
        .status(400)
        .json({ message: "Limit must be between 1 and 100" });
    }

    const invoices = await fetchAllInvoices({
      page: pageNum,
      limit: limitNum,
      invoiceFilters: { driverId, trailerId, clientId },
    });
    return res.status(200).json(invoices);
  } catch (error) {
    console.error("getInvoices error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /invoices/:id
 * Fetch a single invoice by ID
 */
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    const invoice = await fetchInvoiceById(parseInt(id));

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    return res.status(200).json(invoice);
  } catch (error) {
    console.error("getInvoiceById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /invoices
 * Create a new invoice
 */
export const createInvoice = async (req, res) => {
  try {
    // console.log(req.data, req.body);
    const t = await sequelize.transaction();
    const { invoices, invoiceRows } = req.body;
    let formattedDate = null;
    if (!invoices.date) {
      formattedDate = new Date().toISOString().split("T")[0]; // Default to current date in YYYY-MM-DD format
    } else {
      const [day, month, year] = invoices.date.split("-");
      formattedDate = `${year}-${month}-${day}`;
    }
    // Required field validation
    // if (!templateDetails) {
    //   return res.status(400).json({ message: "templateDetails is required" });
    // }
    if (!invoices.createdBy || isNaN(parseInt(invoices.createdBy))) {
      return res
        .status(400)
        .json({ message: "createdBy must be a valid user ID" });
    }
    if (!invoices.templateId || isNaN(parseInt(invoices.templateId))) {
      return res
        .status(400)
        .json({ message: "templateId must be a valid template ID" });
    }

    const invoice = await createNewInvoice(
      { ...invoices, date: formattedDate },
      { transaction: t },
    );
    // console.log(invoice.id, "invoiceid");
    if (invoice.id) {
      // console.log(invoiceHeaders);
      // const [day, month, year] = invoiceHeaders.date.split("-");
      // const formattedDate = `${year}-${month}-${day}`;
      // // console.log(formattedDate);
      // let headerInput = {
      //   ...invoiceHeaders,
      //   invoiceId: invoice.id,
      //   date: formattedDate,
      // };

      let rowInput = invoiceRows.map(({ id, ...data }) => {
        return { ...data, invoiceId: invoice.id };
      });
      console.log("invoice.id:", invoice.id, typeof invoice.id);
      console.log("rowInput:", JSON.stringify(rowInput));
      // const date = new Date(invoiceHeaders.date);
      // console.log(date, "date");
      console.log(rowInput);
      // const invoiceHeader = await createNewInvoiceHeader(headerInput, {
      //   transaction: t,
      // });
      const invoiceRow = await createNewInvoiceRows(rowInput, {
        transaction: t,
      });
      await t.commit();
      console.log(invoiceRow.id);
    }
    return res.status(201).json(invoice);
  } catch (error) {
    console.error("createInvoice error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /invoices/:id
 * Update an existing invoice by ID
 */
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    const {
      templateDetails,
      createdBy,
      templateId,
      fromAddress,
      toAddress,
      trailerNo,
      lrNo,
      invoiceNo,
      docNo,
      shipmentNo,
      others,
      weigth,
      trailers,
      rate,
      amount,
      prorate,
      loadingCharge,
      cgst,
      sgst,
    } = req.body;

    // Optional field type validations (only validate if provided)
    if (createdBy !== undefined && isNaN(parseInt(createdBy))) {
      return res
        .status(400)
        .json({ message: "createdBy must be a valid user ID" });
    }
    if (templateId !== undefined && isNaN(parseInt(templateId))) {
      return res
        .status(400)
        .json({ message: "templateId must be a valid template ID" });
    }

    const updatedInvoice = await updateInvoiceById(parseInt(id), {
      templateDetails,
      createdBy,
      templateId,
      fromAddress,
      toAddress,
      trailerNo,
      lrNo,
      invoiceNo,
      docNo,
      shipmentNo,
      others,
      weigth,
      trailers,
      rate,
      amount,
      prorate,
      loadingCharge,
      cgst,
      sgst,
    });

    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    return res.status(200).json(updatedInvoice);
  } catch (error) {
    console.error("updateInvoice error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /invoices/:id
 * Delete an invoice by ID
 */
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    const deleted = await deleteInvoiceById(parseInt(id));

    if (!deleted) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    return res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("deleteInvoice error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

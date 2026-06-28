import { Router } from "express";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  generateInvoiceController as generateInvoice,
  generateInvoiceList,
} from "../controllers/invoiceControllers.js";

const router = Router();

router.get("/getInvoice", getInvoices);
router.get("/:id", getInvoiceById);
router.post("/", createInvoice);
router.put("/:id", updateInvoice);
router.delete("/:id", deleteInvoice);
router.post("/generate/:id", generateInvoice);
router.post("/generate", generateInvoiceList);

export default router;

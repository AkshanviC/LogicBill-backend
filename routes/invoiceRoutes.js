import { Router } from "express";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  generateInvoice,
} from "../controllers/invoiceControllers.js";

const router = Router();

router.get("/getInvoice", getInvoices);
router.get("/:id", getInvoiceById);
router.post("/", createInvoice);
router.put("/:id", updateInvoice);
router.delete("/:id", deleteInvoice);
router.get("/generate/:id", generateInvoice);

export default router;

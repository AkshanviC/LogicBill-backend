import express from "express";
import {
  createTransportFirm,
  getAllTransportFirms,
  getTransportFirmById,
  updateTransportFirm,
  deleteTransportFirm,
} from "../controllers/transportFirmController.js";

const router = express.Router();

router.post("/", createTransportFirm);
router.get("/", getAllTransportFirms);
router.get("/:id", getTransportFirmById);
router.put("/:id", updateTransportFirm);
router.delete("/:id", deleteTransportFirm);

export default router;

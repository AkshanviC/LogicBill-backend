import e from "cors";
import {
  createTransportFirmService,
  getAllTransportFirmsService,
  getTransportFirmByIdService,
  updateTransportFirmService,
  deleteTransportFirmService,
} from "../services/transportfirmServices.js";

export async function createTransportFirm(req, res) {
  try {
    const { name } = req.body;
    const transportFirm = await createTransportFirmService({ name });
    res.status(201).json(transportFirm);
  } catch (error) {
    console.error("Error creating transport firm:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllTransportFirms(req, res) {
  try {
    const transportFirms = await getAllTransportFirmsService();
    res.status(200).json(transportFirms);
  } catch (error) {
    console.error("Error fetching transport firms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getTransportFirmById(req, res) {
  try {
    const { id } = req.params;
    const transportFirm = await getTransportFirmByIdService(id);
    if (!transportFirm) {
      res.status(404).json({ message: "Transport firm not found" });
      return;
    }
    res.status(200).json(transportFirm);
  } catch (error) {
    console.error("Error fetching transport firm:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateTransportFirm(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updated = await updateTransportFirmService(id, { name });
    if (updated[0] === 0) {
      res.status(404).json({ message: "Transport firm not found" });
      return;
    }
    res.status(200).json({ message: "Transport firm updated successfully" });
  } catch (error) {
    console.error("Error updating transport firm:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteTransportFirm(req, res) {
  try {
    const { id } = req.params;
    const deleted = await deleteTransportFirmService(id);
    if (deleted === 0) {
      res.status(404).json({ message: "Transport firm not found" });
      return;
    }
    res.status(200).json({ message: "Transport firm deleted successfully" });
  } catch (error) {
    console.error("Error deleting transport firm:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

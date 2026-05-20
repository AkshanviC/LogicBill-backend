import {
  getAllAddressesController,
  createAddressController,
} from "../controllers/addressController.js";
import express from "express";

const router = express.Router();

router.post("/create", createAddressController);
router.get("/all", getAllAddressesController);

export default router;

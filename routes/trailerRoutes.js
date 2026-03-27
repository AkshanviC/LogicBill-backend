import { Router } from "express";
import {
  getTrailers,
  getTrailerById,
  createTrailer,
  updateTrailer,
  deleteTrailer,
} from "../controllers/trailerControllers.js";

const router = Router();

router.get("/", getTrailers);
router.get("/:id", getTrailerById);
router.post("/", createTrailer);
router.put("/:id", updateTrailer);
router.delete("/:id", deleteTrailer);

export default router;

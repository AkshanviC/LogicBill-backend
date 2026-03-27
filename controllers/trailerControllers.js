import {
  fetchAllTrailers,
  fetchTrailerById,
  createNewTrailer,
  updateTrailerById,
  deleteTrailerById,
} from "../services/trailerService.js";

/**
 * GET /trailers
 * Fetch all trailers with optional pagination
 */
export const getTrailers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

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

    const trailers = await fetchAllTrailers({ page: pageNum, limit: limitNum });
    return res.status(200).json(trailers);
  } catch (error) {
    console.error("getTrailers error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /trailers/:id
 * Fetch a single trailer by ID
 */
export const getTrailerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid trailer ID" });
    }

    const trailer = await fetchTrailerById(parseInt(id));

    if (!trailer) {
      return res.status(404).json({ message: "Trailer not found" });
    }

    return res.status(200).json(trailer);
  } catch (error) {
    console.error("getTrailerById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /trailers
 * Create a new trailer
 */
export const createTrailer = async (req, res) => {
  try {
    const { regNo } = req.body;

    if (!regNo || typeof regNo !== "string" || regNo.trim() === "") {
      return res
        .status(400)
        .json({ message: "regNo is required and must be a non-empty string" });
    }

    const trailer = await createNewTrailer({
      regNo: regNo.trim().toUpperCase(),
    });
    return res.status(201).json(trailer);
  } catch (error) {
    console.error("createTrailer error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /trailers/:id
 * Update an existing trailer by ID
 */
export const updateTrailer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid trailer ID" });
    }

    const { regNo } = req.body;

    if (
      regNo !== undefined &&
      (typeof regNo !== "string" || regNo.trim() === "")
    ) {
      return res
        .status(400)
        .json({ message: "regNo must be a non-empty string" });
    }

    const updatedTrailer = await updateTrailerById(parseInt(id), {
      ...(regNo !== undefined && { regNo: regNo.trim().toUpperCase() }),
    });

    if (!updatedTrailer) {
      return res.status(404).json({ message: "Trailer not found" });
    }

    return res.status(200).json(updatedTrailer);
  } catch (error) {
    console.error("updateTrailer error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /trailers/:id
 * Delete a trailer by ID
 */
export const deleteTrailer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid trailer ID" });
    }

    const deleted = await deleteTrailerById(parseInt(id));

    if (!deleted) {
      return res.status(404).json({ message: "Trailer not found" });
    }

    return res.status(200).json({ message: "Trailer deleted successfully" });
  } catch (error) {
    console.error("deleteTrailer error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

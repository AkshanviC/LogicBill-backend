import {
  fetchAllTrailers,
  fetchTrailerById,
  createNewTrailer,
  updateTrailerById,
  deleteTrailerById,
} from "../services/trailerService.js";

/**
 * Validate and normalise transportFirmIds from the request body.
 * Returns { ids } on success (unique positive integers) or { error } on failure.
 */
const parseTransportFirmIds = (raw) => {
  if (!Array.isArray(raw)) {
    return { error: "transportFirmIds must be an array of transport firm IDs" };
  }

  const ids = raw.map((value) => Number(value));
  if (ids.some((id) => !Number.isInteger(id) || id < 1)) {
    return { error: "transportFirmIds must contain only positive integers" };
  }

  return { ids: [...new Set(ids)] };
};

const isForeignKeyError = (error) =>
  error?.name === "SequelizeForeignKeyConstraintError";

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
 * Body: { regNo: string, transportFirmIds?: number[] }
 */
export const createTrailer = async (req, res) => {
  try {
    const { regNo, transportFirmIds } = req.body;

    if (!regNo || typeof regNo !== "string" || regNo.trim() === "") {
      return res
        .status(400)
        .json({ message: "regNo is required and must be a non-empty string" });
    }

    let firmIds = [];
    if (transportFirmIds !== undefined) {
      const parsed = parseTransportFirmIds(transportFirmIds);
      if (parsed.error) {
        return res.status(400).json({ message: parsed.error });
      }
      firmIds = parsed.ids;
    }

    const trailer = await createNewTrailer({
      regNo: regNo.trim().toUpperCase(),
      transportFirmIds: firmIds,
    });
    return res.status(201).json(trailer);
  } catch (error) {
    if (isForeignKeyError(error)) {
      return res
        .status(400)
        .json({ message: "One or more transport firms do not exist" });
    }
    console.error("createTrailer error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /trailers/:id
 * Update an existing trailer by ID
 * Body: { regNo?: string, transportFirmIds?: number[] }
 * If transportFirmIds is sent, it replaces the trailer's current firm list.
 */
export const updateTrailer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid trailer ID" });
    }

    const { regNo, transportFirmIds } = req.body;

    if (
      regNo !== undefined &&
      (typeof regNo !== "string" || regNo.trim() === "")
    ) {
      return res
        .status(400)
        .json({ message: "regNo must be a non-empty string" });
    }

    let firmIds;
    if (transportFirmIds !== undefined) {
      const parsed = parseTransportFirmIds(transportFirmIds);
      if (parsed.error) {
        return res.status(400).json({ message: parsed.error });
      }
      firmIds = parsed.ids;
    }

    const updatedTrailer = await updateTrailerById(parseInt(id), {
      ...(regNo !== undefined && { regNo: regNo.trim().toUpperCase() }),
      ...(firmIds !== undefined && { transportFirmIds: firmIds }),
    });

    if (!updatedTrailer) {
      return res.status(404).json({ message: "Trailer not found" });
    }

    return res.status(200).json(updatedTrailer);
  } catch (error) {
    if (isForeignKeyError(error)) {
      return res
        .status(400)
        .json({ message: "One or more transport firms do not exist" });
    }
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

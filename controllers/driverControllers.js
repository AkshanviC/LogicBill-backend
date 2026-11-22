import {
  fetchAllDrivers,
  fetchDriverById,
  createNewDriver,
  updateDriverById,
  deleteDriverById,
} from "../services/driverService.js";

const PHONE_REGEX = /^\+?[0-9\s\-().]{7,20}$/;

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
 * GET /drivers
 * Fetch drivers with optional pagination, search and transport firm filter
 * Query: page, limit, search (name or phone), transportFirmId
 */
export const getDrivers = async (req, res) => {
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

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim().slice(0, 50)
        : "";

    let transportFirmId;
    if (
      req.query.transportFirmId !== undefined &&
      req.query.transportFirmId !== ""
    ) {
      transportFirmId = Number(req.query.transportFirmId);
      if (!Number.isInteger(transportFirmId) || transportFirmId < 1) {
        return res.status(400).json({ message: "Invalid transportFirmId" });
      }
    }

    const drivers = await fetchAllDrivers({
      page: pageNum,
      limit: limitNum,
      search,
      transportFirmId,
    });
    return res.status(200).json(drivers);
  } catch (error) {
    console.error("getDrivers error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /drivers/:id
 * Fetch a single driver by ID
 */
export const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }

    const driver = await fetchDriverById(parseInt(id));

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    return res.status(200).json(driver);
  } catch (error) {
    console.error("getDriverById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /drivers
 * Create a new driver
 * Body: { name: string, phoneNumber: string, transportFirmIds?: number[] }
 */
export const createDriver = async (req, res) => {
  try {
    const { name, phoneNumber, transportFirmIds } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "name is required and must be a non-empty string" });
    }

    if (
      !phoneNumber ||
      typeof phoneNumber !== "string" ||
      phoneNumber.trim() === ""
    ) {
      return res.status(400).json({
        message: "phoneNumber is required and must be a non-empty string",
      });
    }

    if (!PHONE_REGEX.test(phoneNumber.trim())) {
      return res.status(400).json({ message: "phoneNumber format is invalid" });
    }

    let firmIds = [];
    if (transportFirmIds !== undefined) {
      const parsed = parseTransportFirmIds(transportFirmIds);
      if (parsed.error) {
        return res.status(400).json({ message: parsed.error });
      }
      firmIds = parsed.ids;
    }

    const driver = await createNewDriver({
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      transportFirmIds: firmIds,
    });

    return res.status(201).json(driver);
  } catch (error) {
    if (isForeignKeyError(error)) {
      return res
        .status(400)
        .json({ message: "One or more transport firms do not exist" });
    }
    console.error("createDriver error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /drivers/:id
 * Update an existing driver by ID
 * Body: { name?: string, phoneNumber?: string, transportFirmIds?: number[] }
 * If transportFirmIds is sent, it replaces the driver's current firm list.
 */
export const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }

    const { name, phoneNumber, transportFirmIds } = req.body;

    if (
      name !== undefined &&
      (typeof name !== "string" || name.trim() === "")
    ) {
      return res
        .status(400)
        .json({ message: "name must be a non-empty string" });
    }

    if (phoneNumber !== undefined) {
      if (typeof phoneNumber !== "string" || phoneNumber.trim() === "") {
        return res
          .status(400)
          .json({ message: "phoneNumber must be a non-empty string" });
      }
      if (!PHONE_REGEX.test(phoneNumber.trim())) {
        return res
          .status(400)
          .json({ message: "phoneNumber format is invalid" });
      }
    }

    let firmIds;
    if (transportFirmIds !== undefined) {
      const parsed = parseTransportFirmIds(transportFirmIds);
      if (parsed.error) {
        return res.status(400).json({ message: parsed.error });
      }
      firmIds = parsed.ids;
    }

    const updatedDriver = await updateDriverById(parseInt(id), {
      ...(name !== undefined && { name: name.trim() }),
      ...(phoneNumber !== undefined && { phoneNumber: phoneNumber.trim() }),
      ...(firmIds !== undefined && { transportFirmIds: firmIds }),
    });

    if (!updatedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    return res.status(200).json(updatedDriver);
  } catch (error) {
    if (isForeignKeyError(error)) {
      return res
        .status(400)
        .json({ message: "One or more transport firms do not exist" });
    }
    console.error("updateDriver error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /drivers/:id
 * Delete a driver by ID
 */
export const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }

    const deleted = await deleteDriverById(parseInt(id));

    if (!deleted) {
      return res.status(404).json({ message: "Driver not found" });
    }

    return res.status(200).json({ message: "Driver deleted successfully" });
  } catch (error) {
    console.error("deleteDriver error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

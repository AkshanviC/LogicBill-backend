import Drivers from "../models/drivers.js";

/**
 * Fetch all drivers with pagination
 * @param {Object} options - { page, limit }
 * @returns {Object} - { data, total, page, limit, totalPages }
 */
export const fetchAllDrivers = async ({ page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await Drivers.findAndCountAll({
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    data: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
};

/**
 * Fetch a single driver by primary key
 * @param {number} id
 * @returns {Object|null}
 */
export const fetchDriverById = async (id) => {
  const driver = await Drivers.findByPk(id);
  return driver;
};

/**
 * Create a new driver record
 * @param {Object} data - { name, phoneNumber }
 * @returns {Object} - Created driver
 */
export const createNewDriver = async (data) => {
  const driver = await Drivers.create(data);
  return driver;
};

/**
 * Update a driver by ID
 * Only updates fields that are explicitly provided
 * @param {number} id
 * @param {Object} data - Partial driver fields
 * @returns {Object|null} - Updated driver or null if not found
 */
export const updateDriverById = async (id, data) => {
  const driver = await Drivers.findByPk(id);

  if (!driver) return null;

  await driver.update(data);
  return driver;
};

/**
 * Delete a driver by ID
 * @param {number} id
 * @returns {boolean} - true if deleted, false if not found
 */
export const deleteDriverById = async (id) => {
  const driver = await Drivers.findByPk(id);

  if (!driver) return false;

  await driver.destroy();
  return true;
};

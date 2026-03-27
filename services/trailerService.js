import Trailers from "../models/trailers.js";

/**
 * Fetch all trailers with pagination
 * @param {Object} options - { page, limit }
 * @returns {Object} - { data, total, page, limit, totalPages }
 */
export const fetchAllTrailers = async ({ page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await Trailers.findAndCountAll({
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
 * Fetch a single trailer by primary key
 * @param {number} id
 * @returns {Object|null}
 */
export const fetchTrailerById = async (id) => {
  const trailer = await Trailers.findByPk(id);
  return trailer;
};

/**
 * Create a new trailer record
 * @param {Object} data - { regNo }
 * @returns {Object} - Created trailer
 */
export const createNewTrailer = async (data) => {
  const trailer = await Trailers.create(data);
  return trailer;
};

/**
 * Update a trailer by ID
 * Only updates fields that are explicitly provided
 * @param {number} id
 * @param {Object} data - Partial trailer fields
 * @returns {Object|null} - Updated trailer or null if not found
 */
export const updateTrailerById = async (id, data) => {
  const trailer = await Trailers.findByPk(id);

  if (!trailer) return null;

  await trailer.update(data);
  return trailer;
};

/**
 * Delete a trailer by ID
 * @param {number} id
 * @returns {boolean} - true if deleted, false if not found
 */
export const deleteTrailerById = async (id) => {
  const trailer = await Trailers.findByPk(id);

  if (!trailer) return false;

  await trailer.destroy();
  return true;
};

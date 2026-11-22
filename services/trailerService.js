import sequelize from "../utils/db.js";
import Trailers from "../models/trailers.js";
import TrailerTransportFirms from "../models/trailerTransportFirm.js";

const firmInclude = {
  model: TrailerTransportFirms,
  as: "trailerFirms",
  attributes: ["transportFirmId"],
};

/**
 * Shape a trailer row for the API:
 * { id, regNo, createdAt, updatedAt, transportFirmIds: [1, 2] }
 */
const toTrailerResponse = (trailer) => {
  const { trailerFirms = [], ...rest } = trailer.toJSON();
  return {
    ...rest,
    transportFirmIds: trailerFirms.map((link) => link.transportFirmId),
  };
};

/**
 * Fetch all trailers with pagination
 * @param {Object} options - { page, limit }
 * @returns {Object} - { data, total, page, limit, totalPages }
 */
export const fetchAllTrailers = async ({ page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await Trailers.findAndCountAll({
    include: [firmInclude],
    distinct: true, // count trailers, not joined rows
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    data: rows.map(toTrailerResponse),
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
  const trailer = await Trailers.findByPk(id, { include: [firmInclude] });
  return trailer ? toTrailerResponse(trailer) : null;
};

/**
 * Create a new trailer and link it to its transport firms
 * @param {Object} data - { regNo, transportFirmIds }
 * @returns {Object} - Created trailer with transportFirmIds
 */
export const createNewTrailer = async ({ regNo, transportFirmIds = [] }) => {
  const trailerId = await sequelize.transaction(async (t) => {
    const trailer = await Trailers.create({ regNo }, { transaction: t });

    if (transportFirmIds.length > 0) {
      await TrailerTransportFirms.bulkCreate(
        transportFirmIds.map((transportFirmId) => ({
          trailerId: trailer.id,
          transportFirmId,
        })),
        { transaction: t },
      );
    }

    return trailer.id;
  });

  return fetchTrailerById(trailerId);
};

/**
 * Update a trailer by ID
 * Only updates fields that are explicitly provided.
 * If transportFirmIds is provided, it replaces the trailer's firm list.
 * @param {number} id
 * @param {Object} data - { regNo?, transportFirmIds? }
 * @returns {Object|null} - Updated trailer or null if not found
 */
export const updateTrailerById = async (
  id,
  { transportFirmIds, ...fields },
) => {
  const trailer = await Trailers.findByPk(id);

  if (!trailer) return null;

  await sequelize.transaction(async (t) => {
    if (Object.keys(fields).length > 0) {
      await trailer.update(fields, { transaction: t });
    }

    if (transportFirmIds !== undefined) {
      await TrailerTransportFirms.destroy({
        where: { trailerId: id },
        transaction: t,
      });

      if (transportFirmIds.length > 0) {
        await TrailerTransportFirms.bulkCreate(
          transportFirmIds.map((transportFirmId) => ({
            trailerId: id,
            transportFirmId,
          })),
          { transaction: t },
        );
      }
    }
  });

  return fetchTrailerById(id);
};

/**
 * Delete a trailer by ID (and its firm links)
 * @param {number} id
 * @returns {boolean} - true if deleted, false if not found
 */
export const deleteTrailerById = async (id) => {
  const trailer = await Trailers.findByPk(id);

  if (!trailer) return false;

  await sequelize.transaction(async (t) => {
    await TrailerTransportFirms.destroy({
      where: { trailerId: id },
      transaction: t,
    });
    await trailer.destroy({ transaction: t });
  });

  return true;
};

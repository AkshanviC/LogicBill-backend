import Clients from "../models/clients.js";

/**
 * Fetch all clients with pagination
 * @param {Object} options - { page, limit }
 * @returns {Object} - { data, total, page, limit, totalPages }
 */
export const fetchAllClients = async ({ page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await Clients.findAndCountAll({
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
 * Fetch a single client by primary key
 * @param {number} id
 * @returns {Object|null}
 */
export const fetchClientById = async (id) => {
  const client = await Clients.findByPk(id);
  return client;
};

/**
 * Create a new client record
 * @param {Object} data - { name }
 * @returns {Object} - Created client
 */
export const createNewClient = async (data) => {
  const client = await Clients.create(data);
  return client;
};

/**
 * Update a client by ID
 * Only updates fields that are explicitly provided
 * @param {number} id
 * @param {Object} data - Partial client fields
 * @returns {Object|null} - Updated client or null if not found
 */
export const updateClientById = async (id, data) => {
  const client = await Clients.findByPk(id);

  if (!client) return null;

  await client.update(data);
  return client;
};

/**
 * Delete a client by ID
 * @param {number} id
 * @returns {boolean} - true if deleted, false if not found
 */
export const deleteClientById = async (id) => {
  const client = await Clients.findByPk(id);

  if (!client) return false;

  await client.destroy();
  return true;
};

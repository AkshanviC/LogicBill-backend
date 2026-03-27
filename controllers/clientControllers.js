import {
  fetchAllClients,
  fetchClientById,
  createNewClient,
  updateClientById,
  deleteClientById,
} from "../services/clientService.js";

/**
 * GET /clients
 * Fetch all clients with optional pagination
 */
export const getClients = async (req, res) => {
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

    const clients = await fetchAllClients({ page: pageNum, limit: limitNum });
    return res.status(200).json(clients);
  } catch (error) {
    console.error("getClients error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /clients/:id
 * Fetch a single client by ID
 */
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    const client = await fetchClientById(parseInt(id));

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    return res.status(200).json(client);
  } catch (error) {
    console.error("getClientById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /clients
 * Create a new client
 */
export const createClient = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "name is required and must be a non-empty string" });
    }

    const client = await createNewClient({ name: name.trim() });
    return res.status(201).json(client);
  } catch (error) {
    console.error("createClient error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /clients/:id
 * Update an existing client by ID
 */
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    const { name } = req.body;

    if (
      name !== undefined &&
      (typeof name !== "string" || name.trim() === "")
    ) {
      return res
        .status(400)
        .json({ message: "name must be a non-empty string" });
    }

    const updatedClient = await updateClientById(parseInt(id), {
      ...(name !== undefined && { name: name.trim() }),
    });

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    return res.status(200).json(updatedClient);
  } catch (error) {
    console.error("updateClient error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /clients/:id
 * Delete a client by ID
 */
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    const deleted = await deleteClientById(parseInt(id));

    if (!deleted) {
      return res.status(404).json({ message: "Client not found" });
    }

    return res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("deleteClient error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

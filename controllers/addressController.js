import { createAddress, getAllAddresses } from "../services/addressServices.js";

export const createAddressController = async (req, res) => {
  try {
    const addressData = req.body;
    const address = await createAddress(addressData);
    res.status(201).json(address);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const getAllAddressesController = async (req, res) => {
  try {
    const { clientId } = req.query;
    const addresses = await getAllAddresses({ clientId });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

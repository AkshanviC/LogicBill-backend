import { Address } from "../associations/associations.js";

export const createAddress = async (addressData) => {
  try {
    const address = await Address.create(addressData);
    return address;
  } catch (error) {
    throw error;
  }
};

export const getAllAddresses = async ({ clientId }) => {
  try {
    let whereClause = {};
    if (clientId) {
      whereClause.clientId = clientId;
    }
    const addresses = await Address.findAll({ where: whereClause });
    return addresses;
  } catch (error) {
    throw error;
  }
};

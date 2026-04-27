import TransportFirm from "../models/transportFirm.js";

export function createTransportFirmService({ name }) {
  return TransportFirm.create({ name });
}

export function getAllTransportFirmsService() {
  return TransportFirm.findAll();
}

export function getTransportFirmByIdService(id) {
  return TransportFirm.findByPk(id);
}

export function updateTransportFirmService(id, { name }) {
  return TransportFirm.update({ name }, { where: { id } });
}

export function deleteTransportFirmService(id) {
  return TransportFirm.destroy({ where: { id } });
}

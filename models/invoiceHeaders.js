import sequelize from "../utils/db.js";
import { DataTypes } from "sequelize";

const InvoiceHeaders = sequelize.define("invoiceheaders", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sac: {
    type: DataTypes.STRING,
  },
  date: {
    type: DataTypes.DATE,
  },
  billNo: {
    type: DataTypes.STRING,
  },
  pono: {
    type: DataTypes.STRING,
  },
  vendorCode: {
    type: DataTypes.STRING,
  },
  gstno: {
    type: DataTypes.STRING,
  },
  pan: {
    type: DataTypes.STRING,
  },
  invoiceId: {
    type: DataTypes.INTEGER,
    references: {
      model: "invoices",
      key: "id",
    },
  },
});

export default InvoiceHeaders;

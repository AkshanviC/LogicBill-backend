import sequelize from "../utils/db.js";
import { DataTypes } from "sequelize";

const InvoiceRows = sequelize.define("invoicerows", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  templateDetails: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  fromAddress: {
    type: DataTypes.STRING,
  },
  toAddress: {
    type: DataTypes.STRING,
  },
  trailerNo: {
    type: DataTypes.STRING,
  },
  lrNo: {
    type: DataTypes.STRING,
  },
  invoiceNo: {
    type: DataTypes.STRING,
  },
  docNo: {
    type: DataTypes.STRING,
  },
  shipmentNo: {
    type: DataTypes.STRING,
  },
  others: {
    type: DataTypes.STRING,
  },
  weigth: {
    type: DataTypes.INTEGER,
  },
  trailers: {
    type: DataTypes.INTEGER,
  },
  rate: {
    type: DataTypes.INTEGER,
  },
  amount: {
    type: DataTypes.INTEGER,
  },
  prorate: {
    type: DataTypes.INTEGER,
  },
  loadingCharge: {
    type: DataTypes.INTEGER,
  },
  cgst: {
    type: DataTypes.INTEGER,
  },
  sgst: {
    type: DataTypes.INTEGER,
  },
});

export default InvoiceRows;

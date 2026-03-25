import sequelize from "../utils/db.js";
import { DataTypes } from "sequelize";

const Invoices = sequelize.define("invoices", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: "users",
      key: "id",
    },
    allowNull: false,
  },
  templateId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "templates",
      key: "id",
    },
  },
  date: {
    type: DataTypes.DATE,
  },
  transportFirmId: {
    type: DataTypes.INTEGER,
    references: {
      model: "transportfirm",
      key: "id",
    },
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
  trailerId: {
    type: DataTypes.INTEGER,
    references: {
      model: "trailers",
      key: "id",
    },
  },
  driverId: {
    type: DataTypes.INTEGER,
    references: {
      model: "drivers",
      key: "id",
    },
  },
  diesel: {
    type: DataTypes.STRING,
  },
  driverBeta: {
    type: DataTypes.STRING,
  },
  advance: {
    type: DataTypes.STRING,
  },
  clientId: {
    type: DataTypes.INTEGER,
    references: {
      model: "clients",
      key: "id",
    },
  },
});

export default Invoices;

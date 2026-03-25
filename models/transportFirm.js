import sequelize from "../utils/db.js";
import { DataTypes } from "sequelize";

const TransportFirm = sequelize.define(
  "transportfirm",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "transportfirm",
    timestamps: true, // This enables createdAt and updatedAt automatically
    createdAt: "createdAt", // Optional: explicitly map to the column name
    updatedAt: "updatedAt", // Optional: explicitly map to the column name
  }
);

export default TransportFirm;

import sequelize from "../utils/db.js";
import { DataTypes } from "sequelize";

const Clients = sequelize.define(
  "clients",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
    },
    gstNo: {
      type: DataTypes.STRING,
      field: "gstNo",
    },
    displayName: {
      type: DataTypes.TEXT,
      field: "displayName",
    },
    address: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "clients",
    timestamps: true, // This enables createdAt and updatedAt automatically
    underscored: true,
  },
);

export default Clients;

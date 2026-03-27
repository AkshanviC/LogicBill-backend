import sequelize from "../utils/db.js";
import { DataTypes } from "sequelize";

const Drivers = sequelize.define(
  "drivers",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
    },
    phoneNumber: {
      type: DataTypes.TEXT,
      field: "phoneNumber",
    },
  },
  {
    tableName: "drivers",
    timestamps: true, // This enables createdAt and updatedAt automatically
    underscored: true,
  }
);

export default Drivers;

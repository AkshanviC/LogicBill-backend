import sequelize from "../utils/db.js";
import { DataTypes } from "sequelize";

const Trailers = sequelize.define(
  "trailers",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    regNo: {
      type: DataTypes.TEXT,
      field: "regNo",
    },
    transportFirmId: {
      type: DataTypes.STRING,
      field: "transportFirmId",
      references: {
        model: "transportfirm",
        key: "id",
      },
    },
  },
  {
    tableName: "trailers",
    timestamps: true, // This enables createdAt and updatedAt automatically
    underscored: true,
  },
);

export default Trailers;

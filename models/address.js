import sequelize from "../utils/db.js";
import { DataTypes } from "sequelize";

const Address = sequelize.define(
  "address",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    from: {
      type: DataTypes.STRING,
    },
    to: {
      type: DataTypes.STRING,
    },
    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: "clients",
        key: "id",
      },
    },
  },
  {
    tableName: "address",
    timestamps: true, // This enables createdAt and updatedAt automatically
    underscored: true,
  },
);

export default Address;

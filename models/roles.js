import sequelize from "../utils/db";
import { DataTypes } from "sequelize";

const Roles = sequelize.define(
  "roles",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "roles",
    timestamps: true, // This enables createdAt and updatedAt automatically
    underscored: true,
  }
);

export default Roles;

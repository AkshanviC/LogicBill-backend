import sequelize from "../utils/db";
import { DataTypes } from "sequelize";

const Invoices = sequelize.define("invoices", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  templateDetails: {
    type: DataTypes.JSON,
    allowNull: false,
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
});

export default Invoices;

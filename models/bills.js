import sequelize from "../utils/db.js";
import { DataTypes } from "sequelize";

const Bills = sequelize.define("Bills", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // This acts as your billNo starting at 1000
  },
  billDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
});

export default Bills;

import sequelize from "../utils/db.js";
import { DataTypes } from "sequelize";

const Drivers = sequelize.define("drivers", {
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
  },
});

export default Drivers;

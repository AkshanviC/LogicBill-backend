import sequelize from "../utils/db.js";
import { DataTypes } from "sequelize";

const Clients = sequelize.define("clients", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.TEXT,
  },
});

export default Clients;

import sequelize from "../utils/db.js";
import { DataTypes } from "sequelize";

const Trailers = sequelize.define("drivers", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  regNo: {
    type: DataTypes.TEXT,
  },
});

export default Trailers;

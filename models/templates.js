import sequelize from "../utils/db";
import { DataTypes } from "sequelize";

const Templates = sequelize.define("templates", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Templates;

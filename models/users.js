import bcrypt from "bcrypt";
import { DataTypes } from "sequelize";
import sequelize from "../utils/db";

const Users = sequelize.define("users", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mobile: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    set(value) {
      const salt = bcrypt.genSaltSync(12);
      const hash = bcrypt.hashSync(value, salt);
      this.setDataValue("password", hash);
    },
    allowNull: false,
  },
  role: {
    type: DataTypes.INTEGER,
    references: {
      model: "roles",
      key: "id",
    },
  },
});

export default Users;

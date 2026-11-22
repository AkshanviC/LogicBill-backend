import sequelize from "../utils/db.js";
import { DataTypes } from "sequelize";
import Drivers from "./drivers.js";

/**
 * Join table: a driver can work for many transport firms,
 * and a transport firm can have many drivers.
 */
const DriverTransportFirms = sequelize.define(
  "driverTransportFirms",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "driverId",
      references: {
        model: "drivers",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    transportFirmId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "transportFirmId",
      references: {
        model: "transportfirm",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "driver_transport_firms",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["driverId", "transportFirmId"],
      },
    ],
  },
);

// Lets us include a driver's firm links in a single query
Drivers.hasMany(DriverTransportFirms, {
  as: "driverFirms",
  foreignKey: "driverId",
});
DriverTransportFirms.belongsTo(Drivers, {
  foreignKey: "driverId",
});

export default DriverTransportFirms;

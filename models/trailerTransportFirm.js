import sequelize from "../utils/db.js";
import { DataTypes } from "sequelize";
import Trailers from "./trailers.js";

/**
 * Join table: a trailer can belong to many transport firms,
 * and a transport firm can have many trailers.
 */
const TrailerTransportFirms = sequelize.define(
  "trailerTransportFirms",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    trailerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "trailerId",
      references: {
        model: "trailers",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    // NOTE: the type must match transportfirm.id (INTEGER assumed here)
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
    tableName: "trailer_transport_firms",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["trailerId", "transportFirmId"],
      },
    ],
  },
);

// Lets us include a trailer's firm links in a single query
Trailers.hasMany(TrailerTransportFirms, {
  as: "trailerFirms",
  foreignKey: "trailerId",
});
TrailerTransportFirms.belongsTo(Trailers, {
  foreignKey: "trailerId",
});

export default TrailerTransportFirms;

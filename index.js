import "./utils/env.js";
import expess from "express";
import bodyParser from "body-parser";

import sequelize from "./utils/db.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import trailerRoutes from "./routes/trailerRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";

import cors from "cors";

const app = expess();
app.use(bodyParser.json());
app.use(cors({ origin: process.env.FRONTEND }));

try {
  await sequelize.authenticate();
  console.log("connection with database has been established successfully");
  sequelize.sync().then(() => console.log("synced with tables"));
} catch (error) {
  console.log("unable to connect. error details:", error);
}

app.use("/api/invoices", invoiceRoutes);
app.use("/api/trailers", trailerRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/clients", clientRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server Running on the port: ${process.env.PORT || 5000}`);
});

import expess from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import sequelize from "./utils/db";

dotenv.config();

const app = expess();
app.use(bodyParser.json());
app.use(cors({ origin: process.env.FRONTEND }));

try {
  sequelize.authenticate();
  console.log("connection with database has been established successfully");
  sequelize.sync().then(() => console.log("synced with tables"));
} catch (error) {
  console.log("unable to connect. error details:", error);
}

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server Running on the port: ${process.env.PORT || 5000}`);
});

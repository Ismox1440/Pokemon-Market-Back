import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
mongoose.connect(process.env.DATABASE_URL ?? "");

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

// Routes
app.use("/", routes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
mongoose.connect(process.env.DATABASE_URL ?? "");

const PORT = process.env.PORT || 5000;



// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));

// Routes
app.use("/", routes);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
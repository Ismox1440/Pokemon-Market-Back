import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes";
import mongoose from "mongoose";

const app = express();
mongoose.connect(process.env.DATABASE_URL ?? "");

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

// Routes
app.use("/", routes);

export default app

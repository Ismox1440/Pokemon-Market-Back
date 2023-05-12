import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { Pokemon } from "./models/pokemon";
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

app.get('/find/:_id', async (req, res) => {
    try {
        const {_id} = req.params;
        const pokemon = await Pokemon.findOne({_id}).populate("varieties").populate("evolvesTo");
        return res.send({pokemon})
    } catch (error) {
        return res.send({error})
    }
})
app.get('/findname/:_id', async (req, res) => {
    try {
        const {_id} = req.params;
        const pokemon = await Pokemon.findOne({name: _id}).populate("varieties").populate("evolvesTo").populate('evolvesFrom');
        return res.send({pokemon})
    } catch (error) {
        return res.send({error})
    }
})
app.get('/cantidad', async (req, res) => {
    try {
        const pokemon = await Pokemon.find().countDocuments();
        return res.send({pokemon})
    } catch (error) {
        return res.send({error})
    }
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

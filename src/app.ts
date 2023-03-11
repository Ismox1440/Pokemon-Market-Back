import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import routes from './routes';
import * as dotenv from 'dotenv';
dotenv.config()

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());    
app.use(bodyParser.json());

// Routes
app.use('/', routes);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});



import { Router } from "express";
import { createPokeball } from "../controllers/pokeball.controller";
import { jwtCheck } from "../middleware/jwtCheck";

const router = Router();

router.post("/create", jwtCheck, createPokeball);

export default router;

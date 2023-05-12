import { Router } from "express";
import { createPokeball } from "../controllers/pokeball.controler";

const router = Router()

router.post('/create', createPokeball)

export default router;
import { Router } from "express";
import { createItem, getShop } from "../controllers/items.controller";
import { jwtCheck } from "../middleware/jwtCheck";

const router = Router();

router.post("/create", jwtCheck, createItem);
router.get("/shop",jwtCheck,  getShop);

export default router;

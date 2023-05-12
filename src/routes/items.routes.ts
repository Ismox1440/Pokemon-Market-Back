import { Router } from "express";
import { createItem } from "../controllers/items.controller";

const router = Router()

router.post('/create', createItem)

export default router
import { Router } from "express";
import { createWeek, getWeek } from "../controllers/weekGifts.controller";

const router = Router()

router.post('/create', createWeek)
router.get('/current', getWeek)

export default router
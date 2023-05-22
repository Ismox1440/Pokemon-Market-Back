import { Router } from "express";
import { createWeek, getWeek } from "../controllers/weekGifts.controller";
import { jwtCheck } from "../middleware/jwtCheck";

const router = Router()

router.post('/create', jwtCheck, createWeek)
router.get('/current',jwtCheck,  getWeek)

export default router
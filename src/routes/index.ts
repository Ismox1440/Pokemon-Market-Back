import express, { Request, Response } from "express";
import pokemonRoute from "./pokemon";
import userRoute from "./user.routes";
import pokeballRoute from "./pokeball.routes";
import itemRoutes from './items.routes'
import weekGiftsRoute from './weekgifts.routes'

const router = express.Router();
router.get("/hello", (req: Request, res: Response) => {
  res.json({ hello: "hello world" });
});

router.use("/pokemon", pokemonRoute);
router.use("/user", userRoute);
router.use("/pokeball", pokeballRoute);
router.use('/item', itemRoutes)
router.use('/weekgifts', weekGiftsRoute)

export default router;

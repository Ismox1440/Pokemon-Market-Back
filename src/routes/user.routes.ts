import { Router } from "express";
import { jwtCheck } from "../middleware/jwtCheck";
import {
  buyItem,
  buyPokemon,
  claimDailyGift,
  getOrCreateUser,
  getPokemons,
  getTopUser,
  getUserById,
  sellPokemon,
  updateUser,
  useItem,
  usePokeball,
} from "../controllers/user.controller";

const router = Router();

router.get("/getuser/:email", jwtCheck, getOrCreateUser);
router.put("/usepokeball", jwtCheck, usePokeball);
router.get("/pokemons/:ownerEmail", jwtCheck, getPokemons);
router.put("/sellpokemon", jwtCheck, sellPokemon);
router.put("/buypokemon", jwtCheck, buyPokemon);
router.put("/buyitem", jwtCheck, buyItem);
router.put("/useitem", jwtCheck, useItem);
router.put("/claimdailygift", jwtCheck, claimDailyGift);
router.get("/id/:id", jwtCheck, getUserById);
router.patch("/update", jwtCheck, updateUser);
router.get("/top", jwtCheck, getTopUser);

export default router;

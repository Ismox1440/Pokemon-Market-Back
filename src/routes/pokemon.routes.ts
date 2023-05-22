import express from "express";
import {
  claimLovePotion,
  getPokemonById,
  getPokemons,
  lastedPokemonsForSale,
} from "../controllers/pokemon.controller";
import { jwtCheck } from "../middleware/jwtCheck";

const router = express.Router();

router.get("/", getPokemons);
router.get("/id/:id", jwtCheck, getPokemonById);
router.put("/:id/claim-lovepotion", jwtCheck, claimLovePotion);
router.get("/lastedpokemonsforsale", jwtCheck, lastedPokemonsForSale);

export default router;

import { Router } from "express";
import { jwtCheck } from "../middleware/jwtCheck";
import { addPokeball, buyPokemon, claimDailyGift, getOrCreateUser, getPokemons, useItem, usePokeball } from "../controllers/user.controller";
import { sellPokemon } from "../controllers/pokemon.controler";

const router = Router();

router.post("/login", jwtCheck, getOrCreateUser);
router.post('/addpokeball', jwtCheck, addPokeball)
router.post('/usepokeball', usePokeball)
router.get('/pokemons/:ownerEmail', getPokemons)
router.post('/sellpokemon', sellPokemon)
router.post('/buypokemon', buyPokemon)
router.post('/useitem', useItem)
router.post('/claimdailygift', claimDailyGift)

export default router;
    
import mongoose, { Document, Schema } from "mongoose";
import { Pokemon } from "./pokemon";
import { User } from "./user";

export interface IPokeball extends Document{
  name: string;
  image: string;
  catchRate: number;
  description: string;
  use(user_id: string):  Promise<void>;
  price:  number;
}

function getRarity(catchRate: number) {
  const randomNumber = Math.floor(Math.random() * 1000);
  if (randomNumber <= catchRate) {
    return "Mythical";
  } else if (randomNumber < catchRate * 3) {
    return "Legendary";
  } else {
    return "Common";
  }
}

function getShiny () {
  const randomNumber = Math.floor(Math.random() * 1000);
  if(randomNumber === 1) {
    return true
  }
  return false
}

const getLegendaryPokemon = async function (user_id: string) {
  const pokemon = await Pokemon.aggregate([
    { $match: { isLegendary: true, default: true } },
    { $sample: { size: 1 } },
  ]);

  const now = new Date()

  const newPokemon = await Pokemon.create({
    ...pokemon[0],
    pokeApiId: null,
    id: null,
    owner: user_id,
    _id: undefined,
    createdDate: undefined,
    isShinny: getShiny(),
    baseStats: pokemon[0].stats,
    default: false,
    lastLovePotion: now
  });
  if (!newPokemon) throw new Error("Error creating pokemon");
  await User.updateOne(
    { _id: user_id },
    { $push: { pokemons: newPokemon._id } }
  );

  return newPokemon;
};
const getMythicalPokemon = async (user_id: string) => {
  const pokemon = await Pokemon.aggregate([
    { $match: { isMythical: true, default: true  } },
    { $sample: { size: 1 } },
  ]);
  const now = new Date()
  const newPokemon = await Pokemon.create({
    ...pokemon[0],
    pokeApiId: null,
    id: null,
    owner: user_id,
    _id: undefined,
    createdDate: undefined,
    isShinny: getShiny(),
    baseStats: pokemon[0].stats,
    default: false,
    lastLovePotion: now
  });
  if (!newPokemon) throw new Error("Error creating pokemon");
  await User.updateOne(
    { _id: user_id },
    { $push: { pokemons: newPokemon._id } }
  );
  return newPokemon;
};
const getCommonPokemon = async (user_id: string) => {
  const pokemon = await Pokemon.aggregate([
    { $match: { isMythical: false, isLegendary: false, default: true } },
    { $sample: { size: 1 } },
  ]);
  const now = new Date()
  const newPokemon = await Pokemon.create({
    ...pokemon[0],
    pokeApiId: null,
    id: null,
    owner: user_id,
    _id: undefined,
    createdDate: undefined,
    isShinny: getShiny(),
    baseStats: pokemon[0].stats,
    default: false,
    lastLovePotion: now
  });
  if (!newPokemon) throw new Error("Error creating pokemon");
  await User.updateOne(
    { _id: user_id },
    { $push: { pokemons: newPokemon._id } }
  );
  return newPokemon;
};

const PokeballSchema: Schema<IPokeball> = new mongoose.Schema({
  name: { type: String, required: true },
  image: {
    type: String,
    required: true,
  },
  catchRate: { type: Number, required: true },
  description: {
    type: String,
    required: true,
  },
  price: {type: Number, required: true}
});

PokeballSchema.methods.use = async function (user_id: string) {
  try {
    const user = await User.findById(user_id);
    if (!user) throw new Error("User not found");
    const rarity = getRarity(this.catchRate);
    if (rarity === "Legendary") return getLegendaryPokemon(user_id);
    if (rarity === "Mythical") return getMythicalPokemon(user_id);
    return getCommonPokemon(user_id);
  } catch (error) {
    return error;
  }
};

export default mongoose.model("Pokeball", PokeballSchema);

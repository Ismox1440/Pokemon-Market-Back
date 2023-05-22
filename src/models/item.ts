import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { IStats, Pokemon, growthRateTable } from "./pokemon";

export interface Item extends Document {
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  use(pokemonId: string, count?: number): Promise<any>;
}

const itemSchema: Schema<Item> = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
});

const useLovePotion = async function (pokemonId: string, count: number) {
  try {
    const pokemon = await Pokemon.findById(pokemonId);
    if (!pokemon) throw new Error("Pokemon not found");
    const expToNextLevel = pokemon.growthRate.levels[pokemon.level].experience;
    if (!expToNextLevel) throw new Error("Pokemon are in max level");
    const newExp = pokemon.exp + 50 * count;
    if (newExp >= expToNextLevel) {
      const growthRateValue =
        growthRateTable[
          pokemon.growthRate.name as keyof typeof growthRateTable
        ];
      pokemon.level = pokemon.growthRate.levels
        .filter((e) => e.experience <= newExp)
        .slice(-1)[0].level;
      let newStats = pokemon.stats;
      const modificador = pokemon.isMythical ? 5 : pokemon.isLegendary ? 2 : 1
      Object.keys(pokemon.stats).forEach((stat) => {
        const baseStat = pokemon.stats[stat as keyof IStats];
        const newStat = Math.floor(
          (((2 * baseStat + 31 + 252 / 4) * pokemon.level) / 100 + 5) * modificador
        ) + pokemon.baseStats[stat as keyof IStats];
        newStats[stat as keyof IStats] = newStat;
      });
      pokemon.stats = newStats;
    }
    pokemon.exp = newExp;
    return await pokemon.save();
  } catch (error) {
    return error;
  }
};

itemSchema.methods.use = async function (pokemonId: string, count: number = 1) {
  if (this.name === "Love Potion") return await useLovePotion(pokemonId, count);
  return;
};

export const Item = mongoose.model("Item", itemSchema);

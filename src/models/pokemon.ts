import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { User } from "./user";

export interface IPokemon extends Document{
  claimLovePotion(): Promise<number>;
  p2pSell(price: number): Promise<number>;
  directSell(): Promise<number>;
  growthRate: {
    formula: string;
    name: string;
    id: string;
    levels: { experience: number; level: number }[];
  };
  owner?: ObjectId;
  name: string;
  createdDate: Date;
  height: number;
  weight: number;
  images: { default: string; shiny: string };
  types: { name: string; url: string }[];
  baseExperience: number;
  species: string;
  abilities: { name: string; url: string }[];
  stats: IStats
  isTraining?: { training: boolean; trainingStartDate: Date };
  moves: { name: string; url: string }[];
  onSale?: boolean;
  pokeApiId?: number;
  price?: number | boolean | undefined | null;
  evolvesTo: ObjectId[];
  varieties: ObjectId[];
  evolvesFrom: ObjectId;
  description: string;
  generation: ObjectId;
  isLegendary: boolean;
  isMythical: boolean;
  captureRate: number;
  level: number;
  exp: number;
  shape: { name: string; url: string };
  color: { name: string; url: string };
  eggGroups: { name: string; url: string }[];
  minLevelToEvolve?: number;
  isEgg: boolean;
  isShiny: boolean;
  lastLovePotion: Date;
}

export interface IStats {
  hp: number,
  attack: number,
  defense: number,
  specialAttack: number,
  specialDefense: number,
  speed: number,
}


const pokemonSchema: Schema<IPokemon>= new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  images: { default: { type: String }, shiny: { type: String } },
  types: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
  lastLovePotion: {
    type: Date,
    default: Date.now,
  },
  baseExperience: { type: Number },
  species: { type: String, required: true },
  abilities: [
    {
      name: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  stats: {
    hp: { type: Number, required: true },
    attack: { type: Number, required: true },
    defense: { type: Number, required: true },
    specialAttack: { type: Number, required: true },
    specialDefense: { type: Number, required: true },
    speed: { type: Number, required: true },
  },
  isTraining: {
    training: { type: Boolean, default: false },
    trainingStartDate: { type: Date },
  },
  moves: [
    {
      name: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  onSale: { type: Boolean, default: false },
  id: { type: Number },
  pokeApiId: { type: Number },
  price: { type: Number },
  evolvesTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pokemon" }],
  varieties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pokemon",
    },
  ],
  evolvesFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Pokemon" },
  captureRate: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  isLegendary: { type: Boolean, default: false },
  isMythical: { type: Boolean, default: false },
  shape: { name: { type: String }, url: { type: String } },
  color: { name: { type: String }, url: { type: String } },
  eggGroups: [{ type: String }],
  minLevelToEvolve: { type: Number },
  growthRate: {
    formula: { type: String },
    name: { type: String },
    id: { type: String },
    levels: {
      type: [{ experience: { type: Number }, level: { type: Number } }],
    },
  },
  generation: { type: String },
  isShiny: { type: Boolean, default: false },
  isEgg: { type: Boolean, default: false },
});

pokemonSchema.methods.uploadExp = function (exp: number) {
  let expActual = this.exp;
  const nivelActual = this.level;
  const expNecesaria = nivelActual * 10;
  expActual += exp;
  if (expActual > expNecesaria) expActual = expNecesaria;
  this.exp = expActual;
  this.save();
};

pokemonSchema.methods.directSell = async function () {
  this.onSale = true;
  this.owner = null;
  let newPrice = 0;
  const { hp, attack, defense, specialAttack, specialDefense, speed } =
    this.stats;
  newPrice =
    newPrice + hp + attack + defense + specialAttack + specialDefense + speed;
  if (this.isLegendary) newPrice = newPrice * 25;
  else if (this.isMythical) newPrice = newPrice * 50;
  else newPrice = newPrice * 10;
  this.price = Math.floor(newPrice * 2);
  await this.save();
  return Math.floor(newPrice);
};

pokemonSchema.methods.p2pSell = async function (price: string) {
  this.onSale = true;
  this.price = price;
  await this.save();
  return price;
};

pokemonSchema.methods.claimLovePotion = async function () {
  const {hp, attack, defense, speed} = this.stats
  const now = new Date();
  const lastClaim = new Date(this.lastLovePotion);
  const timeDiff = now.getTime() - lastClaim.getTime();
  const hoursDiff = timeDiff / 1000 / 60 / 60; // Convertir milisegundos a horas
  const statsValue = attack + hp + defense + speed + this.level; // Sumar las estadísticas de ataque, defensa, velocidad y nivel
  const rarityMultiplier =
    (this.isLegendary ? 5 : 1) * (this.isMythical ? 10 : 1); // Multiplicar por la rareza
  const potionsToGive = Math.floor(
    hoursDiff * (statsValue / 10) * rarityMultiplier
  ); // Multiplicar el tiempo por el valor de las estadísticas y la rareza, y redondear hacia abajo
  console.log(potionsToGive, 'potions')
  if (potionsToGive > 0) {
    this.lastLovePotion = now;
    this.save();
    return potionsToGive;
  }
  return 0;
};

export const growthRateTable = {
  slow: 2,
  medium: 1.9,
  fast: 1.7,
  "medium-slow": 1.5,
  "slow-then-very-fast": 1.4,
  "fast-then-very-slow":  1.3,
}

export const Pokemon = mongoose.model("Pokemon", pokemonSchema);

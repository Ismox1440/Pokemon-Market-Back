import { Request, Response } from "express";
import { Pokemon } from "../models/pokemon";
import { User } from "../models/user";
import { Item } from "../models/item";

export const getPokemons = async (req: Request, res: Response) => {
  try {
    const {
      generation,
      name,
      eggGroups,
      isShiny,
      defaultPokemon,
      isEgg,
      moves,
      growthRate,
      abilities,
      type,
      sort,
      limit,
      page,
      order,
      shape,
      color,
      rarity,
      owner,
      onSale,
    } = req.query;

    const filters = {
      generation,
      onSale,
      name,
      isLegendary: rarity
        ? rarity === "legendary"
          ? "true"
          : "false"
        : undefined,
      isMythical: rarity
        ? rarity === "mythical"
          ? "true"
          : "false"
        : undefined,
      eggGroups,
      isShiny,
      isEgg,
      moves: moves ? { $in: moves } : undefined,
      growthRate,
      abilities: abilities ? { $in: abilities } : undefined,
      ["types.name"]: type,
      shape,
      color,
      owner,
      defaultPokemon,
    };

    const filter: { [key: string]: any } = {};
    for (let [key, value] of Object.entries(filters)) {
      if (key === "defaultPokemon") key = "default";
      if (value) {
        if (value === "true") filter[key] = true;
        if (value === "false") filter[key] = false;
        else filter[key] = value;
      }
    }
    //order
    const sortField = sort
      ? typeof sort === "string"
        ? sort
        : "createdDate"
      : "createdDate";
    const sortOrder = order === "asc" ? order : "desc";

    //pagination
    let pages;
    let limitResults;
    if (limit) {
      if (Number(limit)) {
        limitResults = Number(limit);
      } else limitResults = 10;
    } else limitResults = 10;
    if (page) {
      if (Number(page)) {
        pages = Number(page);
      } else pages = 1;
    } else pages = 1;
    const skip = (pages - 1) * limitResults;

    const count = await Pokemon.countDocuments(filter);
    const info = {
      pages: Math.ceil(count / limitResults),
      count,
    };

    const results = await Pokemon.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitResults);

    res.status(200).json({ info, results });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const getPokemonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pokemon = await Pokemon.findById(id)
      .populate("evolvesTo")
      .populate("evolvesFrom")
      .populate("varieties")
      .populate("owner");
    if (!pokemon) return res.status(404).json({ message: "Pokemon not found" });
    res.status(200).json(pokemon);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const claimLovePotion = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  const { id } = req.params;
  try {
    const user = await User.findById(user_id);
    const pokemon = await Pokemon.findById(id);
    const lovePotion = await Item.findById("645a75ef0828b5780374d5a1");
    if (!user || !pokemon || !lovePotion)
      return res
        .status(404)
        .json({ message: "User, lovePotion or Pokemon not found" });
    const lovePotions = await pokemon.claimLovePotion();
    const userLovePotions = user.items.find((item) =>
      item.item.equals(lovePotion._id)
    );
    if (lovePotions < 1)
      return res.status(400).json({ message: "You don't have love potions" });
    if (!userLovePotions) {
      user.items.push({ item: lovePotion._id, count: lovePotions });
    } else userLovePotions.count += lovePotions;
    await user.save();
    return res
      .status(200)
      .json({ message: "Love potions claimed", lovePotions });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

export const lastedPokemonsForSale = async (req: Request, res: Response) => {
  try {
    const pokemons = await Pokemon.find({ onSale: true })
      .sort({ onSaleDate: -1 })
      .limit(10);

    if (!pokemons)
      return res.status(404).send({ mesagge: "Pokemons not found" });
    return res.status(200).json(pokemons);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

import { Request, Response } from "express";
import { User } from "../models/user";
import pokeballs from "../models/pokeballs";
import { Pokemon } from "../models/pokemon";
import { Item } from "../models/item";

const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getOrCreateUser = async (req: Request, res: Response) => {
  const {email} = req.params
  const { name, image } = req.query;
  try {
    let user = await User.findOne({ email })
      .populate("pokemons")
      .populate("pokeballs.pokeball")
      .populate("items.item");
    if (!user) {
      if (!name || !email)
        return res.status(400).json({ message: "Missing name or email" });
      user = await User.create({
        username: name,
        email,
        image,
        pokeballs: [{ count: 5, pokeball: "64553b73639c158531fdc3d2" }],
      });
      console.log("userCreado", user);
      if (!user) throw new Error("Error creating user");
      return res.status(200).json(user);
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: error });
  }
};

export const addPokeball = async (req: Request, res: Response) => {
  const { pokeball_id } = req.body;
  try {
    const user = await User.findById(req.params._id);
    const pokeball = await pokeballs.findById(pokeball_id);
    if (!user || !pokeball)
      return res.send({ error: "User or pokeball not found" });

    const existingPokeball = user.pokeballs.find((p) =>
      p.pokeball.equals(pokeball._id)
    );
    console.log(existingPokeball, user.pokeballs);
    if (existingPokeball) existingPokeball.count++;
    else user.pokeballs.push({ pokeball: pokeball_id, count: 1 });
    await user.save();
    return res.send({ message: "Pokeball added to user" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
};

export const usePokeball = async (req: Request, res: Response) => {
  const { user_id, pokeball_id } = req.body;
  try {
    const user = await User.findById(user_id);
    const pokeball = await pokeballs.findById(pokeball_id);
    if (!user || !pokeball) {
      return res.status(404).send({ error: "User or pokeball not found" });
    }
    const existingPokeball = user.pokeballs.find((p) =>
      p.pokeball.equals(pokeball._id)
    );
    if (!existingPokeball || existingPokeball?.count === 0)
      return res.send({ error: "Pokeball is empty" });
    const newPokemon = await pokeball.use(user_id);
    existingPokeball.count--;
    await user.save();
    return res.send({ message: "Pokeball used", pokemon: newPokemon });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const getPokemons = async (req: Request, res: Response) => {
  const { ownerEmail } = req.params;
  try {
    const user = await User.findOne({ email: ownerEmail });
    if (!user) return res.status(404).json({ message: "User not found" });
    const pokemons = await Pokemon.find({ owner: user._id });
    if (!pokemons)
      return res.status(404).json({ message: "Pokemons not found" });
    return res.status(200).json(pokemons);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const buyPokemon = async (req: Request, res: Response) => {
  const { pokemon_id, user_id } = req.body;
  try {
    const user = await User.findById(user_id);
    const pokemon = await Pokemon.findById(pokemon_id);
    if (!user || !pokemon)
      return res.status(404).json({ message: "User or Pokemon not found" });
    if (pokemon.owner?.toString() === user_id)
      return res.status(400).json({ message: "Pokemon already owned" });
    if (!pokemon.onSale)
      return res.status(400).json({ message: "Pokemon not already on sale" });
    if (!pokemon.price || typeof pokemon.price !== "number")
      return res.status(400).json({ message: "Pokemon not for sale" });
    if (pokemon.price > user.coins)
      return res.status(400).json({ message: "Not enough pokecoins" });
    user.coins -= pokemon.price;
    pokemon.owner = user_id;
    pokemon.onSale = false;
    user.pokemons.push(pokemon_id);
    await user.save();
    await pokemon.save();
    return res.status(200).json({ message: "Pokemon bought", pokemon, user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

export const useItem = async (req: Request, res: Response) => {
  let { user_id, pokemon_id, item_id, count } = req.body;
  count = count || 1;
  try {
    const user = await User.findById(user_id);
    const pokemon = await Pokemon.findById(pokemon_id);
    const item = await Item.findById(item_id);
    if (!user || !pokemon || !item)
      return res
        .status(404)
        .json({ message: "User, Pokemon or Item not found" });
    const userItem = user.items.find((i) => i.item.equals(item._id));
    if (!userItem || userItem.count === 0)
      return res.status(400).json({ message: "Item is empty" });
    if (userItem.count < count)
      return res.status(400).json({ message: "Not enough items" });
    await item.use(pokemon_id, count);
    userItem.count -= count;
    await user.save();
    return res.status(200).json({ message: "Item used", user, pokemon, item });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

export const claimDailyGift = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  try {
    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.claimDailyGift();
    console.log("llegue");
    return res.status(200).json({ message: "Daily gift claimed", user });
  } catch (error) {
    const errorMessage =
      (error as Error).message || "Error claiming daily gift";
    return res.status(500).json({ message: errorMessage });
  }
};

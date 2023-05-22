import { Request, Response } from "express";
import { User } from "../models/user";
import pokeballs, { IPokeball } from "../models/pokeballs";
import { Pokemon } from "../models/pokemon";
import { Item } from "../models/item";

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findById(req.params.id)
      .populate("items.item")
      .populate("pokeballs.pokeball");
    if (!user) return res.status(404).json({ message: "User not found" });
    const userBestPokemons = await Pokemon.find({
      owner: id,
    })
      .sort({ stats: -1 })
      .limit(10);
    const userPokemonsInfo = {
      legendary: await Pokemon.find({
        owner: req.params.id,
        isLegendary: true,
      }).count(),
      mythical: await Pokemon.find({
        owner: req.params.id,
        isMythical: true,
      }).count(),
      common: await Pokemon.find({
        owner: req.params.id,
        isLegendary: false,
        isMythical: false,
      }).count(),
    };

    return res.status(200).json({
      user,
      bestPokemons: userBestPokemons,
      userPokemonsInfo,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: error });
  }
};

export const getOrCreateUser = async (req: Request, res: Response) => {
  const { email } = req.params;
  try {
    let user = await User.findOne({ email })
      .populate("pokeballs.pokeball")
      .populate("items.item");
    if (!user) {
      if (!email) return res.status(400).json({ message: "Missing email" });
      const lastGiftDate = new Date();
      lastGiftDate.setDate(lastGiftDate.getDate() - 1);
      const pokeball = await pokeballs.findById("64553b73639c158531fdc3d2");
      user = await User.create({
        username: email.split("@")[0],
        email,
        pokeballs: [{ count: 5, pokeball }],
        lastGiftDate,
      });
      if (!user) throw new Error("Error creating user");
      return res.status(200).json(user);
    }
    const userPokemon = await Pokemon.find({ owner: user._id })
      .sort({ createdDate: -1 })
      .limit(2);
    const newUserPokemonsArray = user.pokemons.slice(0, -2).concat(userPokemon);
    const newUser = { ...user.toObject(), pokemons: newUserPokemonsArray };
    return res.status(200).json(newUser);
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
    console.log(error);
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
    const pokemonOwner = await User.findById(pokemon.owner);
    if (pokemonOwner) {
      pokemonOwner.coins += pokemon.price;
      pokemonOwner.pokemons = pokemonOwner.pokemons.filter(
        (p) => !p.equals(pokemon._id)
      );
      await pokemonOwner.save();
    }
    user.coins -= pokemon.price;
    pokemon.owner = user_id;
    pokemon.onSale = false;
    user.pokemons.push(pokemon_id);
    await pokemon.save();
    await user.save();
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
    const user = await User.findById(user_id)
      .populate("pokeballs.pokeball")
      .populate("items.item");
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.claimDailyGift();
    return res.status(200).json({ message: "Daily gift claimed", user });
  } catch (error) {
    console.log(error);
    const errorMessage =
      (error as Error).message || "Error claiming daily gift";
    return res.status(500).json({ message: errorMessage });
  }
};

export const buyItem = async (req: Request, res: Response) => {
  const { user_id, item_id, itemType, count } = req.body;
  console.log(user_id, itemType, item_id, count);
  try {
    if (itemType !== "pokeball" && itemType !== "item")
      return res.status(400).json({ message: "Invalid item type" });
    const user = await User.findById({ _id: user_id });
    let item: Item | IPokeball | null;
    if (itemType === "pokeball")
      item = await pokeballs.findById({ _id: item_id });
    else item = await Item.findById({ _id: item_id });
    if (!user || !item)
      return res.status(404).json({ message: "User or Item not found" });
    if (item.price * count > user.coins)
      return res.status(400).json({ message: "Not enough pokecoins" });
    user.coins -= item.price * count;
    if (itemType === "pokeball") {
      const userPokeball = user.pokeballs.find((p) =>
        p.pokeball.equals(item_id)
      );
      if (userPokeball) userPokeball.count += count;
      else user.pokeballs.push({ pokeball: item._id, count });
      await user.save();
      return res.status(200).json({ message: "Pokeball bought", user });
    }
    const userItem = user.items.find((i) => i.item.equals(item_id));
    if (userItem) userItem.count += count;
    else user.items.push({ item: item._id, count });
    await user.save();
    return res.status(200).json({ message: "Item bought", user, item });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

export const sellPokemon = async (req: Request, res: Response) => {
  const { user_id, pokemon_id, price, typeSale } = req.body;
  try {
    const user = await User.findById(user_id);
    const pokemon = await Pokemon.findById(pokemon_id);
    if (!user || !pokemon)
      return res.status(404).json({ message: "User or Pokemon not found" });
    if (user_id !== pokemon?.owner?.toString()) {
      return res.status(400).json({ message: "You can't sell this pokemon" });
    }

    if (typeSale === "direct") {
      user.coins += await pokemon.directSell();
      user.pokemons = user.pokemons.filter((p) => !p.equals(pokemon._id));
      await user.save();
      return res.status(200).json({ message: "Pokemon sold", pokemon });
    }
    if (!price) return res.status(400).json({ message: "Price not found" });
    if (typeSale === "p2p") {
      await pokemon.p2pSell(price);
      await user.save();
      return res
        .status(200)
        .send({ message: "Pokemon put up for sale", pokemon });
    }
    return res.status(400).json({ message: "Type sale or price not found" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { user_id, username, description, image } = req.body;
  try {
    const currentUser = await User.findById(user_id);
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });
    const newUser = await User.findByIdAndUpdate(user_id, {
      username,
      description,
      image,
    });
    return res.status(200).json({ message: "User updated", newUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

export const getTopUser = async (req: Request, res: Response) => {
  try {
    const topCoins = await User.find({}).sort({ coins: -1 }).limit(10);
    const topStats = await User.aggregate([
      { $unwind: "$pokemons" },
      {
        $lookup: {
          from: "pokemons",
          localField: "pokemons",
          foreignField: "_id",
          as: "pokemon",
        },
      },
      { $unwind: "$pokemon" },
      {
        $group: {
          _id: "$_id",
          totalStats: {
            $sum: {
              $add: [
                "$pokemon.stats.hp",
                "$pokemon.stats.attack",
                "$pokemon.stats.defense",
                "$pokemon.stats.specialAttack",
                "$pokemon.stats.specialDefense",
                "$pokemon.stats.speed",
              ],
            },
          },
          user: { $first: "$$ROOT" },
        },
      },
      { $sort: { totalStats: -1 } },
      { $limit: 10 },
    ]);
    if (!topCoins || !topStats)
      return res.status(404).json({ message: "Users not found" });
    return res.status(200).send({ topCoins, topStats });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

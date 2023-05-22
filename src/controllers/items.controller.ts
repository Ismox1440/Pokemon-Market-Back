import { Request, Response } from "express";
import { Item } from "../models/item";
import pokeballs from "../models/pokeballs";

export const createItem = async (req: Request, res: Response) => {
  const { name, description, image, price } = req.body;
  if (!name || !description || !image || !price) {
    return res.status(400).json({ msg: "Please fill all fields" });
  }
  try {
    const newItem = await Item.create(req.body);
    return res.status(201).json(newItem);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: error });
  }
};

export const getShop = async (req: Request, res: Response) => {
  try {
    const items = await Item.find({ price: { $gt: 0 } });
    const pokeballShop = await pokeballs.find({ price: { $gt: 0 } });
    return res.status(200).json({ items, pokeballs: pokeballShop });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: error });
  }
};

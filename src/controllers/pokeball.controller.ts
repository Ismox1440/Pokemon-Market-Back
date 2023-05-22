import { Request, Response } from "express";
import Pokeball from "../models/pokeballs";

export const createPokeball = async (req: Request, res: Response) => {
  const { name, catchRate, image, description } = req.body;
  try {
    if (!name || !catchRate || !image || !description)
      return res.status(400).json({ mensagge: "Missing data" });
    const newPokeball = await Pokeball.create({
      name,
      catchRate,
      image,
      description,
    });
    if (!newPokeball)
      return res.status(400).json({ mensagge: "Error creating pokeball" });
    return res.status(201).json(newPokeball);
  } catch (error) {
    return res.status(500).json(error);
  }
};

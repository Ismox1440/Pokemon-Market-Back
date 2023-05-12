import { Request, Response } from "express";
import {Item} from "../models/item";

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

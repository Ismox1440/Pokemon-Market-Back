import { Response, Request } from "express";
import { WeekGifts } from "../models/weekgifts";

export const createWeek = async (req: Request, res: Response) => {
  const week = req.body;
  try {

    for (let i = 0; i < 7; i++) {
      let day = week.days[i];
      if (!day) {
        return res.status(400).json({ message: `Missing day ${i + 1}` });
      }
      for(let j = 0; j < day.gifts.length; j++) {
        if(day.gifts[j].giftItemRef !== 'Pokeball' && day.gifts[j].giftItemRef !== 'Item') return res.status(400).json({ message: `Missing itemRef in day ${i + 1}` })
      }
    }

    const newWeek = await WeekGifts.create({ days: week.days });
    if (!newWeek)
      return res.status(400).json({ message: "Error creating week" });
    return res.status(201).json({ message: "Week created", week: newWeek });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
};

export const getWeek = async (req: Request, res: Response) => {
  try {
    const week = await WeekGifts.findOne({}).sort({ createdAt: -1 }).populate('days.gifts.giftItem').exec();
    if (!week) return res.status(404).json({ message: "Week not found" });
    return res.status(200).json(week);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
};




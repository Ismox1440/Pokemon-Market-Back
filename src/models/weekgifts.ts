import mongoose, { Schema, Document } from "mongoose";
import { IPokeball } from "./pokeballs";
import { Item } from "./item";

interface IGift {
  count: number;
  giftItem: IPokeball | Item;
  giftItemRef: "Pokeball" | "Item";
}

interface IDay {
  day: number;
  gifts: IGift[];
  coins: number;
}

interface IWeekGifts extends Document {
  days: IDay[];
  createdAt: Date;
}

const weekGiftsSchema: Schema<IWeekGifts> = new Schema({
  days: [
    {
      day: { type: Number, required: true },
      coins: { type: Number, default: 0 },
      gifts: [
        {
          count: { type: Number, default: 1 },
          giftItem: { type: Schema.Types.Mixed, required: true, refPath: "days.gifts.giftItemRef" },
          giftItemRef: { type: String, required: true, enum: ["Pokeball", "Item"] },
        },
      ],
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export const WeekGifts = mongoose.model<IWeekGifts>(
  "WeekGifts",
  weekGiftsSchema
);

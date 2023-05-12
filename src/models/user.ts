import mongoose, { Document, ObjectId } from "mongoose";
import { WeekGifts } from "./weekgifts";
import { IPokemon } from "./pokemon";
import { Item } from "./item";
import { IPokeball } from "./pokeballs";

export interface IUser extends Document {
  username: string;
  email: string;
  pokemons: IPokemon[];
  image: string;
  items: { count: number; item: Item }[];
  pokeballs: { count: number; pokeball: IPokeball }[];
  lastGiftDate?: Date;
  giftIndex?: number;
  coins: number;
  claimDailyGift: () => Promise<void>;
}

const userSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true },
  pokemons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pokemon",
    },
  ],
  image: {
    type: String,
    default: "https://img.freepik.com/free-icon/user_318-804790.jpg",
  },
  items: [
    {
      count: { type: Number, default: 0 },
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
      },
    },
  ],
  pokeballs: [
    {
      count: { type: Number, default: 0 },
      pokeball: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pokeball",
        required: true,
      },
    },
  ],
  lastGiftDate: { type: Date, default: null },
  giftIndex: { type: Number, default: 0 },
  coins: { type: Number, default: 1000 },
});

userSchema.methods.claimDailyGift = async function () {
  try {
    const now = new Date();
    const lastClaim = new Date(this.lastGiftDate);
    const timeDiff = now.getTime() - lastClaim.getTime();
    const hoursDiff = timeDiff / 1000 / 60 / 60;
    const weekGifts = await WeekGifts.findOne({})
      .sort({ createdAt: -1 })
      .populate("days.gifts.giftItem")
      .exec();
    if (!weekGifts) throw new Error("No week found");
    if (hoursDiff >= 24) {
      const dayGift = weekGifts.days[this.giftIndex];
      this.lastGiftDate = now;
      this.giftIndex++;
      this.coins += dayGift.coins;
      dayGift.gifts.forEach((gift) => {
        if (gift.giftItemRef === "Pokeball") {
          const userPokeball = this.pokeballs.find(
            (up: { count: number; pokeball: ObjectId }) =>
              up.pokeball === gift.giftItem._id
          );
          if (userPokeball) userPokeball.count += gift.count;
          else
            this.pokeballs.push({
              count: gift.count,
              pokeball: gift.giftItem._id,
            });
        } else {
          const userItem = this.items.find(
            (ui: { count: number; item: ObjectId }) =>
              ui.item === gift.giftItem._id
          );
          if (userItem) userItem.count += gift.count;
          else this.items.push({ count: gift.count, item: gift.giftItem._id });
        }
      });

      this.save();
      return dayGift;
    }
    throw new Error("Not enough time passed");
  } catch (error) {
    throw error;
  }
};

export const User = mongoose.model("User", userSchema);

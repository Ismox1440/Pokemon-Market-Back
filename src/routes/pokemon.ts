import express, { Request, Response } from "express";
import { Pokemon } from "../models/pokemon";
import { claimLovePotion, getPokemonById, getPokemons } from "../controllers/pokemon.controler";

const router = express.Router();

// const fetcher = (url: string) => fetch(url).then((res) => res.json());

// const pokeApi = "https://pokeapi.co/api/v2/pokemon";

// interface IEvolves_to {
//   species: { url: string };
//   evolves_to: IEvolves_to[];
//   evolution_details?: {
//     min_level: number;
//   };
// }

// interface ChainLink {
//   species: {
//     name: string;
//     url: string;
//   };
//   evolves_to: ChainLink[];
//   evolution_details?: {
//     min_level: number;
//   };
// }

// const updatePokemon = async (pokeApiId: number) => {
//   const pokemon = await Pokemon.findOne({ pokeApiId });
//   if (pokemon) {
//     try {
//       const {
//         generation,
//         growth_rate,
//         egg_groups,
//         color,
//         shape,
//         is_legendary,
//         is_mythical,
//         is_baby,
//         evolves_from_species,
//         capture_rate,
//         evolution_chain,
//         varieties,
//       } = await fetcher(pokemon.species);
//       const { chain } = await fetcher(evolution_chain.url);
//       const { formula, name, id, levels } = await fetcher(growth_rate.url);
//       function findCurrentSpeciesInChain(
//         chain: ChainLink,
//         currentSpecies: string
//       ): ChainLink | null {
//         if (chain.species.url === currentSpecies) {
//           return chain;
//         } else if (chain.evolves_to.length > 0) {
//           for (const link of chain.evolves_to) {
//             const result = findCurrentSpeciesInChain(link, currentSpecies);
//             if (result !== null) {
//               return result;
//             }
//           }
//         }
//         return null;
//       }

//       let evolvesFrom;
//       if (evolves_from_species) {
//         evolvesFrom = await Pokemon.findOne({
//           name: evolves_from_species.name,
//         });
//       }

//       const currentSpecies = findCurrentSpeciesInChain(chain, pokemon.species);
//       const getEvolutions = async () => {
//         if (!currentSpecies) return [];
//         if (currentSpecies.evolves_to.length === 0) return [];
//         const promises = await Promise.all(
//           currentSpecies.evolves_to.map(
//             async (e: { species: { name: string } }) =>
//               await Pokemon.findOne({ name: e.species.name })
//           )
//         );
//         return promises;
//       };

//       const getVarieties = async () => {
//         if (varieties.length < 2) return [];
//         if (varieties < 3)
//           return [await Pokemon.findOne({ name: varieties[1].pokemon.name })];
//         const varietiesNames = varieties
//           .slice(1)
//           .map((v: { pokemon: { name: string } }) => v.pokemon.name);
//         return await Promise.all(
//           varietiesNames.map(
//             async (name: string) => await Pokemon.findOne({ name })
//           )
//         );
//       };
//       const evolvesTo = (await getEvolutions()).map((e) => e?._id);
//       const varietiesP = (await getVarieties()).map((e) => e._id);
//       const growthRate = { formula, name, levels, id };
//       const eggGroups = egg_groups.map((e: any) => e.name);
//       await Pokemon.updateOne(
//         { _id: pokemon._id },
//         {
//           $set: {
//             generation: generation.name,
//             minLevelToEvolve:
//               currentSpecies?.evolves_to[0]?.evolution_details?.min_level,
//             growthRate,
//             eggGroups,
//             color: color.name,
//             shape: shape.name,
//             isLegendary: is_legendary,
//             isMythical: is_mythical,
//             isEgg: is_baby,
//             evolvesTo,
//             varieties: varietiesP,
//             evolvesFrom: evolvesFrom?._id,
//             captureRate: capture_rate,
//             level: 1,
//             exp: 0,
//           },
//         },
//         { new: true }
//       );
//       console.log(`Updated ${pokemon.name} in database`);
//     } catch (error) {
//       console.log({ error });
//     }
//   } else {
//     console.log("No pokemon found");
//   }
// };

// router.post("/updateAll", async (req, res) => {
//   try {
//     const pokemons = await Pokemon.find();
//     await Promise.all(
//       pokemons.map(async (p) => await updatePokemon(p.pokeApiId))
//     );
//     console.log("Updated all pokemons");
//     res.send("Updated all pokemons");
//   } catch (error) {
//     console.log({ error });
//     res.send({ error });
//   }
// });

// const fetchAndSave = async (pokeApiId: number) => {
//   const existing = await Pokemon.findOne({ pokeApiId });
//   if (existing) {
//     try {
//       const { evolution_chain, varieties } = await fetcher(existing.species);
//       const { chain } = await fetcher(evolution_chain.url);
//       const getEvolutions = async () => {
//         if (chain.evolves_to.length < 1) return [];
//         return await Promise.all(
//           chain.evolves_to.map(
//             async (e: { species: { name: string } }) =>
//               await Pokemon.findOne({ name: e.species.name })
//           )
//         );
//       };
//       const getVarieties = async () => {
//         if (varieties.length < 2) return [];
//         if (varieties < 3)
//           return [await Pokemon.findOne({ name: varieties[1].pokemon.name })];
//         const varietiesNames = varieties
//           .slice(1)
//           .map((v: { pokemon: { name: string } }) => v.pokemon.name);
//         return await Promise.all(
//           varietiesNames.map(
//             async (name: string) => await Pokemon.findOne({ name })
//           )
//         );
//       };
//       const evolvesTo = (await getEvolutions()).map((e) => e._id);
//       const varietiesP = (await getVarieties()).map((e) => e._id);
//       await Pokemon.updateOne(
//         { _id: existing._id },
//         { $set: { evolvesTo, varietiesP } },
//         { new: true }
//       );
//       console.log(`Updated ${existing.name} in database`);
//     } catch (error) {
//       console.log({ error });
//     }
//   }
//   try {
//     const pokemon = await fetcher(`${pokeApi}/${pokeApiId}`);
//     const {
//       id,
//       moves,
//       stats,
//       abilities,
//       species,
//       sprites,
//       types,
//       base_experience,
//       name,
//       height,
//       weight,
//     } = pokemon;

//     const images = {
//       default:
//         sprites.other.home.front_default ??
//         sprites.other.dream_world.front_default ??
//         sprites.other["official-artwork"].front_default ??
//         sprites.front_default,
//       shiny:
//         sprites.other.home.front_shiny ??
//         sprites.other.dream_world.front_shiny ??
//         sprites.other["official-artwork"].front_shiny ??
//         sprites.front_shiny,
//     };
//     const pokemonToSave = {
//       name,
//       height,
//       weight,
//       images,
//       types: types.map((t: { type: { url: string } }) => t.type),
//       baseExperience: base_experience,
//       species: species.url,
//       abilities: abilities.map(
//         (a: { ability: { name: string; url: string } }) => a.ability
//       ),
//       stats: {
//         hp: stats[0].base_stat,
//         attack: stats[1].base_stat,
//         defense: stats[2].base_stat,
//         specialAttack: stats[3].base_stat,
//         specialDefense: stats[4].base_stat,
//         speed: stats[5].base_stat,
//       },
//       moves: moves.map((m: { move: { url: string; name: string } }) => m.move),
//       id,
//       pokeApiId: id,
//     };
//     const newPokemon = new Pokemon(pokemonToSave);
//     await newPokemon.save();
//     console.log(`Saved ${newPokemon.name} to database`);
//   } catch (error) {
//     console.log({ error });
//   }
// };

// router.post("/importAll", async (req: Request, res: Response) => {
//   try {
//     const { results } = await fetcher(
//       "https://pokeapi.co/api/v2/pokemon/?offset=0&limit=100000"
//     );
//     const pokemonsUrls = results.map((pokemon: { name: string; url: string }) =>
//       Number(pokemon.url.slice(0, -1).split("/").pop())
//     );
//     await Promise.all(pokemonsUrls.map(fetchAndSave));
//     return res.send({ message: "Pokemons imported" });
//   } catch (error) {
//     console.log({ error });
//     return res.send({ error });
//   }
// });

router.get("/", getPokemons);
router.get("/:id", getPokemonById);
router.post("/:id/claim-lovepotion", claimLovePotion);

export default router;

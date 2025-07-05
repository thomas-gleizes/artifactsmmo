import "dotenv/config";
import { Character, Characters } from "./lib/Character";
import { Maps, POINT_OF_INTEREST } from "./lib/Maps";

async function main() {
  const maps = await Maps.create();

  const kalat = new Character(Characters.KALAT, maps, "cyan");
  const talak = new Character(Characters.TALAK, maps, "magenta");
  const latak = new Character(Characters.LATAK, maps, "green");
  const yep = new Character(Characters.YEP, maps, "yellow");
  const pey = new Character(Characters.PEY, maps, "blue");

  await Promise.all([
    kalat.farm_weapon_crafting(),
    latak.farm_mining(),
    talak.farm_fishing(),
    pey.farm_wood_cutting("spruce"),
    yep.farm_alchemy(),
  ]);
}

main().catch((err) => console.log("error", err));

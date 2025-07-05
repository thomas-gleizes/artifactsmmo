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
    kalat.farm_mob(POINT_OF_INTEREST.YELLOW_SLIME),
    latak.farm_mining(),
    talak.farm_mining(),
    pey.farm_wood_cutting("spruce"),
    yep.farm_sunflower(),
  ]);
}

main().catch((err) => console.log("error", err));

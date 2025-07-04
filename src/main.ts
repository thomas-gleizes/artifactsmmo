import { POINT_OF_INTEREST } from "./constants";
import { Character, Characters } from "./lib/Character";

async function main() {
  const kalat = new Character(Characters.KALAT);
  const talak = new Character(Characters.TALAK);
  const latak = new Character(Characters.LATAK);
  const yep = new Character(Characters.YEP);
  const pey = new Character(Characters.PEY);

  await Promise.all([
    kalat.farm_mob(POINT_OF_INTEREST.monster.green_slime),
    latak.farm_copper(),
    talak.farm_copper(),
    yep.farm_sunflower(),
    pey.farm_wood(),
  ]);
}

main().catch((err) => console.log("error", err));

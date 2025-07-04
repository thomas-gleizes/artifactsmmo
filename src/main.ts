import { Character, Characters } from "./lib/Character";
import { Maps, POINT_OF_INTEREST, WOODS } from "./lib/Maps";

async function main() {
  const maps = await Maps.create();

  const kalat = new Character(Characters.KALAT, maps);
  const talak = new Character(Characters.TALAK, maps);
  const latak = new Character(Characters.LATAK, maps);
  const yep = new Character(Characters.YEP, maps);
  const pey = new Character(Characters.PEY, maps);

  // await kalat.got_to(POINT_OF_INTEREST.BANK);
  // await kalat.withdraw("copper_bar", 10);
  // await kalat.give_item("copper_bar", kalat, 10);
  // await kalat.store("copper_bar", 10);

  await Promise.all([
    kalat.farm_weapon(),
    latak.farm_iron(),
    talak.farm_copper(),
    yep.farm_sunflower(),
    pey.farm_wood(WOODS.spruce_tree),
  ]);
}

main().catch((err) => console.log("error", err));

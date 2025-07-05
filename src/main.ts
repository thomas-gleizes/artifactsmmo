import { Character, Characters } from "./lib/Character";
import { Maps, POINT_OF_INTEREST } from "./lib/Maps";

async function main() {
  const maps = await Maps.create();

  const kalat = new Character(Characters.KALAT, maps);
  const talak = new Character(Characters.TALAK, maps);
  const latak = new Character(Characters.LATAK, maps);
  const yep = new Character(Characters.YEP, maps);
  const pey = new Character(Characters.PEY, maps);

  // latak.got_to(POINT_OF_INTEREST.MINING);

  // await kalat.give_item("iron_bar", kalat, 10);
  // await kalat.give_item("feather", kalat, 10);
  // await kalat.give_item("feather", kalat, 10);

  // await kalat.give_item("apprentice_gloves", yep, 1);

  // await kalat.unequip("weapon");
  // await kalat.equip("iron_sword", "weapon");

  // await kalat.store_all();

  await Promise.all([
    kalat.farm_mob(POINT_OF_INTEREST.YELLOW_SLIME, 1),
    latak.farm_mining(),
    talak.farm_mining(),
    pey.farm_wood_cutting("spruce"),
    yep.farm_sunflower(),
  ]);
}

main().catch((err) => console.log("error", err));

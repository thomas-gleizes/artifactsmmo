import { components } from "../openapi";
import { http_client } from "../http_client";
import { Coordinates } from "../types";

export enum POINT_OF_INTEREST {
  // Ressources naturelles
  SALMON_FISHING_SPOT = "salmon_fishing_spot",
  GOLD_ROCKS = "gold_rocks",
  ASH_TREE = "ash_tree",
  COPPER_ROCKS = "copper_rocks",
  SUNFLOWER_FIELD = "sunflower_field",
  GUDGEON_FISHING_SPOT = "gudgeon_fishing_spot",
  SHRIMP_FISHING_SPOT = "shrimp_fishing_spot",
  BIRCH_TREE = "birch_tree",
  COAL_ROCKS = "coal_rocks",
  SPRUCE_TREE = "spruce_tree",
  DEAD_TREE = "dead_tree",
  IRON_ROCKS = "iron_rocks",
  GLOWSTEM = "glowstem",
  MAPLE_TREE = "maple_tree",
  BASS_FISHING_SPOT = "bass_fishing_spot",
  TROUT_FISHING_SPOT = "trout_fishing_spot",
  MITHRIL_ROCKS = "mithril_rocks",
  NETTLE = "nettle",

  // Monstres
  BANDIT_LIZARD = "bandit_lizard",
  GOBLIN_WOLFRIDER = "goblin_wolfrider",
  ORC = "orc",
  OGRE = "ogre",
  PIG = "pig",
  CYCLOPS = "cyclops",
  BLUE_SLIME = "blue_slime",
  YELLOW_SLIME = "yellow_slime",
  RED_SLIME = "red_slime",
  GREEN_SLIME = "green_slime",
  GOBLIN = "goblin",
  CORRUPTED_OGRE = "corrupted_ogre",
  WOLF = "wolf",
  CHICKEN = "chicken",
  OWLBEAR = "owlbear",
  COW = "cow",
  MUSHMUSH = "mushmush",
  FLYING_SNAKE = "flying_snake",
  SKELETON = "skeleton",
  VAMPIRE = "vampire",
  DEMON = "demon",
  DEATH_KNIGHT = "death_knight",
  LICH = "lich",
  BAT = "bat",
  HIGHWAYMAN = "highwayman",
  CURSED_TREE = "cursed_tree",
  SPIDER = "spider",
  IMP = "imp",
  SHEEP = "sheep",
  HELLHOUND = "hellhound",
  CULTIST_ACOLYTE = "cultist_acolyte",

  // Ateliers
  WOODCUTTING = "woodcutting",
  COOKING = "cooking",
  WEAPONCRAFTING = "weaponcrafting",
  GEARCRAFTING = "gearcrafting",
  JEWELRYCRAFTING = "jewelrycrafting",
  ALCHEMY = "alchemy",
  MINING = "mining",

  // Services
  BANK = "bank",
  GRAND_EXCHANGE = "grand_exchange",

  // PNJ
  TAILOR = "tailor",
  TASKS_TRADER = "tasks_trader",
  CULTIST_WIZARD = "cultist_wizard",
  ARCHAEOLOGIST = "archaeologist",
  RUNE_VENDOR = "rune_vendor",

  // Maître des tâches
  TASKS_MONSTERS = "monsters",
  TASKS_ITEMS = "items",
}

export const WOODS = {
  [POINT_OF_INTEREST.ASH_TREE]: POINT_OF_INTEREST.ASH_TREE,
  [POINT_OF_INTEREST.BIRCH_TREE]: POINT_OF_INTEREST.BIRCH_TREE,
  [POINT_OF_INTEREST.SPRUCE_TREE]: POINT_OF_INTEREST.SPRUCE_TREE,
  [POINT_OF_INTEREST.CURSED_TREE]: POINT_OF_INTEREST.CURSED_TREE,
  [POINT_OF_INTEREST.MAPLE_TREE]: POINT_OF_INTEREST.MAPLE_TREE,
  [POINT_OF_INTEREST.DEAD_TREE]: POINT_OF_INTEREST.DEAD_TREE,
} as const;

export const ROCKS = {
  [POINT_OF_INTEREST.COPPER_ROCKS]: POINT_OF_INTEREST.COPPER_ROCKS,
  [POINT_OF_INTEREST.GOLD_ROCKS]: POINT_OF_INTEREST.GOLD_ROCKS,
  [POINT_OF_INTEREST.MITHRIL_ROCKS]: POINT_OF_INTEREST.MITHRIL_ROCKS,
  [POINT_OF_INTEREST.IRON_ROCKS]: POINT_OF_INTEREST.IRON_ROCKS,
  [POINT_OF_INTEREST.COAL_ROCKS]: POINT_OF_INTEREST.COAL_ROCKS,
} as const;

export const FISHING_SPOTS = {
  [POINT_OF_INTEREST.SALMON_FISHING_SPOT]:
    POINT_OF_INTEREST.SALMON_FISHING_SPOT,
  [POINT_OF_INTEREST.GUDGEON_FISHING_SPOT]:
    POINT_OF_INTEREST.GUDGEON_FISHING_SPOT,
  [POINT_OF_INTEREST.SHRIMP_FISHING_SPOT]:
    POINT_OF_INTEREST.SHRIMP_FISHING_SPOT,
  [POINT_OF_INTEREST.BASS_FISHING_SPOT]: POINT_OF_INTEREST.BASS_FISHING_SPOT,
  [POINT_OF_INTEREST.TROUT_FISHING_SPOT]: POINT_OF_INTEREST.TROUT_FISHING_SPOT,
} as const;

export const WORKSHOP = {
  [POINT_OF_INTEREST.COOKING]: POINT_OF_INTEREST.COOKING,
  [POINT_OF_INTEREST.WEAPONCRAFTING]: POINT_OF_INTEREST.WEAPONCRAFTING,
  [POINT_OF_INTEREST.GEARCRAFTING]: POINT_OF_INTEREST.GEARCRAFTING,
  [POINT_OF_INTEREST.JEWELRYCRAFTING]: POINT_OF_INTEREST.JEWELRYCRAFTING,
  [POINT_OF_INTEREST.ALCHEMY]: POINT_OF_INTEREST.ALCHEMY,
  [POINT_OF_INTEREST.MINING]: POINT_OF_INTEREST.MINING,
} as const;

export const MONSTER = {
  [POINT_OF_INTEREST.BANDIT_LIZARD]: POINT_OF_INTEREST.BANDIT_LIZARD,
  [POINT_OF_INTEREST.GOBLIN_WOLFRIDER]: POINT_OF_INTEREST.GOBLIN_WOLFRIDER,
  [POINT_OF_INTEREST.ORC]: POINT_OF_INTEREST.ORC,
  [POINT_OF_INTEREST.OGRE]: POINT_OF_INTEREST.OGRE,
  [POINT_OF_INTEREST.PIG]: POINT_OF_INTEREST.PIG,
  [POINT_OF_INTEREST.CYCLOPS]: POINT_OF_INTEREST.CYCLOPS,
  [POINT_OF_INTEREST.CHICKEN]: POINT_OF_INTEREST.CHICKEN,
  [POINT_OF_INTEREST.COW]: POINT_OF_INTEREST.COW,
  [POINT_OF_INTEREST.YELLOW_SLIME]: POINT_OF_INTEREST.YELLOW_SLIME,
  [POINT_OF_INTEREST.GREEN_SLIME]: POINT_OF_INTEREST.GREEN_SLIME,
  [POINT_OF_INTEREST.RED_SLIME]: POINT_OF_INTEREST.RED_SLIME,
  [POINT_OF_INTEREST.BLUE_SLIME]: POINT_OF_INTEREST.BLUE_SLIME,
} as const;

export class Maps {
  private cases: components["schemas"]["MapSchema"][] = [];
  private ready: boolean = false;

  private static _instance: Maps | null = null;

  private constructor() {}

  static async create() {
    if (!Maps._instance) {
      Maps._instance = new Maps();
      // await Map._instance.init(); // si init async
    }

    if (!Maps._instance.is_ready()) await Maps._instance.prepare();

    return Maps._instance;
  }

  public async prepare() {
    let page = 1;
    const cases: components["schemas"]["MapSchema"][] = [];

    while (true) {
      const body = await http_client
        .GET("/maps", {
          params: { query: { page: page } },
        })
        .then((resp) => resp.data!);

      if (body.data.length <= 0) {
        this.ready = true;
        break;
      }

      cases.push(...body.data);

      page++;
    }

    this.cases = cases;
  }

  public get_cases() {
    return this.cases;
  }

  public is_ready() {
    return this.ready;
  }

  public get_content_cases(category: POINT_OF_INTEREST) {
    return this.cases.filter(
      (item) => Boolean(item.content) && item.content?.code === category,
    );
  }

  private calculate_distance(
    coord_1: Coordinates,
    coord_2: Coordinates,
  ): number {
    const [x1, y1] = coord_1;
    const [x2, y2] = coord_2;

    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  public async find_nearest(
    source_coordinates: Coordinates,
    category: POINT_OF_INTEREST,
  ): Promise<Coordinates> {
    const destinations = this.get_content_cases(category);

    if (destinations.length === 0) {
      return [0, 0];
    }

    let nearest_destination = destinations[0];
    let shortest_distance = this.calculate_distance(source_coordinates, [
      nearest_destination.x,
      nearest_destination.y,
    ]);

    for (const destination of destinations) {
      const distance = this.calculate_distance(source_coordinates, [
        destination.x,
        destination.y,
      ]);

      if (distance < shortest_distance) {
        shortest_distance = distance;
        nearest_destination = destination;
      }
    }

    return [nearest_destination.x, nearest_destination.y];
  }
}

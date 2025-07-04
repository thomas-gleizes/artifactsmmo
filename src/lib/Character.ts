import { components } from "../openapi";
import { http_client } from "../http_client";
import { Coordinates } from "../types";
import { Maps, MONSTER, POINT_OF_INTEREST, WOODS } from "./Maps";
import { Logger } from "./Logger";

export enum Characters {
  KALAT = "Kalat",
  TALAK = "Talak",
  LATAK = "Latak",
  YEP = "YEP",
  PEY = "PEY",
}

export class Character {
  private info: components["schemas"]["CharacterSchema"] | undefined;
  private logger: Logger;

  constructor(
    private readonly character: Characters,
    private readonly map: Maps,
    color: keyof typeof Logger.COLORS,
  ) {
    this.logger = new Logger(color, character);
  }

  set_info<T extends { character: components["schemas"]["CharacterSchema"] }>(
    payload: T,
  ) {
    this.info = payload.character;
  }

  public async get_position(): Promise<Coordinates> {
    return this.get_info().then((info) => [info.x, info.y]);
  }

  async get_info(): Promise<components["schemas"]["CharacterSchema"]> {
    if (typeof this.info == "undefined") {
      this.info = await http_client
        .GET("/characters/{name}", {
          params: { path: { name: this.character } },
        })
        .then((resp) => resp.data!.data);

      const cooldown =
        new Date(this.info!.cooldown_expiration!).getTime() -
        new Date().getTime();

      if (cooldown > 0) {
        this.logger.info(
          "WAIT CURRENT COOLDOWN",
          `${Math.round(cooldown / 1000)} sec`,
        );
        await new Promise((r) => setTimeout(r, cooldown));
      }
    }

    return this.info!;
  }

  get_name(): Characters {
    return this.character;
  }

  async get_coordinates(): Promise<Coordinates> {
    const info = await this.get_info();
    return [info.x, info.y];
  }

  async wait<T extends { cooldown: components["schemas"]["CooldownSchema"] }>(
    data: T,
    action: string = "COOLDOWN",
  ) {
    this.logger.info(action, `${data.cooldown.remaining_seconds}sec`);
  }

  public async got_to(point_of_interest: POINT_OF_INTEREST) {
    const destination_coordinates = await this.map.find_nearest(
      await this.get_position(),
      point_of_interest,
    );

    await this.move(destination_coordinates);
  }

  public async move([x, y]: Coordinates) {
    const info = await this.get_info();

    if (info.x === x && info.y === y) {
      return this.logger.warn(`ALREADY ON SITE (${x}, ${y})`);
    }

    const data = await http_client
      .POST("/my/{name}/action/move", {
        params: { path: { name: this.character } },
        body: { x, y },
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(data, `MOVE (${x},${y})`);
  }

  public async fight() {
    const data = await http_client
      .POST("/my/{name}/action/fight", {
        params: { path: { name: this.character } },
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(
      data,
      `FIGHT (${data.fight.xp}xp) ${data.fight.result} - ${
        data.fight.drops
          .map((item) => `${item.code} x${item.quantity}`)
          .join(", ") ?? "NO DROPS"
      } ${data.fight.turns} TURNS`,
    );
  }

  public async restore() {
    const data = await http_client
      .POST("/my/{name}/action/rest", {
        params: { path: { name: this.character } },
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(data, `RESTORE +${data.hp_restored}hp`);
  }

  public async gathering() {
    const data = await http_client
      .POST("/my/{name}/action/gathering", {
        params: { path: { name: this.character } },
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(
      data,
      `GATHERING (${data.details.xp}xp) ${data.details.items.map(
        (item) => `${item.code} x${item.quantity}`,
      )}`,
    );
  }

  public async craft(item_code: string, quantity: number = 1) {
    const data = await http_client
      .POST("/my/{name}/action/crafting", {
        params: { path: { name: this.character } },
        body: {
          code: item_code,
          quantity: quantity,
        },
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(
      data,
      `CRAFT (${data.details.xp}xp) ${item_code} x${quantity}`,
    );
  }

  public async delete_item(item_code: string, quantity: number = 1) {
    const data = await http_client
      .POST("/my/{name}/action/delete", {
        params: { path: { name: this.character } },
        body: {
          code: item_code,
          quantity: quantity,
        },
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(data, `DELETE ${item_code} x${quantity}`);
  }

  public async rececycling(item_code: string, quantity: number = 1) {
    const data = await http_client
      .POST("/my/{name}/action/recycling", {
        params: { path: { name: this.character } },
        body: {
          code: item_code,
          quantity: quantity,
        },
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(data, `RECYCLING ${item_code} x${quantity}`);
  }

  public async inventory(itemCode: string): Promise<number> {
    const inventory = await this.get_info().then((info) => info.inventory);

    if (typeof inventory === "undefined") {
      return 0;
    }

    return inventory.find((item) => item.code === itemCode)?.quantity ?? 0;
  }

  public async unequip(
    slot: components["schemas"]["ItemSlot"],
    quantity: number = 1,
  ) {
    const data = await http_client
      .POST("/my/{name}/action/unequip", {
        params: { path: { name: this.character } },
        body: { slot, quantity: 1 },
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(data, `UNEQUIP ${slot} ${data.item.code} x${quantity}`);
  }

  public async equip(
    itemCode: string,
    slot: components["schemas"]["ItemSlot"] = "weapon",
    quantity: number = 1,
  ) {
    const item_quantity = await this.inventory(itemCode);

    if (item_quantity <= 0) {
      return this.logger.warn(`DON'T HAVE ${itemCode} IN THIS INVENTORY`);
    }

    const data = await http_client
      .POST("/my/{name}/action/equip", {
        params: { path: { name: this.character } },
        body: { code: itemCode, slot, quantity },
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(data, `EQUIP ${itemCode}`);
  }

  public async check_inventory_capacity_and_store_when_full(
    marge: number = 5,
    rollback: boolean = true,
  ): Promise<boolean> {
    const info = await this.get_info();
    const pose: Coordinates = [info.x, info.y];

    const inventory_capacity = await this.check_inventory_capacity();

    if (marge > inventory_capacity) {
      await this.got_to(POINT_OF_INTEREST.BANK);
      await this.store_all();

      if (rollback) await this.move(pose);

      return true;
    }

    return false;
  }

  public async check_inventory_capacity(): Promise<number> {
    const info = await this.get_info();
    const total_items = info.inventory!.reduce(
      (total, item) => item.quantity + total,
      0,
    );

    this.logger.info(`INVENTORY ${total_items}/${info.inventory_max_items}`);

    return info.inventory_max_items - total_items;
  }

  public async npc_sell(item_code: string, quantity: number = 1) {
    const data = await http_client
      .POST("/my/{name}/action/npc/sell", {
        params: { path: { name: this.character } },
        body: {
          quantity: quantity,
          code: item_code,
        },
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(
      data,
      `NPC SELL ${data.transaction.code}x${data.transaction.quantity} ${data.transaction.currency}`,
    );
  }

  public async sell(item_code: string, price: number, quantity: number = 1) {
    const data = await http_client
      .POST("/my/{name}/action/grandexchange/sell", {
        params: { path: { name: this.character } },
        body: {
          code: item_code,
          quantity: quantity,
          price: price,
        },
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(
      data,
      `NPC ${data.order.code}x${data.order.quantity} ${data.order.price}`,
    );
  }

  public async store_all(
    ignore_items: string[] = [
      "copper_axe",
      "copper_dagger",
      "copper_helmet",
      "copper_boots",
      "copper_pickaxe",
    ],
  ) {
    const info = await this.get_info();

    const items = info
      .inventory!.filter((item) => item.code)
      .filter((item) => !ignore_items.includes(item.code))
      .map((item) => ({ code: item.code, quantity: item.quantity }));

    if (!items.length) {
      return this.logger.warn("SKIPPING STORE");
    }

    await this.got_to(POINT_OF_INTEREST.BANK);

    const data = await http_client
      .POST("/my/{name}/action/bank/deposit/item", {
        params: { path: { name: this.character } },
        body: items,
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(data, "STORE ALL ITEMS");
  }

  public async withdraw(item_code: string, quantity: number = 1) {
    await this.got_to(POINT_OF_INTEREST.BANK);

    const data = await http_client
      .POST("/my/{name}/action/bank/withdraw/item", {
        params: { path: { name: this.character } },
        body: [{ code: item_code, quantity }],
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(data, `WITHDRAW ${item_code} x${quantity}`);
  }

  public async farm_mob(
    monster: keyof typeof MONSTER,
    quantity: number = Infinity,
  ) {
    await this.equip("sticky_dagger");

    for (let i = 0; i < quantity; i++) {
      await this.got_to(monster);
      await this.restore();
      await this.fight();

      await this.check_inventory_capacity_and_store_when_full(5, true);
    }
  }

  public async farm_fishing(quantity: number = Infinity) {
    await this.equip("fishing_net");

    for (let i = 0; i < quantity; i++) {
      await this.got_to(POINT_OF_INTEREST.GUDGEON_FISHING_SPOT);
      await this.gathering();
      await this.check_inventory_capacity_and_store_when_full(5);
    }
  }

  public async farm_alchemy(quantity: number = Infinity) {
    await this.got_to(POINT_OF_INTEREST.BANK);
    await this.store_all();
    await this.withdraw("sunflower", 3);

    for (let i = 0; i < quantity; i++) {
      await this.got_to(POINT_OF_INTEREST.ALCHEMY);
      await this.give_item("sunflower", this, 3);
      await this.craft("small_health_potion", 1);

      const capacity = await this.check_inventory_capacity();

      if (capacity < 5) {
        await this.got_to(POINT_OF_INTEREST.BANK);
        await this.store("small_health_potion", Infinity);
      }
    }
  }

  public async farm_copper(quantity: number = Infinity) {
    const beginItem = await this.inventory("copper_bar");
    await this.equip("copper_pickaxe");

    while ((await this.inventory("copper_bar")) < quantity + beginItem) {
      await this.got_to(POINT_OF_INTEREST.COPPER_ROCKS);

      while ((await this.inventory("copper_ore")) < 10) {
        await this.gathering();
      }

      await this.got_to(POINT_OF_INTEREST.MINING);
      await this.craft("copper_bar");

      await this.check_inventory_capacity_and_store_when_full(10);
    }
  }

  public async farm_coal(quantity: number = Infinity) {
    for (let i = 0; i < quantity; i++) {
      await this.got_to(POINT_OF_INTEREST.COAL_ROCKS);
      await this.gathering();
      await this.check_inventory_capacity_and_store_when_full(5);
    }
  }

  public async farm_iron(quantity: number = Infinity) {
    for (let i = 0; i < quantity; i++) {
      await this.got_to(POINT_OF_INTEREST.IRON_ROCKS);
      await this.gathering();
      await this.check_inventory_capacity_and_store_when_full(5);
    }
  }

  public async farm_mining(quantity: number = Infinity) {
    await this.got_to(POINT_OF_INTEREST.BANK);
    await this.store_all();
    await this.withdraw("iron_ore", 10);

    for (let i = 0; i < quantity; i++) {
      await this.give_item("iron_ore", this, 10);
      await this.got_to(POINT_OF_INTEREST.MINING);
      await this.craft("iron_bar", 1);

      const capacity = await this.check_inventory_capacity();

      if (capacity < 20) {
        await this.got_to(POINT_OF_INTEREST.BANK);
        await this.store("iron_bar", Infinity);
      }
    }
  }

  public async farm_sunflower(quantity: number = Infinity) {
    await this.got_to(POINT_OF_INTEREST.SUNFLOWER_FIELD);

    for (let i = 0; i < quantity; i++) {
      await this.gathering();
      await this.check_inventory_capacity_and_store_when_full(5);
    }
  }

  public async farm_wood(
    wood: keyof typeof WOODS,
    quantity: number = Infinity,
  ) {
    await this.got_to(wood);
    await this.equip("copper_axe");

    for (let i = 0; i < quantity; i++) {
      await this.gathering();

      await this.check_inventory_capacity_and_store_when_full(5);
    }
  }

  public async farm_wood_cutting(
    item: "spruce" | "ash",
    quantity: number = Infinity,
  ) {
    await this.got_to(POINT_OF_INTEREST.BANK);
    await this.store_all();
    await this.withdraw(`${item}_wood`, 10);

    for (let i = 0; i < quantity; i++) {
      await this.got_to(POINT_OF_INTEREST.WOODCUTTING);
      await this.give_item(`${item}_wood`, this, 10);
      await this.craft(`${item}_plank`, 1);

      const capacity = await this.check_inventory_capacity();
      if (capacity < 5) {
        await this.got_to(POINT_OF_INTEREST.BANK);
        await this.store(`${item}_plank`, Infinity);
      }
    }
  }

  public async farm_weapon_crafting(quantity: number = Infinity) {
    await this.store_all();
    await this.withdraw("iron_bar", 8);
    await this.withdraw("spruce_plank", 2);
    await this.withdraw("jasper_crystal", 1);
    await this.got_to(POINT_OF_INTEREST.WEAPONCRAFTING);

    for (let i = 0; i < quantity; i++) {
      await this.give_item("iron_bar", this, 8);
      await this.give_item("spruce_plank", this, 2);
      await this.give_item("jasper_crystal", this, 1);

      await this.craft("iron_pickaxe");
      await this.delete_item("iron_pickaxe", 1);
    }
  }

  public async store(item_code: string, quantity: number = Infinity) {
    const quantity_inventory = await this.inventory(item_code);
    const quantity_to_give = Math.min(quantity_inventory, quantity);

    await this.got_to(POINT_OF_INTEREST.BANK);

    if (quantity_inventory <= 0) {
      return this.logger.warn("NO ITEM TO STORE");
    }

    const data = await http_client
      .POST("/my/{name}/action/bank/deposit/item", {
        params: { path: { name: this.character } },
        body: [{ code: item_code, quantity: quantity_to_give }],
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(data, `STORE ${item_code} x${quantity_to_give}`);
  }

  public async give_item(
    item_code: string,
    target: Character,
    quantity: number = 1,
  ) {
    const inventory_quantity = await this.inventory(item_code);

    if (inventory_quantity < 1) {
      return this.logger.warn(
        `CAN'T GIVE TO ${target.get_name()} BECAUSE DON'T HAVE ${item_code}`,
      );
    }

    await this.move(await target.get_coordinates());

    const data = await http_client
      .POST("/my/{name}/action/give/item", {
        params: { path: { name: this.character } },
        body: {
          items: [
            {
              code: item_code,
              quantity: Math.min(inventory_quantity, quantity),
            },
          ],
          character: target.character.toString(),
        },
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(
      data,
      `GIVE TO ${target.get_name()} ${item_code} x${Math.min(
        inventory_quantity,
        quantity,
      )} `,
    );
  }
}

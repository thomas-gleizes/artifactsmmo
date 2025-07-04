import { components } from "../openapi";
import { http_client } from "../http_client";
import { Coordinates } from "../types";
import { Maps, MONSTER, POINT_OF_INTEREST, WOODS } from "./Maps";

export enum Characters {
  KALAT = "Kalat",
  TALAK = "Talak",
  LATAK = "Latak",
  YEP = "YEP",
  PEY = "PEY",
}

export class Character {
  private info: components["schemas"]["CharacterSchema"] | undefined;

  constructor(
    private readonly character: Characters,
    private readonly map: Maps,
  ) {}

  public logger(...args: any[]) {
    console.log(this.character, ...args);
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
        console.log(
          this.character + " WAIT CURRENT COOLDOWN : ",
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
    this.logger(action, `${data.cooldown.remaining_seconds} sec`);
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
      return this.logger("ALREADY ON SITE");
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
      `FIGHT (${data.fight.xp}xp) ${data.fight.result} - ${data.fight.drops
        .map((item) => `${item.code} ${item.quantity}`)
        .join(",")} - ${data.fight.turns} turns`,
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
      `CRAFT (${data.details.xp}) ${item_code} ${quantity}`,
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

  public async equip(
    itemCode: string,
    slot: components["schemas"]["ItemSlot"] = "weapon",
  ) {
    const item_quantity = await this.inventory(itemCode);

    if (item_quantity <= 0) {
      return this.logger(`DON'T HAVE ${itemCode} IN THIS INVENTORY`);
    }

    const data = await http_client
      .POST("/my/{name}/action/equip", {
        params: { path: { name: this.character } },
        body: { code: itemCode, slot, quantity: 1 },
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(data, `EQUIP ${itemCode}`);
  }

  public async check_inventory_capacity(marge: number = 5): Promise<number> {
    const info = await this.get_info();
    const pose: Coordinates = [info.x, info.y];

    const total_items = info.inventory!.reduce(
      (total, item) => item.quantity + total,
      0,
    );

    this.logger(`INVENTORY ${total_items}/${info.inventory_max_items}`);

    if (marge > info.inventory_max_items - total_items) {
      await this.got_to(POINT_OF_INTEREST.BANK);
      await this.store_all();
      await this.move(pose);
    }

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
      return this.logger("SKIPPING STORE");
    }

    await this.got_to(POINT_OF_INTEREST.BANK);

    const data = await http_client
      .POST("/my/{name}/action/bank/deposit/item", {
        params: { path: { name: this.character } },
        body: items,
      })
      .then((resp) => resp.data!.data);

    this.set_info(data);
    await this.wait(data);
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
    await this.wait(data, "WITHDRAW");
  }

  public async farm_mob(
    monster: keyof typeof MONSTER,
    quantity: number = Infinity,
  ) {
    await this.equip("copper_dagger");

    for (let i = 0; i < quantity; i++) {
      await this.got_to(monster);
      await this.restore();
      await this.fight();

      await this.check_inventory_capacity(5);
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

      await this.check_inventory_capacity(10);
    }
  }

  public async farm_coal(quantity: number = Infinity) {
    for (let i = 0; i < quantity; i++) {
      await this.got_to(POINT_OF_INTEREST.COAL_ROCKS);
      await this.gathering();
      await this.check_inventory_capacity(5);
    }
  }

  public async farm_iron(quantity: number = Infinity) {
    for (let i = 0; i < quantity; i++) {
      await this.got_to(POINT_OF_INTEREST.IRON_ROCKS);
      await this.gathering();
      await this.check_inventory_capacity(5);
    }
  }

  public async farm_sunflower(quantity: number = Infinity) {
    await this.got_to(POINT_OF_INTEREST.SUNFLOWER_FIELD);

    for (let i = 0; i < quantity; i++) {
      await this.gathering();
      await this.check_inventory_capacity(5);
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

      await this.check_inventory_capacity(5);
    }
  }

  public async farm_weapon() {
    await this.store_all();
    await this.withdraw("copper_bar", 6);
    await this.got_to(POINT_OF_INTEREST.WEAPONCRAFTING);

    for (let i = 0; i < 10; i++) {
      await this.give_item("copper_bar", this, 6);
      await this.craft("copper_dagger");
      await this.rececycling("copper_dagger", 1);
      await this.delete_item("copper_bar", 2);
    }
  }

  public async store(item_code: string, quantity: number = Infinity) {
    const quantity_inventory = await this.inventory(item_code);
    const quantity_to_give = Math.min(quantity_inventory, quantity);

    await this.got_to(POINT_OF_INTEREST.BANK);

    if (quantity_inventory <= 0) {
      return this.logger("NO ITEM TO STORE");
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
      this.logger(
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

import createClient from "openapi-fetch";
import { paths } from "./openapi";

const token =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRob21hc2dsZWl6ZXMzNEBnbWFpbC5jb20iLCJwYXNzd29yZF9jaGFuZ2VkIjoiMjAyNS0wNy0wMlQxNzoxNzowMi4yNzRaIn0.upJhTObVmJNcglVsFs9a-4Zn9oucL0sH6u6YSuZlHig";

class Http_Error extends Error {
  constructor(public readonly response: Response) {
    super();
  }
}

export const http_client = createClient<paths>({
  baseUrl: "https://api.artifactsmmo.com",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  },
});

http_client.use({
  onResponse: ({ response }) => {
    if (!response.ok) {
      // @ts-ignore
      console.log(response.status, ErrorCodes[response.status]);
      throw new Http_Error(response);
    }

    return response;
  },
});

const ErrorCodes = {
  422: "invalid_payload",
  429: "too_many_requests",
  404: "not_found",
  500: "fatal_error",

  560: "invalid_email_reset_token",
  561: "expired_email_reset_token",
  562: "used_email_reset_token",

  452: "token_invalid",
  453: "token_expired",
  454: "token_missing",
  455: "token_generation_failed",
  456: "username_already_used",
  457: "email_already_used",
  458: "same_password",
  459: "current_password_invalid",
  451: "account_not_member",
  550: "account_skin_not_owned",

  483: "character_not_enough_hp",
  484: "character_max_utilities_equipped",
  485: "character_item_already_equipped",
  486: "character_locked",
  474: "character_wrong_task",
  475: "character_too_many_items_task",
  487: "character_no_task",
  488: "character_task_not_completed",
  489: "character_already_on_task",
  490: "character_already_on_map",
  491: "character_slot_equipment_error",
  492: "character_not_enough_gold",
  493: "character_skill_level_required",
  494: "character_name_already_used",
  495: "max_characters_reached",
  496: "character_condition_not_met",
  497: "character_inventory_full",
  498: "character_not_found",
  499: "character_in_cooldown",

  471: "item_insufficient_quantity",
  472: "item_invalid_equipment",
  473: "item_invalid_for_recycling",
  476: "item_invalid_consumable",
  478: "item_missing",

  479: "ge_max_quantity",
  480: "ge_not_in_stock",
  482: "ge_wrong_price",
  436: "ge_transaction_in_progress",
  431: "ge_no_orders",
  433: "ge_max_orders",
  434: "ge_too_many_items",
  435: "ge_same_account",
  437: "ge_invalid_item",
  438: "ge_not_your_order",

  460: "bank_insufficient_gold",
  461: "bank_transaction_in_progress",
  462: "bank_full",

  597: "map_not_found",
  598: "map_content_not_found",

  441: "npc_not_for_sale",
  442: "npc_not_for_buy",
};

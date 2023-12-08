import { Injectable } from "@nestjs/common";
import { Equals } from "class-validator";
import { ActionConfig } from "./action.config";
import { ClickActionType } from "./action.const";

@Injectable()
export class ClickActionConfig extends ActionConfig<ClickActionType> {
  @Equals(ClickActionType)
  type: ClickActionType = ClickActionType;
}

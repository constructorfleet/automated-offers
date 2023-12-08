import { IsIn, IsNotEmpty } from "class-validator";
import { Actions } from "./action.const";

export abstract class ActionConfig<Action extends Actions> {
  @IsNotEmpty()
  @IsIn(Actions)
  abstract type: Action;
}

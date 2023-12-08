import { Injectable } from "@nestjs/common";
import { Type } from "class-transformer";
import { Equals, ValidateNested } from "class-validator";
import { StepConfig, StepConfigShape } from "../step.config";
import { ActionConfig } from "./action.config";
import { StepActionType } from "./action.const";

@Injectable()
export class StepActionConfig extends ActionConfig<StepActionType> {
  @Equals(StepActionType)
  type: StepActionType = StepActionType;

  @ValidateNested()
  @Type(() => StepConfig())
  step: StepConfigShape;
}

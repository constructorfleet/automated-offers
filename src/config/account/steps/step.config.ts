import { Type } from "class-transformer";
import {
  Equals,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { VariablePathPattern } from "src/common";
import { AccountConfig } from "../account.config";
import {
  ActionConfig,
  Actions,
  ClickActionConfig,
  ClickActionType,
  SendKeysActionConfig,
  SendKeysActionType,
  StepActionConfig,
  StepActionType,
  TextActionConfig,
  TextActionType,
} from "./actions";
import { SelectorConfig } from "./selector.config";

export const NotFound: "notFound" = "notFound" as const;
export type NotFound = typeof NotFound;
export const IterationCount: "count" = "count" as const;
export type IterationCount = typeof IterationCount;
export const SingleStep: "single" = "single";
export type SingleStep = typeof SingleStep;
export const RepeatUntil = [NotFound, IterationCount] as const;
export type RepeatUntil = (typeof RepeatUntil)[number];
export const StepType = [SingleStep, NotFound, IterationCount] as const;
export type StepType = (typeof StepType)[number];

export abstract class RepeatConfig {
  @IsString()
  @IsNotEmpty()
  @Matches(VariablePathPattern)
  indexVariable: string;

  @IsOptional()
  @IsNumber()
  offset: number = 0;

  @IsEnum(RepeatUntil)
  @IsNotEmpty()
  until: RepeatUntil;
}

export class IterationCountConfig extends RepeatConfig {
  @Equals(IterationCount)
  until: IterationCount = IterationCount;

  @IsString()
  @IsNotEmpty()
  @Matches(VariablePathPattern)
  countVariable: string;
}

export class WhileFoundConfig extends RepeatConfig {
  @Equals(NotFound)
  until: NotFound = NotFound;
}

export type StepConfigShape = {
  name: string;

  type: StepType;

  isOptional: boolean;

  actions: ActionConfig<Actions>[];

  repeat?: RepeatConfig;
} & SelectorConfig;

export const StepConfig = () => {
  class StepConfigMixin extends SelectorConfig {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(StepType)
    @IsNotEmpty()
    type: StepType = SingleStep;

    @IsOptional()
    @IsBoolean()
    isOptional: boolean = false;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => AccountConfig, {
      discriminator: {
        property: "type",
        subTypes: [
          { name: SendKeysActionType, value: SendKeysActionConfig },
          { name: ClickActionType, value: ClickActionConfig },
          { name: TextActionType, value: TextActionConfig },
          { name: StepActionType, value: StepActionConfig },
        ],
      },
      keepDiscriminatorProperty: true,
    })
    actions: ActionConfig<Actions>[] = [];

    @ValidateIf((cfg) => cfg.type !== SingleStep)
    @ValidateNested()
    @Type(() => RepeatConfig, {
      discriminator: {
        property: "until",
        subTypes: [
          { name: IterationCount, value: IterationCountConfig },
          { name: NotFound, value: WhileFoundConfig },
        ],
      },
      keepDiscriminatorProperty: true,
    })
    repeat?: RepeatConfig;
  }
  return StepConfigMixin;
};

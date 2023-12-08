import { Injectable } from "@nestjs/common";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsNotEmpty,
  IsString,
  IsUrl,
  ValidateNested,
} from "class-validator";
import { EnsureArray } from "src/common";
import { StepConfig, StepConfigShape } from "./steps";

export type AccountType = string;

@Injectable()
export class AccountConfig {
  @IsString()
  @IsNotEmpty()
  type: AccountType;

  @IsUrl()
  url: URL;

  @EnsureArray
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StepConfig())
  steps: StepConfigShape[];
}

import { Injectable } from "@nestjs/common";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateIf,
} from "class-validator";
import { VariableNamePattern } from "src/common";

export const SelectFirst: "first" = "first" as const;
export type SelectFirst = typeof SelectFirst;
export const SelectAll: "all" = "all" as const;
export type SelectAll = typeof SelectAll;

export const SelectorType = [SelectFirst, SelectAll] as const;
export type SelectorType = (typeof SelectorType)[number];

@Injectable()
export class SelectorConfig {
  @IsString()
  @IsNotEmpty()
  cssSelector: string;

  @IsOptional()
  @IsNumber()
  @Min(100)
  timeout: number = 2000;

  @IsOptional()
  @IsEnum(SelectorType)
  select: SelectorType = SelectFirst;

  @ValidateIf((cfg) => cfg.select === SelectAll)
  @IsString()
  @Matches(VariableNamePattern)
  elementIndexVariable: string;

  @ValidateIf((cfg) => cfg.select === SelectAll)
  @IsString()
  @Matches(VariableNamePattern)
  elementCountVariable: string;

  @IsOptional()
  templateReplacers: Map<string, string>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  shadowRootCSSSelector: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  iFrameSelector: string;
}

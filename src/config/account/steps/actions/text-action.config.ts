import {
  Equals,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from "class-validator";
import { VariableNamePattern, VariablePathPattern } from "src/common";
import { ActionConfig } from "./action.config";
import { TextActionType } from "./action.const";

export class TextActionConfig extends ActionConfig<TextActionType> {
  @Equals(TextActionType)
  type: TextActionType = TextActionType;

  @IsOptional()
  regexCaptureGroups?: Map<string, string>;

  @IsOptional()
  templateReplacers?: Map<string, string>;

  @IsString()
  @IsNotEmpty()
  @Matches(VariableNamePattern)
  variableName: string;

  @IsOptional()
  @IsString()
  @Matches(VariablePathPattern)
  storeUnder?: string = undefined;

  @IsOptional()
  @IsString()
  stringify?: string = undefined;
}

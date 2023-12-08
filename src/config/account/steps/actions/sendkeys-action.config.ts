import { Injectable } from "@nestjs/common";
import {
  Equals,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateIf,
} from "class-validator";
import { VariablePathPattern } from "src/common";
import { ActionConfig } from "./action.config";
import { SendKeysActionType } from "./action.const";

export const SendVariableOption = "variable" as const;
export const SendCredentialOption = "credential" as const;
export const SendKeysOption = [
  "username",
  "password",
  "otp",
  SendVariableOption,
] as const;

export type SendKeysOption = (typeof SendKeysOption)[number];

@Injectable()
export class SendKeysActionConfig extends ActionConfig<SendKeysActionType> {
  @Equals(SendKeysActionType)
  type: SendKeysActionType = SendKeysActionType;

  @IsEnum(SendKeysOption)
  @IsNotEmpty()
  send: SendKeysOption;

  @ValidateIf((cfg) => cfg.send === SendVariableOption)
  @IsString()
  @IsNotEmpty()
  @Matches(VariablePathPattern)
  variablePath: string;

  // constructor(config: Record<string, never>) {
  //   super();
  //   this.send = config["send"];
  //   this.variablePath = config["variablePath"];
  // }
}

import { Type } from "class-transformer";
import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from "class-validator";
import { AccountType } from "../account/account.config";
import {
  BasicCredentials,
  BasicCredentialsConfig,
  CredentialsConfig,
  OPCredentials,
  OPCredentialsConfig,
} from "./credentials";

export type UserType = string;

export class UserAccountConfig {
  @IsString()
  @IsNotEmpty()
  type: AccountType;

  @ValidateNested()
  @Type(() => CredentialsConfig, {
    discriminator: {
      property: "type",
      subTypes: [
        { name: BasicCredentials, value: BasicCredentialsConfig },
        { name: OPCredentials, value: OPCredentialsConfig },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  credentials: CredentialsConfig;
}

export class UserConfig {
  @IsString()
  @IsNotEmpty()
  id: UserType;

  @IsArray()
  @ArrayUnique((config) => config.type)
  @ValidateNested({ each: true })
  @Type(() => UserAccountConfig)
  accounts: UserAccountConfig[];
}

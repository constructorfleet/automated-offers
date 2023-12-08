import { INestApplicationContext, Injectable, LogLevel } from "@nestjs/common";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { AccountType } from "../account";
import { UserType } from "../user";
import {
  BasicCredentialProviderConfig,
  BasicCredentialProviderType,
  CredentialProviderConfig,
  CredentialProviderType,
  OPCliCredentialProviderType,
  OPConnectCredentialProviderConfig,
  OPConnectCredentialProviderType,
} from "./credential-provider";
import { OPCliCredentialProviderConfig } from "./credential-provider/op-cli.credential-provider";

export const LogLevels = ["debug", "info", "warn", "error"] as const;
export type LogLevels = (typeof LogLevels)[number];

export const setLogLevels = (app: INestApplicationContext) =>
  app.useLogger(
    LogLevels.slice(
      LogLevels.indexOf(app.get(AppConfig)?.log?.level ?? "info")
    ).map((level) => (level === "info" ? "log" : level)) as LogLevel[]
  );

export class LogConfig {
  @IsOptional()
  @IsString()
  file?: string | undefined = undefined;

  @IsOptional()
  @IsEnum(LogLevels)
  level?: LogLevels = "info";
}

export class OutputConfig {
  @IsString()
  @IsNotEmpty()
  file: string;

  @IsOptional()
  @IsString()
  path?: string | undefined = undefined;
}

@Injectable()
export class AppConfig {
  @IsString()
  @IsNotEmpty()
  browserData: string;

  @IsOptional()
  @IsBoolean()
  headless: boolean = false;

  @IsOptional()
  @ValidateNested()
  @Type(() => OutputConfig)
  output?: OutputConfig | undefined = undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => LogConfig)
  log?: LogConfig | undefined = undefined;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  users: UserType[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  accounts: AccountType[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CredentialProviderConfig, {
    discriminator: {
      property: "type",
      subTypes: [
        {
          name: BasicCredentialProviderType,
          value: BasicCredentialProviderConfig,
        },
        {
          name: OPCliCredentialProviderType,
          value: OPCliCredentialProviderConfig,
        },
        {
          name: OPConnectCredentialProviderType,
          value: OPConnectCredentialProviderConfig,
        },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  credentialProviders: CredentialProviderConfig<CredentialProviderType>[];
}

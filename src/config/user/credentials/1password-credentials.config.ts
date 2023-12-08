import { Injectable } from "@nestjs/common";
import { Equals, IsEnum, IsNotEmpty, IsString } from "class-validator";
import {
  CredentialProviderType,
  OPCliCredentialProviderType,
  OPConnectCredentialProviderType,
} from "src/config/app";
import { CredentialsConfig } from "./credentials.config";
import { OPCredentials } from "./credentials.const";

export const OPCredentialProviders = [
  OPCliCredentialProviderType,
  OPConnectCredentialProviderType,
] as const;
export type OPCredentialProviders = (typeof OPCredentialProviders)[number];

@Injectable()
export class OPCredentialsConfig extends CredentialsConfig {
  @Equals(OPCredentials)
  type: OPCredentials = OPCredentials;

  @IsEnum(OPCredentialProviders)
  @IsNotEmpty()
  provider: CredentialProviderType;

  @IsString()
  @IsNotEmpty()
  vault: string;

  @IsString()
  @IsNotEmpty()
  item: string;
}

import { Equals, IsNotEmpty, IsOptional, IsString } from "class-validator";
import {
  BasicCredentialProviderType,
  CredentialProviderType,
} from "src/config/app";
import { CredentialsConfig } from "./credentials.config";
import { BasicCredentials } from "./credentials.const";

export class BasicCredentialsConfig extends CredentialsConfig {
  @Equals(BasicCredentials)
  type: BasicCredentials = BasicCredentials;

  @IsOptional()
  @Equals(BasicCredentialProviderType)
  provider: CredentialProviderType = BasicCredentialProviderType;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

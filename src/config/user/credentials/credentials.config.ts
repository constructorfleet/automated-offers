import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { CredentialProviderType } from "src/config/app";
import { Credentials } from "./credentials.const";

export abstract class CredentialsConfig {
  @IsString()
  @IsNotEmpty()
  abstract type: Credentials;

  @IsEnum(CredentialProviderType)
  @IsNotEmpty()
  abstract provider: CredentialProviderType;
}

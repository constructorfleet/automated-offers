import { Injectable } from "@nestjs/common";
import { Equals, IsOptional, IsString } from "class-validator";
import { CredentialProviderConfig } from "./credential-provider.config";

export const OPCliCredentialProviderType: "1password-cli" =
  "1password-cli" as const;
export type OPCliCredentialProviderType = typeof OPCliCredentialProviderType;

@Injectable()
export class OPCliCredentialProviderConfig extends CredentialProviderConfig<OPCliCredentialProviderType> {
  @Equals(OPCliCredentialProviderType)
  type: OPCliCredentialProviderType = OPCliCredentialProviderType;

  @IsOptional()
  @IsString()
  token?: string;
}

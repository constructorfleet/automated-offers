import { Injectable } from "@nestjs/common";
import { Equals, IsNotEmpty, IsString, IsUrl } from "class-validator";
import { CredentialProviderConfig } from "./credential-provider.config";

export const OPConnectCredentialProviderType: "1password-connect" =
  "1password-connect" as const;
export type OPConnectCredentialProviderType =
  typeof OPConnectCredentialProviderType;

@Injectable()
export class OPConnectCredentialProviderConfig extends CredentialProviderConfig<OPConnectCredentialProviderType> {
  @Equals(OPConnectCredentialProviderType)
  type: OPConnectCredentialProviderType = OPConnectCredentialProviderType;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsUrl()
  @IsNotEmpty()
  url: URL;
}

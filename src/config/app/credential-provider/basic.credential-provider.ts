import { Injectable } from "@nestjs/common";
import { Equals } from "class-validator";
import { CredentialProviderConfig } from "./credential-provider.config";

export const BasicCredentialProviderType: "basic" = "basic" as const;
export type BasicCredentialProviderType = typeof BasicCredentialProviderType;

@Injectable()
export class BasicCredentialProviderConfig extends CredentialProviderConfig<BasicCredentialProviderType> {
  @Equals(BasicCredentialProviderType)
  type: BasicCredentialProviderType = BasicCredentialProviderType;
}

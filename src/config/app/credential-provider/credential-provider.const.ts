import { BasicCredentialProviderType } from "./basic.credential-provider";
import { OPCliCredentialProviderType } from "./op-cli.credential-provider";
import { OPConnectCredentialProviderType } from "./op-connect.credential-provider";

export const CredentialProviderType = [
  BasicCredentialProviderType,
  OPConnectCredentialProviderType,
  OPCliCredentialProviderType,
] as const;
export type CredentialProviderType = (typeof CredentialProviderType)[number];

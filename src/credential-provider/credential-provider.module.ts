import { DynamicModule, Module } from "@nestjs/common";
import { AppConfigModule } from "src/config";
import { BasicCredentialsProvider } from "./basic.provider";
import {
  ConfigProviders,
  CredentialProviders,
} from "./credential-provider.providers";
import { OPCliCredentialsProvider } from "./op-cli.provider";
import { OPConnectCredentialsProvider } from "./op-connect.provider";

const providers = [
  BasicCredentialsProvider,
  OPCliCredentialsProvider,
  OPConnectCredentialsProvider,
];

@Module({})
export class CredentialsProviderModule {
  static forRoot(): DynamicModule {
    return {
      module: CredentialsProviderModule,
      imports: [AppConfigModule],
      providers: [...ConfigProviders, ...CredentialProviders],
      exports: [...CredentialProviders],
    };
  }
}

import { Inject, Provider, Type } from "@nestjs/common";
import {
  AppConfig,
  BasicCredentialProviderConfig,
  CredentialProviderConfig,
  CredentialProviderType,
  CredentialsConfig,
} from "src/config";
import { CredentialsProvider } from "./credential-provider";

export const ConfigProviders: Provider[] = [];
export const InjectConfig = (providerType: CredentialProviderType) => {
  const key = `Config.CredentialProvider.${providerType}`;
  ConfigProviders.push({
    provide: key,
    inject: [AppConfig],
    useFactory: (config) =>
      config.credentialProviders.find((c) => c.type === providerType) ??
      new BasicCredentialProviderConfig(),
  });
  return Inject(key);
};

export const CredentialProviders: Provider[] = [];
export const InjectCredentialProvider = (type: CredentialProviderType) =>
  Inject(type);

export const RegisterCredentialProvider =
  (providerType: CredentialProviderType) =>
  (
    ctor: Type<
      CredentialsProvider<
        CredentialProviderConfig<CredentialProviderType>,
        CredentialsConfig
      >
    >
  ) => {
    CredentialProviders.push(ctor, {
      provide: providerType,
      useClass: ctor,
    });
  };

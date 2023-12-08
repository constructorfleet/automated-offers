import { InjectionToken } from "@nestjs/common";

export type ConfigurationModuleOptions = {
  envFilePaths: string[] | string;
  configDirectory: string;
  appConfigFile: string;
  userConfigDirectory: string;
  accountConfigDirectory: string;
  userConfigsToken: InjectionToken;
  accountConfigsToken: InjectionToken;
};

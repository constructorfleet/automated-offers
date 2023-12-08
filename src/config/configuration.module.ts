import { DynamicModule, Module } from "@nestjs/common";
import { join as joinPath, resolve } from "path";
import { AccountConfigs, AccountsConfigModule } from "./account";
import { AppConfigModule } from "./app";
import { ConfigurationModuleOptions } from "./configuration.types";
import { UserConfigs, UsersConfigModule } from "./user";

const defaultOptions: ConfigurationModuleOptions = {
  configDirectory: resolve(joinPath(process.cwd(), "config")),
  appConfigFile: "app.yaml",
  userConfigDirectory: "users",
  accountConfigDirectory: "accounts",
  userConfigsToken: UserConfigs,
  accountConfigsToken: AccountConfigs,
  envFilePaths: resolve(joinPath(process.cwd(), ".env")),
};

@Module({})
export class ConfigurationModule {
  static forRoot({
    configDirectory = resolve(joinPath(process.cwd(), "config")),
    appConfigFile = "app.yaml",
    userConfigDirectory = "users",
    accountConfigDirectory = "accounts",
    userConfigsToken = UserConfigs,
    accountConfigsToken = AccountConfigs,
    envFilePaths = resolve(joinPath(process.cwd(), ".env")),
  }: ConfigurationModuleOptions = defaultOptions): DynamicModule {
    return {
      module: ConfigurationModule,
      imports: [
        AppConfigModule.forRoot(configDirectory, appConfigFile, envFilePaths),
        UsersConfigModule.forRoot(
          configDirectory,
          userConfigDirectory,
          userConfigsToken
        ),
        AccountsConfigModule.forRoot(
          configDirectory,
          accountConfigDirectory,
          accountConfigsToken
        ),
      ],
      exports: [AppConfigModule, UsersConfigModule, AccountsConfigModule],
    };
  }
}

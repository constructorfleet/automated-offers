import {
  DynamicModule,
  FactoryProvider,
  InjectionToken,
  Module,
} from "@nestjs/common";
import { existsSync } from "fs";
import { readdir } from "fs/promises";
import { TypedConfigModule, fileLoader } from "nest-typed-config";
import { join as joinPath, resolve } from "path";
import { AccountConfig } from "./account.config";

export const AccountConfigs: InjectionToken = "Account.Configs";
export type AccountConfigs = AccountConfig[];

type AccountConfigFileToken = {
  file: string;
  token: InjectionToken;
};

const accountConfigToken = (
  file: string,
  index: number
): AccountConfigFileToken => ({
  file,
  token: `AccountConfig${file.replace(/\.\w+$/, "")}`,
});

const accountConfigProvider = (token: InjectionToken): FactoryProvider => ({
  provide: token,
  inject: [AccountConfig],
  useFactory: (config: AccountConfig): AccountConfig => config,
});

const accountConfigsProvider = (
  token: InjectionToken,
  ...accountConfigTokens: InjectionToken[]
): FactoryProvider => ({
  provide: token,
  inject: [...accountConfigTokens],
  useFactory: (...configs: AccountConfig[]): AccountConfig[] =>
    Array.isArray(configs) ? configs : [configs],
});

@Module({})
class AccountConfigModule {
  static forAccount(
    accountConfigDirectory: string,
    accountConfigFile: string,
    token: InjectionToken
  ): DynamicModule {
    return {
      module: AccountConfigModule,
      imports: [
        TypedConfigModule.forRoot({
          schema: AccountConfig,
          load: [
            fileLoader({
              absolutePath: resolve(
                joinPath(accountConfigDirectory, accountConfigFile)
              ),
              ignoreEnvironmentVariableSubstitution: false,
            }),
          ],
        }),
      ],
      providers: [accountConfigProvider(token)],
      exports: [token],
    };
  }
}

@Module({})
export class AccountsConfigModule {
  static async forRoot(
    appConfigDirectory: string = joinPath(process.cwd(), "config"),
    accountConfigDirectory = "accounts",
    accountConfigsToken = AccountConfigs
  ): Promise<DynamicModule> {
    const path = resolve(joinPath(appConfigDirectory, accountConfigDirectory));
    if (!existsSync(path)) {
      throw new Error(`Account configuration path does not exist: ${path}`);
    }
    const files = await readdir(path);
    const accountConfigTokens: AccountConfigFileToken[] =
      files.map(accountConfigToken);
    return {
      global: true,
      module: AccountConfigModule,
      imports: [
        ...accountConfigTokens.map((item) =>
          AccountConfigModule.forAccount(path, item.file, item.token)
        ),
      ],
      providers: [
        accountConfigsProvider(
          accountConfigsToken,
          ...accountConfigTokens.map((item) => item.token)
        ),
      ],
      exports: [accountConfigsToken],
    };
  }
}

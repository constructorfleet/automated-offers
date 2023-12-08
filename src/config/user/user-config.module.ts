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
import { UserConfig } from "./user.config";

export const UserConfigs: InjectionToken = "User.Configs";
export type UserConfigs = UserConfig[];

type UserConfigFileToken = {
  file: string;
  token: InjectionToken;
};

const userConfigToken = (file: string, index: number): UserConfigFileToken => ({
  file,
  token: `UserConfig${file.replace(/\.\w+$/, "")}`,
});

const userConfigProvider = (token: InjectionToken): FactoryProvider => ({
  provide: token,
  inject: [UserConfig],
  useFactory: (config: UserConfig): UserConfig => config,
});

const userConfigsProvider = (
  token: InjectionToken,
  ...userConfigTokens: InjectionToken[]
): FactoryProvider => ({
  provide: token,
  inject: [...userConfigTokens],
  useFactory: (...configs: UserConfig[]): UserConfig[] => configs,
});

@Module({})
class UserConfigModule {
  static forUser(
    userConfigDirectory: string,
    userConfigFile: string,
    token: InjectionToken
  ): DynamicModule {
    return {
      module: UserConfigModule,
      imports: [
        TypedConfigModule.forRoot({
          schema: UserConfig,
          load: [
            fileLoader({
              absolutePath: resolve(
                joinPath(userConfigDirectory, userConfigFile)
              ),
              ignoreEnvironmentVariableSubstitution: false,
            }),
          ],
        }),
      ],
      providers: [userConfigProvider(token)],
      exports: [token],
    };
  }
}

@Module({})
export class UsersConfigModule {
  static async forRoot(
    appConfigDirectory: string = joinPath(process.cwd(), "config"),
    userConfigDirectory = "users",
    userConfigsToken = UserConfigs
  ): Promise<DynamicModule> {
    const path = resolve(joinPath(appConfigDirectory, userConfigDirectory));
    if (!existsSync(path)) {
      throw new Error(`User configuration path does not exist: ${path}`);
    }
    const files = await readdir(path);
    const userConfigTokens: UserConfigFileToken[] = files.map(userConfigToken);
    return {
      global: true,
      module: UserConfigModule,
      imports: [
        ...userConfigTokens.map((item) =>
          UserConfigModule.forUser(path, item.file, item.token)
        ),
      ],
      providers: [
        userConfigsProvider(
          userConfigsToken,
          ...userConfigTokens.map((item) => item.token)
        ),
      ],
      exports: [userConfigsToken],
    };
  }
}

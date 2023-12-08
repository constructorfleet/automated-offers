import { Inject, Injectable } from "@nestjs/common";
import { WebDriver } from "selenium-webdriver";
import { Loggable, SystemVariable, VariableMap, setVariable } from "src/common";
import { UserAccountConfig, UserConfig, UserConfigs } from "src/config";
import { AccountHandlers } from "../account";
import {
  InjectWebDriverFactory,
  WebDriverFactory,
} from "../browser/browser.providers";
import { UserCredentialsService } from "./credentials/user-credentials.service";

@Injectable()
export class UserHandler extends Loggable {
  private index: number = -1;
  private webDriver: WebDriver = undefined;

  constructor(
    @InjectWebDriverFactory
    private readonly driverFactory: WebDriverFactory,
    private readonly accountMap: AccountHandlers,
    @Inject(UserConfigs)
    private readonly userConfigs: UserConfigs,
    private readonly credentialService: UserCredentialsService
  ) {
    super();
  }
  private get userConfig(): UserConfig {
    return this.userConfigs.at(this.index);
  }

  get id(): string | undefined {
    return this.userConfig.id;
  }

  get accounts(): UserAccountConfig[] {
    return this.userConfig.accounts;
  }

  get driver(): WebDriver | undefined {
    return this.webDriver;
  }

  async next(): Promise<boolean> {
    if (this.webDriver) {
      await this.webDriver?.close();
    }
    this.index++;
    if (this.index >= this.userConfigs.length) {
      return false;
    }
    this.webDriver = await this.driverFactory(this.userConfig);
    return true;
  }

  async handle(variableMap?: VariableMap): Promise<VariableMap> {
    variableMap = setVariable(SystemVariable.USER, this.id, variableMap);
    try {
      const accounts = this.accounts.map((account) => ({
        type: account.type,
        handler: this.accountMap.for(account),
        credentials: account.credentials,
      }));
      for (const account of accounts) {
        variableMap = setVariable(
          SystemVariable.ACCOUNT,
          account.type,
          variableMap
        );
        this.logger.log(
          `Processing account ${account.type} for user ${this.id}`
        );
        variableMap = await account.handler.handle(
          this.driver,
          variableMap,
          this.credentialService.for(account.credentials)
        );
      }
      return variableMap;
    } catch (e) {
      this.logger.error(`Unexpected error while processing account`, e);
      return variableMap;
    } finally {
      this.logger.debug(`Closing browser`);
      await this.webDriver.close();
      this.webDriver = undefined;
    }
  }
  hasNext(): boolean {
    return this.userConfigs.length > this.index;
  }
}

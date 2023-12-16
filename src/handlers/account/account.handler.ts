import { Injectable } from "@nestjs/common";
import { WebDriver } from "selenium-webdriver";
import { Loggable, VariableMap } from "src/common";
import { AccountConfig, AccountType, StepType } from "src/config";
import { ProvideCredentials } from "../user";
import { InjectAccounts } from "./account.module";
import { AccountHandlerMap } from "./account.providers";
import { StepCreator } from "./steps/step.providers";

@Injectable()
export class AccountHandlers extends Loggable {
  constructor(@InjectAccounts private readonly handlerMap: AccountHandlerMap) {
    super();
  }

  for({ type }: { type: AccountType }): AccountHandler | undefined {
    return this.handlerMap[type];
  }
}

@Injectable()
export class AccountHandler extends Loggable {
  constructor(
    private readonly config: AccountConfig,
    private readonly stepFactory: StepCreator<StepType>
  ) {
    super();
  }

  async handle(
    driver: WebDriver,
    variableMap: VariableMap,
    credentials: ProvideCredentials
  ): Promise<VariableMap> {
    this.logger.debug(`Opening url ${this.config.url.toString()}`);
    await driver.get(this.config.url.toString());
    for (const step of this.config.steps) {
      variableMap = await this.stepFactory(step).run(
        driver,
        variableMap,
        credentials
      );
    }
    return variableMap;
  }
}

import { ModuleRef } from "@nestjs/core";
import { WebDriver, WebElement } from "selenium-webdriver";
import { Loggable, VariableMap } from "src/common";
import { ActionConfig, Actions, StepType } from "src/config";
import { ProvideCredentials } from "src/handlers/user";
import { StepCreator, StepCreatorKey } from "../step.providers";

export abstract class ActionHandler<
  Config extends ActionConfig<Actions>,
> extends Loggable {
  protected constructor(
    protected readonly config: Config,
    protected readonly moduleRef: ModuleRef
  ) {
    super();
  }

  get stepCreator(): StepCreator<StepType> {
    return this.moduleRef.get(StepCreatorKey, {
      strict: false,
    });
  }

  async execute(
    element: WebElement,
    variableMap: VariableMap,
    credentials: ProvideCredentials,
    driver: WebDriver
  ): Promise<VariableMap> {
    this.logger.log(`Executing ${this.config.type}`);
    const result = await this.handle(driver, element, variableMap, credentials);
    if (result instanceof Object) {
      return result;
    }
    return variableMap;
  }

  protected abstract handle(
    driver: WebDriver,
    element: WebElement,
    variableMap: VariableMap,
    credentials: ProvideCredentials
  ): Promise<VariableMap | void>;
}

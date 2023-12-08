import { ModuleRef } from "@nestjs/core";
import { WebDriver, WebElement } from "selenium-webdriver";
import { VariableMap } from "src/common";
import { StepActionConfig, StepActionType } from "src/config";
import { ProvideCredentials } from "src/handlers/user";
import { ActionHandler } from "./action.handler";
import { RegisterAction } from "./action.providers";

@RegisterAction(StepActionType)
export class StepActionHandler extends ActionHandler<StepActionConfig> {
  constructor(config: StepActionConfig, moduleRef: ModuleRef) {
    super(config, moduleRef);
  }
  protected async handle(
    driver: WebDriver,
    element: WebElement,
    variableMap: VariableMap,
    credentials: ProvideCredentials
  ): Promise<void | VariableMap> {
    return await this.stepCreator(this.config.step).run(
      driver,
      variableMap,
      credentials
    );
  }
}

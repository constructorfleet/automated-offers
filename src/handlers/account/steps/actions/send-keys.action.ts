import { ModuleRef } from "@nestjs/core";
import { WebDriver, WebElement } from "selenium-webdriver";
import { VariableMap, getVariable } from "src/common";
import {
  SendKeysActionType as SendKeys,
  SendKeysActionConfig,
  SendVariableOption,
} from "src/config";
import { ProvideCredentials } from "src/handlers/user";
import { ActionHandler } from "./action.handler";
import { RegisterAction } from "./action.providers";

@RegisterAction(SendKeys)
export class SendKeysAction extends ActionHandler<SendKeysActionConfig> {
  readonly select: "first";
  constructor(config: SendKeysActionConfig, moduleRef: ModuleRef) {
    super(config, moduleRef);
  }
  protected async handle(
    driver: WebDriver,
    element: WebElement,
    variableMap: VariableMap,
    credentials: ProvideCredentials
  ): Promise<void> {
    let value = undefined;
    if (this.config.send === SendVariableOption) {
      value = getVariable(this.config.variablePath, variableMap);
    } else {
      value = await credentials(this.config.send);
    }
    await element.sendKeys(value);
  }
}

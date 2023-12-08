import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { WebDriver, WebElement } from "selenium-webdriver";
import { ClickActionType as Click, ClickActionConfig } from "src/config";
import { ActionHandler } from "./action.handler";
import { RegisterAction } from "./action.providers";

@Injectable()
@RegisterAction(Click)
export class ClickAction extends ActionHandler<ClickActionConfig> {
  readonly select: "first";
  constructor(config: ClickActionConfig, moduleRef: ModuleRef) {
    super(config, moduleRef);
  }

  async handle(driver: WebDriver, element: WebElement): Promise<void> {
    await driver.executeScript(`arguments[0].click()`, element);
  }
}

import { ModuleRef } from "@nestjs/core";
import { WebDriver, WebElement } from "selenium-webdriver";
import { VariableMap, resolveTemplateString, setVariable } from "src/common";
import { TextActionType as Text, TextActionConfig } from "src/config";
import { ActionHandler } from "./action.handler";
import { RegisterAction } from "./action.providers";

const removeStartAnchor = (captureGroup: string): string =>
  captureGroup.startsWith("^") ? captureGroup.slice(1) : captureGroup;
const removeEndAnchor = (captureGroup: string): string =>
  captureGroup.endsWith("$")
    ? captureGroup.slice(0, captureGroup.length - 1)
    : captureGroup;
const removeAnchors = (captureGroup: string): string =>
  removeStartAnchor(removeEndAnchor(captureGroup));
const startAnchor = (captureGoup: string) =>
  captureGoup.startsWith("^") ? "^" : "";
const endAnchor = (captureGroup: string) =>
  captureGroup.endsWith("$") ? "$" : "";
const regex = (variable: string, captureGroup: string): RegExp =>
  new RegExp(
    `${startAnchor(captureGroup)}(?<${variable}>${removeAnchors(
      captureGroup
    )})${endAnchor(captureGroup)}`
  );
const getGroup = (variable: string, match: RegExpMatchArray): string =>
  variable in (match.groups ?? {}) ? match.groups[variable] : null;

@RegisterAction(Text)
export class TextAction extends ActionHandler<TextActionConfig> {
  constructor(config: TextActionConfig, moduleRef: ModuleRef) {
    super(config, moduleRef);
  }

  private getVariablePath(variableMap) {
    if (this.config.storeUnder) {
      const storeUnder = resolveTemplateString(
        this.config.storeUnder,
        variableMap
      );
      return [...storeUnder.split("."), this.config.variableName];
    }
    return [this.config.variableName];
  }

  protected async handle(
    driver: WebDriver,
    element: WebElement,
    variableMap: VariableMap
  ): Promise<VariableMap> {
    this.logger.log(`Processing element text`);
    const text = await element.getText();
    this.logger.debug(`Raw: ${text}`);
    if (!this.config.regexCaptureGroups) {
      return setVariable(
        this.getVariablePath(variableMap).join("."),
        text,
        variableMap
      );
    }
    let result = Object.entries(this.config.regexCaptureGroups || {}).reduce(
      (result, [variable, captureGroup]) => {
        result[variable] = getGroup(
          variable,
          text.match(regex(variable, captureGroup))
        );
        return result;
      },
      {}
    );
    if (this.config.stringify) {
      result = resolveTemplateString(this.config.stringify, result);
    }
    this.logger.debug(`Result: ${result}`);
    return setVariable(
      this.getVariablePath(variableMap).join("."),
      result,
      variableMap
    );
  }
}

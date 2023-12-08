import { By, WebDriver, WebElement, until } from "selenium-webdriver";
import {
  Loggable,
  VariableMap,
  replaceTemplatedString,
  setVariable,
} from "src/common";
import {
  SelectAll,
  SelectFirst,
  SelectorConfig,
  SelectorType,
} from "src/config";
import { ProvideCredentials } from "src/handlers/user";
import { RegisterSelector } from "./selector.providers";
export type ProcessElement = (
  element: WebElement | undefined,
  driver: WebDriver,
  variableMap: VariableMap,
  credentials: ProvideCredentials
) => Promise<VariableMap>;
export type SelectorResult<Selector extends SelectorType> =
  Selector extends SelectAll
    ? WebElement[] | undefined
    : Selector extends SelectFirst
      ? WebElement | undefined
      : never;

export abstract class SelectorHandler<
  Selector extends SelectorType,
  Result = SelectorResult<Selector>,
> extends Loggable {
  protected get timeout(): number {
    return this.config.timeout;
  }
  protected get cssSelector(): string {
    return this.config.cssSelector;
  }
  protected get templateReplacers(): Map<string, string> | undefined {
    return this.config.templateReplacers;
  }
  protected get shadowRootSelector(): string[] | undefined {
    return this.config.shadowRootCSSSelector;
  }
  protected get iFrameSelector(): string | undefined {
    return this.config.iFrameSelector;
  }

  protected constructor(protected readonly config: SelectorConfig) {
    super();
  }

  abstract process(
    driver: WebDriver,
    variableMap: VariableMap,
    credentials: ProvideCredentials,
    process: ProcessElement
  ): Promise<VariableMap>;

  protected async select(
    driver: WebDriver,
    variableMap: VariableMap
  ): Promise<Result> {
    try {
      await this.switchFrame(driver);
      let result = await this.locate(driver, variableMap);
      if (!this.shadowRootSelector) {
        return result;
      }
      for (let i = 0; i < this.shadowRootSelector.length; i++) {
        result = await this.findShadowResult(
          result,
          this.shadowRootSelector[i],
          variableMap
        );
      }
      return result;
    } catch (err) {
      this.logger.error(err);
      return undefined;
    }
  }

  private async switchFrame(driver: WebDriver) {
    try {
      this.logger.debug("Switching to default content");
      await driver.switchTo().defaultContent();
      if (!!this.iFrameSelector && this.iFrameSelector !== "default") {
        this.logger.debug(`Switching to iFrame ${this.iFrameSelector}`);
        // await driver.executeScript(
        //   "arguments[0].scrollIntoViewIfNeeded(true)",
        //   await driver.findElement(By.css(this.iFrameSelector))
        // );
        await driver.wait(
          until.ableToSwitchToFrame(By.css(this.iFrameSelector)),
          this.timeout
        );
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  private async locate(
    driver: WebDriver,
    variableMap: VariableMap
  ): Promise<Result> {
    try {
      const selector = replaceTemplatedString(
        this.cssSelector,
        variableMap,
        this.templateReplacers
      );
      this.logger.debug(`Locating ${selector}`);
      return await this.untilLocated(driver, selector);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  private async findShadowResult(
    root: Result,
    shadowCssSelector: string,
    variableMap: VariableMap
  ): Promise<Result> {
    try {
      const selector = replaceTemplatedString(
        shadowCssSelector,
        variableMap,
        this.templateReplacers
      );
      this.logger.debug(`Finding shadow root ${selector}`);
      return await this.findShadow(root, selector);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  protected abstract untilLocated(
    driver: WebDriver,
    cssSelector: string
  ): Promise<Result>;
  protected abstract findShadow(
    root: Result,
    cssSelector: string
  ): Promise<Result>;
}

@RegisterSelector(SelectFirst)
export class SelectFirstHandler extends SelectorHandler<SelectFirst> {
  constructor(config: SelectorConfig) {
    super(config);
  }

  async process(
    driver: WebDriver,
    variableMap: VariableMap,
    credentials: ProvideCredentials,
    process: ProcessElement
  ): Promise<VariableMap> {
    const selection = await this.select(driver, variableMap);
    try {
      await driver.executeScript(
        "arguments[0].scrollIntoViewIfNeeded(true)",
        selection
      );
      return await process(selection, driver, variableMap, credentials);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  protected async findShadow(
    root: WebElement,
    cssSelector: string
  ): Promise<WebElement> {
    try {
      const shadowRoot = await root.getShadowRoot();
      return await shadowRoot.findElement(By.css(cssSelector));
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  protected async untilLocated(
    driver: WebDriver,
    cssSelector: string
  ): Promise<WebElement> {
    try {
      const element = await driver.wait(
        until.elementLocated(By.css(cssSelector)),
        this.timeout
      );
      this.logger.debug("Waiting until visible...");
      await driver.wait(until.elementIsVisible(element), this.timeout);
      return element;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

@RegisterSelector(SelectAll)
export class SelectAllHandler extends SelectorHandler<SelectAll> {
  constructor(config: SelectorConfig) {
    super(config);
  }

  async process(
    driver: WebDriver,
    variableMap: VariableMap,
    credentials: ProvideCredentials,
    process: ProcessElement
  ): Promise<VariableMap> {
    let index = 0;
    let selection = await this.select(driver, variableMap);
    variableMap = setVariable(
      this.config.elementCountVariable,
      selection.length,
      variableMap
    );
    try {
      while (index < selection.length) {
        variableMap = setVariable(
          this.config.elementIndexVariable,
          index,
          variableMap
        );
        await driver.executeScript(
          "arguments[0].scrollIntoViewIfNeeded(true)",
          selection[index]
        );
        variableMap = await process(
          selection[index],
          driver,
          variableMap,
          credentials
        );
        selection = await this.select(driver, variableMap);
        index++;
      }
      return variableMap;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  protected async findShadow(
    roots: WebElement[],
    cssSelector: string
  ): Promise<WebElement[]> {
    const elements = await Promise.all(
      roots.map(async (root) => {
        const shadowRoot = await root.getShadowRoot();
        return shadowRoot.findElements(By.css(cssSelector));
      })
    );
    return elements.flat();
  }

  protected async untilLocated(
    driver: WebDriver,
    cssSelector: string
  ): Promise<WebElement[]> {
    try {
      const elements = await driver.wait(
        until.elementsLocated(By.css(cssSelector)),
        this.timeout
      );
      this.logger.debug("Waiting until visible...");
      await driver.wait(until.elementIsVisible(elements[0]), this.timeout);
      return elements;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

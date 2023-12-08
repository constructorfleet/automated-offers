import { WebDriver, WebElement } from "selenium-webdriver";
import { getVariable, setVariable } from "src/common";
import { Loggable, VariableMap } from "src/common/types";
import {
  ActionConfig,
  Actions,
  IterationCount,
  IterationCountConfig,
  NotFound,
  SelectorType,
  SingleStep,
  StepConfigShape,
  StepType,
} from "src/config";
import { ProvideCredentials } from "src/handlers/user";
import { ActionCreator } from "./actions";
import { SelectorCreator } from "./selectors";
import { RegisterStep } from "./step.providers";

export abstract class StepHandler<Step extends StepType> extends Loggable {
  protected get type(): Step {
    return this.config.type as Step;
  }
  protected get actions(): ActionConfig<Actions>[] {
    return this.config.actions ?? [];
  }

  constructor(
    protected readonly config: StepConfigShape,
    protected readonly selectorFactory: SelectorCreator<SelectorType>,
    protected readonly actionFactory: ActionCreator<ActionConfig<Actions>>
  ) {
    super();
  }

  async run(
    driver: WebDriver,
    variableMap: VariableMap,
    credentials: ProvideCredentials
  ): Promise<VariableMap> {
    this.logger.log(this.config.name);
    try {
      return await this.selectorFactory(this.config).process(
        driver,
        variableMap,
        credentials,
        async (element, driver, variableMap, credentials) => {
          return this.handle(element, driver, variableMap, credentials);
        }
      );
    } catch (err) {
      if (this.config.isOptional) {
        return variableMap;
      }
      throw err;
    }
  }

  protected async execute(
    element: WebElement,
    driver: WebDriver,
    variableMap: VariableMap,
    credentials: ProvideCredentials
  ): Promise<VariableMap> {
    if (!element) {
      throw new Error("Element is undefined");
    }
    for (const config of this.actions) {
      variableMap = await this.actionFactory(config).execute(
        element,
        variableMap,
        credentials,
        driver
      );
    }
    return variableMap;
  }

  protected async handle(
    element: WebElement | undefined,
    driver: WebDriver,
    variableMap: VariableMap,
    credentials: ProvideCredentials
  ): Promise<VariableMap> {
    return await this.execute(element, driver, variableMap, credentials);
  }
}

@RegisterStep(SingleStep)
export class SingleStepHandler extends StepHandler<SingleStep> {}

@RegisterStep(NotFound)
export class WhileFoundStephandler extends StepHandler<NotFound> {
  private get offset(): number {
    return this.config.repeat?.offset;
  }

  constructor(
    config: StepConfigShape,
    selector: SelectorCreator<SelectorType>,
    actionFactory: ActionCreator<ActionConfig<Actions>>
  ) {
    super(config, selector, actionFactory);
  }

  protected async handle(
    element: WebElement | undefined,
    driver: WebDriver,
    variableMap: VariableMap,
    credentials: ProvideCredentials
  ): Promise<VariableMap> {
    if (!element) {
      return variableMap;
    }
    return await this.execute(element, driver, variableMap, credentials);
  }
}

@RegisterStep(IterationCount)
export class LoopStep extends StepHandler<IterationCount> {
  private get countVariable(): string {
    return (this.config.repeat as IterationCountConfig)?.countVariable;
  }
  private get indexVariable(): string {
    return (this.config.repeat as IterationCountConfig)?.indexVariable;
  }
  private get offset(): number {
    return (this.config.repeat as IterationCountConfig)?.offset;
  }

  constructor(
    config: StepConfigShape,
    selector: SelectorCreator<SelectorType>,
    actionFactory: ActionCreator<ActionConfig<Actions>>
  ) {
    super(config, selector, actionFactory);
  }

  async run(
    driver: WebDriver,
    variableMap: VariableMap,
    credentials: ProvideCredentials
  ): Promise<VariableMap> {
    this.logger.log(this.config.name);
    try {
      const count =
        getVariable(this.countVariable, variableMap, (val) =>
          Number.parseInt(val.toString())
        ) + this.offset;
      for (let i = this.offset; i < count; i++) {
        variableMap = setVariable(this.indexVariable, i, variableMap);
        variableMap = await this.selectorFactory(this.config).process(
          driver,
          variableMap,
          credentials,
          async (element, driver, variableMap, credentials) => {
            return this.handle(element, driver, variableMap, credentials);
          }
        );
      }
      return variableMap;
    } catch (err) {
      if (this.config.isOptional) {
        return variableMap;
      }
      throw err;
    }
  }
}

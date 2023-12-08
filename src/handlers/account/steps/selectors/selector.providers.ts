import { FactoryProvider, Inject } from "@nestjs/common";
import { ClassConstructor } from "class-transformer";
import { SelectorConfig, SelectorType } from "src/config";
import { SelectorHandler } from "./selector.handler";

export type SelectorCreator<
  Selector extends SelectorType,
  HandlerType = SelectorHandler<Selector>,
> = (config: SelectorConfig) => HandlerType;
export const selectorConfigHandlers: Record<
  SelectorType,
  ClassConstructor<SelectorHandler<SelectorType>>
> = {} as Record<SelectorType, ClassConstructor<SelectorHandler<SelectorType>>>;

export const RegisterSelector =
  <
    T extends ClassConstructor<
      SelectorHandler<
        "first" | "all",
        | import("selenium-webdriver").WebElement
        | import("selenium-webdriver").WebElement[]
      >
    >,
  >(
    select: SelectorType
  ) =>
  (handlerConstructor: T) => {
    selectorConfigHandlers[select] = handlerConstructor;
  };
export const SelectorCreatorKey = "Selector.Factory";
export const InjectSelectorFactory = Inject(SelectorCreatorKey);
export const SelectorFactoryProvider: FactoryProvider = {
  provide: SelectorCreatorKey,
  useFactory:
    () =>
    (config: SelectorConfig): SelectorHandler<SelectorType> => {
      const constructor = exports.selectorConfigHandlers[config.select];
      if (!constructor) {
        throw new Error(`Unable to find handler for select: ${config.select}`);
      }
      return new constructor(config);
    },
};

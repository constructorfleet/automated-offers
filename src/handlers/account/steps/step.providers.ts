import { FactoryProvider, Inject } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { ClassConstructor } from "class-transformer";
import {
  SelectorType,
  SingleStep,
  StepConfigShape,
  StepType,
} from "src/config";
import { ActionFactoryKey } from "./actions";
import { SelectorCreator, SelectorCreatorKey } from "./selectors";
import { StepHandler } from "./step.handler";

export type StepCreator<
  Step extends StepType,
  HandlerType = StepHandler<Step>,
> = (config: StepConfigShape) => HandlerType;
export const stepConfigHandlers: Record<
  StepType,
  ClassConstructor<StepHandler<StepType>>
> = {} as Record<StepType, ClassConstructor<StepHandler<StepType>>>;

export const RegisterStep =
  <T extends ClassConstructor<StepHandler<"notFound" | "count" | "single">>>(
    select: StepType
  ) =>
  (handlerConstructor: T) => {
    stepConfigHandlers[select] = handlerConstructor;
  };
export const StepCreatorKey = "Step.Factory" as const;
export const InjectStepFactory = Inject(StepCreatorKey);

export const StepFactoryProvider: FactoryProvider = {
  provide: StepCreatorKey,
  inject: [SelectorCreatorKey, ModuleRef],
  useFactory:
    (selectorFactory: SelectorCreator<SelectorType>, moduleRef) => (config) => {
      const constructor =
        exports.stepConfigHandlers[config.repeat?.until || SingleStep];
      if (!constructor) {
        throw new Error(
          `Unable to find handler for step config: ${config.type}`
        );
      }
      const actionFactory = moduleRef.get(ActionFactoryKey, {
        strict: false,
      });
      return new constructor(config, selectorFactory, actionFactory);
    },
};

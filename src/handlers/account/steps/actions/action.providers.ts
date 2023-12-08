import { FactoryProvider, Inject } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { ClassConstructor } from "class-transformer";
import { ActionConfig, Actions } from "src/config";
import { ActionHandler } from "./action.handler";

const actionConfigHandlers = {};

export type ActionCreator<
  Config extends ActionConfig<Actions>,
  HandlerType = ActionHandler<Config>,
> = (config: Config) => HandlerType;

export const RegisterAction =
  <T extends ClassConstructor<ActionHandler<ActionConfig<Actions>>>>(
    actionConfigType: Actions
  ) =>
  (handlerConstructor: T) => {
    actionConfigHandlers[actionConfigType] = handlerConstructor;
  };

export const ActionFactoryKey: "Action.Factory" = "Action.Factory" as const;
export const InjectActionFactory = Inject(ActionFactoryKey);
export const ActionFactoryProvider: FactoryProvider = {
  provide: ActionFactoryKey,
  inject: [ModuleRef],
  useFactory: (moduleRef: ModuleRef) => {
    return (config: ActionConfig<Actions>) => {
      const constructor = actionConfigHandlers[config.type];
      if (!constructor) {
        throw new Error(
          `Unable to find handler for action config: ${config.type}`
        );
      }
      return new constructor(config, moduleRef);
    };
  },
};

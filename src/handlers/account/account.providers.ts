import { FactoryProvider } from "@nestjs/common";
import {
  AccountConfig,
  AccountConfigs,
  AccountType,
  StepType,
} from "src/config";
import { AccountHandler } from "./account.handler";
import { StepHandler } from "./steps";
import { StepCreator, StepCreatorKey } from "./steps/step.providers";

export const AccountStepsKey = "Account.Steps";
export const AccountHandlersKey = "Account.Handlers";

export type AccountHandlerMap = Record<AccountType, AccountHandler>;
export type StepFactory = (config: AccountConfig) => StepHandler<StepType>[];

export const StepHandlers = {
  provide: AccountStepsKey,
  inject: [StepCreatorKey],
  useFactory:
    (factory: StepCreator<StepType>): StepFactory =>
    (config: AccountConfig) =>
      config.steps.map(factory),
};
export const AccountHandlersProvider: FactoryProvider = {
  provide: AccountHandlersKey,
  inject: [AccountConfigs, StepCreatorKey],
  useFactory: (
    configs: AccountConfigs,
    stepFactory: StepCreator<StepType>
  ): AccountHandlerMap => {
    return Object.fromEntries(
      configs.map((config) => [
        config.type,
        new AccountHandler(config, stepFactory),
      ])
    );
  },
};

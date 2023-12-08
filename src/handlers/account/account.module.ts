import { DynamicModule, Inject, Module } from "@nestjs/common";
import { AccountsConfigModule } from "src/config";
import { AccountHandlers } from "./account.handler";
import {
  AccountHandlersKey,
  AccountHandlersProvider,
  AccountStepsKey,
  StepHandlers,
} from "./account.providers";
import { StepsModule } from "./steps";

export const InjectSteps = Inject(AccountStepsKey);
export const InjectAccounts = Inject(AccountHandlersKey);

@Module({})
export class AccountsModule {
  static forRoot(): DynamicModule {
    return {
      module: AccountsModule,
      imports: [AccountsConfigModule, StepsModule.forRoot()],
      providers: [StepHandlers, AccountHandlersProvider, AccountHandlers],
      exports: [AccountHandlers],
    };
  }
}

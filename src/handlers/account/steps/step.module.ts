import { DynamicModule, Module } from "@nestjs/common";
import { ActionsModule } from "./actions";
import { SelectorModule } from "./selectors";
import { StepCreatorKey, StepFactoryProvider } from "./step.providers";

@Module({})
export class StepsModule {
  static forRoot(): DynamicModule {
    return {
      module: StepsModule,
      imports: [ActionsModule, SelectorModule],
      providers: [StepFactoryProvider],
      exports: [StepCreatorKey],
    };
  }
}

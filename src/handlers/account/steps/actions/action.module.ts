import { Module } from "@nestjs/common";
import { ActionFactoryProvider } from "./action.providers";
import { ClickAction } from "./click.action";
import { SendKeysAction } from "./send-keys.action";
import { StepActionHandler } from "./step.action";
import { TextAction } from "./text.action";

const actions = [ClickAction, SendKeysAction, StepActionHandler, TextAction];
@Module({
  providers: [ActionFactoryProvider],
  exports: [ActionFactoryProvider.provide],
})
export class ActionsModule {}

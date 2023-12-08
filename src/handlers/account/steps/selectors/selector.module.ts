import { Module } from "@nestjs/common";
import { SelectorFactoryProvider } from "./selector.providers";

@Module({
  providers: [SelectorFactoryProvider],
  exports: [SelectorFactoryProvider.provide],
})
export class SelectorModule {}

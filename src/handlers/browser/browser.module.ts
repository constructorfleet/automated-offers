import { DynamicModule, Module } from "@nestjs/common";
import { AppConfigModule } from "src/config";
import { BrowserOptions, WebDriverFactoryProvider } from "./browser.providers";

@Module({})
export class BrowserModule {
  static forRoot(): DynamicModule {
    return {
      module: BrowserModule,
      imports: [AppConfigModule],
      providers: [BrowserOptions, WebDriverFactoryProvider],
      exports: [WebDriverFactoryProvider.provide],
    };
  }
}

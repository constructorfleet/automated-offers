import { FactoryProvider, Inject } from "@nestjs/common";
import { Builder, WebDriver } from "selenium-webdriver";
import { Options as ChromeOptions } from "selenium-webdriver/chrome";
import { AppConfig, UserConfig } from "src/config";

export const BrowserOptionsKey = "Browser.Options";
export const BrowserOptions: FactoryProvider = {
  provide: BrowserOptionsKey,
  inject: [AppConfig],
  useFactory: (appConfig) =>
    new ChromeOptions()
      .addArguments("--no-sandbox")
      .addArguments(`--user-data-dir=${appConfig.browserData}`),
};

export const WebDriverFactoryKey = "Browser.Driver.Factory";
export const InjectWebDriverFactory = Inject(WebDriverFactoryKey);
export type WebDriverFactory = (userConfig: UserConfig) => Promise<WebDriver>;

export const WebDriverFactoryProvider: FactoryProvider = {
  provide: WebDriverFactoryKey,
  inject: [AppConfig],
  useFactory:
    (appConfig: AppConfig): WebDriverFactory =>
    async (userConfig: UserConfig) => {
      let options = new ChromeOptions()
        .addArguments("--no-sandbox")
        .addArguments(`--user-data-dir=${appConfig.browserData}`)
        .addArguments(`--profile-directory=${userConfig.id}`);
      if (appConfig.headless) {
        options = options
          .addArguments("--headless")
          .addArguments("--window-size=1980,1080");
      }
      return new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();
    },
};

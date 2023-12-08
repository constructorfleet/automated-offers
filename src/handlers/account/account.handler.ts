import { Injectable } from "@nestjs/common";
import { appendFile, mkdir } from "fs/promises";
import * as yaml from "js-yaml";
import { join } from "path";
import { WebDriver } from "selenium-webdriver";
import {
  Loggable,
  SystemVariable,
  VariableMap,
  cleanVariables,
  getVariable,
  resolveTemplateString,
} from "src/common";
import { AccountConfig, AccountType, OutputConfig, StepType } from "src/config";
import { ProvideCredentials } from "../user";
import { InjectAccounts } from "./account.module";
import { AccountHandlerMap } from "./account.providers";
import { StepCreator } from "./steps/step.providers";

@Injectable()
export class AccountHandlers extends Loggable {
  constructor(@InjectAccounts private readonly handlerMap: AccountHandlerMap) {
    super();
  }

  for({ type }: { type: AccountType }): AccountHandler | undefined {
    return this.handlerMap[type];
  }
}

@Injectable()
export class AccountHandler extends Loggable {
  constructor(
    private readonly config: AccountConfig,
    private readonly stepFactory: StepCreator<StepType>
  ) {
    super();
  }

  async handle(
    driver: WebDriver,
    variableMap: VariableMap,
    credentials: ProvideCredentials
  ): Promise<VariableMap> {
    this.logger.debug(`Opening url ${this.config.url.toString()}`);
    await driver.get(this.config.url.toString());
    for (const step of this.config.steps) {
      variableMap = await this.stepFactory(step).run(
        driver,
        variableMap,
        credentials
      );
    }

    await this.saveOutput(variableMap);
    return variableMap;
  }

  async saveOutput(variableMap: VariableMap): Promise<void> {
    const output: OutputConfig | undefined = getVariable(
      SystemVariable.OUTPUT,
      variableMap
    );
    if (!output || !output.file) {
      this.logger.warn("No output found");
      return;
    }
    try {
      let outputFile = resolveTemplateString(output.file, variableMap);
      if (output.path) {
        const outputPath = resolveTemplateString(output.path, variableMap);
        await mkdir(outputPath, { recursive: true });
        outputFile = join(outputPath, outputFile);
      }
      console.dir(variableMap);
      await appendFile(outputFile, yaml.dump(cleanVariables(variableMap)), {
        encoding: "utf-8",
      });
    } catch (err) {
      console.error(err);
    }
  }
}

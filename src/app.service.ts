import { Injectable } from "@nestjs/common";
import { appendFile, mkdir } from "fs/promises";
import * as yaml from "js-yaml";
import { join } from "path";
import {
  Loggable,
  SystemVariable,
  VariableMap,
  cleanVariables,
  resolveTemplateString,
  setVariable,
} from "./common";
import { AppConfig, OutputConfig } from "./config/app/app.config";
import { UserHandler } from "./handlers/user/user.handler";

@Injectable()
export class AppService extends Loggable {
  private readonly startTime = new Date().toISOString();

  constructor(
    private readonly appConfig: AppConfig,
    private readonly users: UserHandler
  ) {
    super();
  }

  private getVariableMap(): VariableMap {
    let systemMap = {};
    systemMap = setVariable(
      SystemVariable.DATE,
      new Date().toISOString(),
      systemMap
    );
    systemMap = setVariable(
      SystemVariable.OUTPUT,
      this.appConfig.output,
      systemMap
    );

    return systemMap;
  }

  async saveOutput(variableMap: VariableMap): Promise<void> {
    const output: OutputConfig | undefined =
      this.appConfig.output; /*getVariable(
      SystemVariable.OUTPUT,
      variableMap
    );*/
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

  async run(): Promise<void> {
    let variableMap = {};
    while (await this.users.next()) {
      this.logger.log(`Processing user: ${this.users.id}`);
      variableMap[this.users.id] = await this.users.handle(
        this.getVariableMap()
      );
    }
    await this.saveOutput(variableMap);
  }
}

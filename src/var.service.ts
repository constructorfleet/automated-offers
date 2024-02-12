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
import { AccountType, AppConfig, OutputConfig, UserType } from "./config";

@Injectable()
export class VarService extends Loggable {
  private variables: VariableMap = this.getSystemVars();

  constructor(private readonly config: AppConfig) {
    super();
  }

  private getSystemVars(): VariableMap {
    let systemMap = {};
    systemMap = setVariable(
      SystemVariable.DATE,
      new Date().toISOString(),
      systemMap
    );
    systemMap = setVariable(
      SystemVariable.OUTPUT,
      this.config.output,
      systemMap
    );
    systemMap = setVariable(SystemVariable.USERS, {}, systemMap);

    return systemMap;
  }

  setUserAccount(
    userId: UserType,
    account: AccountType,
    accountVars: VariableMap
  ) {
    this.variables = setVariable(
      [SystemVariable.USERS, userId, SystemVariable.ACCOUNTS, account].join(
        "."
      ),
      accountVars,
      this.variables
    );
  }

  async saveOutput(variableMap: VariableMap): Promise<void> {
    const output: OutputConfig | undefined = this.config.output;
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
      await appendFile(outputFile, yaml.dump(cleanVariables(variableMap)), {
        encoding: "utf-8",
      });
    } catch (err) {
      console.error(err);
    }
  }
}

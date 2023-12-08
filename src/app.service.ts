import { Injectable } from "@nestjs/common";
import { Loggable, SystemVariable, setVariable } from "./common";
import { AppConfig } from "./config/app/app.config";
import { UserHandler } from "./handlers/user/user.handler";

@Injectable()
export class AppService extends Loggable {
  constructor(
    private readonly appConfig: AppConfig,
    private readonly users: UserHandler
  ) {
    super();
  }

  async run(): Promise<void> {
    let variableMap = {};
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
    while (await this.users.next()) {
      this.logger.log(`Processing user: ${this.users.id}`);
      variableMap[this.users.id] = await this.users.handle(systemMap);
    }
  }
}

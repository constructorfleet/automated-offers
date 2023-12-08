import { Inject, Module } from "@nestjs/common";
import { WriteStream, createWriteStream } from "fs";
import { resolve } from "path";
import { AppService } from "./app.service";
import {
  AccountConfigs,
  AccountsConfigModule,
  AppConfig,
  AppConfigModule,
  UserConfigs,
  UsersConfigModule,
} from "./config";
import { UserModule } from "./handlers";

@Module({
  imports: [
    AppConfigModule.forRoot("config", "app.yaml"),
    UsersConfigModule.forRoot("config", "users", UserConfigs),
    AccountsConfigModule.forRoot("config", "accounts", AccountConfigs),
    UserModule.forRoot(),
  ],
  providers: [AppService],
})
export class AppModule {
  private readonly standardOutWriteFn: (buffer: string | Uint8Array) => boolean;
  private readonly standardErrWriteFn: (buffer: string | Uint8Array) => boolean;
  private readonly logStream: WriteStream;

  constructor(
    appConfig: AppConfig,
    @Inject(AccountConfigs) accountConfig: AccountConfigs
  ) {
    console.dir(accountConfig, { depth: 14 });
    if (appConfig.log?.file) {
      this.logStream = createWriteStream(resolve(appConfig.log.file), {
        flags: "a",
        encoding: "utf-8",
      });
      this.standardOutWriteFn = process.stdout.write.bind(process.stdout);
      this.standardErrWriteFn = process.stderr.write.bind(process.stderr);
      process.stdout.write = this.outWrite.bind(this);
      process.stderr.write = this.errWrite.bind(this);
    }
  }

  private outWrite(buffer: string | Uint8Array) {
    this.logStream.write(buffer);
    return this.standardOutWriteFn(buffer);
  }

  private errWrite(buffer: string | Uint8Array) {
    this.logStream.write(buffer);
    return this.standardErrWriteFn(buffer);
  }
}

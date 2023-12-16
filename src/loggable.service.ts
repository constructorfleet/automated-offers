import { WriteStream, createWriteStream } from "fs";
import { resolve } from "path";
import { Loggable } from "./common";
import { AppConfig } from "./config";

export abstract class LoggableService extends Loggable {
  private readonly standardOutWriteFn: (buffer: string | Uint8Array) => boolean;
  private readonly standardErrWriteFn: (buffer: string | Uint8Array) => boolean;
  private readonly logStream: WriteStream;

  protected constructor(appConfig: AppConfig) {
    super();
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

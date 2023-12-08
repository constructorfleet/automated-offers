import { Logger } from "@nestjs/common";
export type VariableMap = Record<string, any>;

export const isRecord = (
  test: Record<string, unknown> | unknown
): test is Record<string, unknown> => typeof test === "object";

export abstract class Loggable {
  protected readonly logger: Logger = new Logger(this.constructor.name);
}

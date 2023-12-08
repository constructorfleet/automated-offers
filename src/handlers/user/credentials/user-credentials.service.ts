import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { Loggable } from "src/common";
import { CredentialsConfig } from "src/config";
import { Credentials } from "src/credential-provider";

export type ProvideCredentials = <P extends keyof Credentials>(
  property: P
) => Promise<Credentials[P]>;

@Injectable()
export class UserCredentialsService extends Loggable {
  constructor(private readonly moduleRef: ModuleRef) {
    super();
  }

  for(config: CredentialsConfig): ProvideCredentials {
    const provider = this.moduleRef.get(config.provider, { strict: false });
    return async (p) => {
      const creds = await provider.getCredentials(config);
      return creds[p];
    };
  }
}

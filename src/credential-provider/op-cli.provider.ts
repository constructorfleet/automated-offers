import { OtpField, item } from "@1password/op-js";
import { Injectable } from "@nestjs/common";
import {
  OPCliCredentialProviderConfig,
  OPCliCredentialProviderType,
  OPCredentialsConfig,
} from "src/config";
import { Credentials, CredentialsProvider } from "./credential-provider";
import {
  InjectConfig,
  RegisterCredentialProvider,
} from "./credential-provider.providers";

@Injectable()
@RegisterCredentialProvider(OPCliCredentialProviderType)
export class OPCliCredentialsProvider extends CredentialsProvider<
  OPCliCredentialProviderConfig,
  OPCredentialsConfig
> {
  constructor(
    @InjectConfig(OPCliCredentialProviderType)
    config: OPCliCredentialProviderConfig
  ) {
    super(config);
  }

  async getCredentials({
    vault,
    item: itemName,
  }: OPCredentialsConfig): Promise<Credentials> {
    try {
      this.setEnv();
      const opItem = item.get(`op://${vault}/${itemName}`);
      return {
        username: opItem?.fields?.find(
          (f) => "purpose" in f && f.purpose === "USERNAME"
        )?.value,
        password: opItem?.fields?.find(
          (f) => "purpose" in f && f.purpose === "PASSWORD"
        )?.value,
        otp: (opItem?.fields?.find((f) => f.type === "OTP") as OtpField)?.totp,
      };
    } finally {
      this.unsetEnv();
    }
  }

  private setEnv() {
    if (this.config.token) {
      process.env["OP_SERVICE_ACCOUNT_TOKEN"];
    }
  }

  private unsetEnv() {
    if (this.config.token) {
      delete process.env["OP_SERVICE_ACCOUNT_TOKEN"];
    }
  }
}

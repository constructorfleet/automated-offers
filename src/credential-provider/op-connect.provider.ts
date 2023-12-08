import { FullItem, OPConnect, OnePasswordConnect } from "@1password/connect";
import { FullItemAllOfFields } from "@1password/connect/dist/model/fullItemAllOfFields";
import { Injectable } from "@nestjs/common";
import {
  OPConnectCredentialProviderConfig,
  OPConnectCredentialProviderType,
  OPCredentialsConfig,
} from "src/config";
import { Credentials, CredentialsProvider } from "./credential-provider";
import {
  InjectConfig,
  RegisterCredentialProvider,
} from "./credential-provider.providers";

@Injectable()
@RegisterCredentialProvider(OPConnectCredentialProviderType)
export class OPConnectCredentialsProvider extends CredentialsProvider<
  OPConnectCredentialProviderConfig,
  OPCredentialsConfig
> {
  private client: OPConnect;

  constructor(
    @InjectConfig(OPConnectCredentialProviderType)
    config: OPConnectCredentialProviderConfig
  ) {
    super(config);
  }

  async getCredentials({
    vault,
    item: itemName,
  }: OPCredentialsConfig): Promise<Credentials> {
    if (!this.client) {
      this.client = OnePasswordConnect({
        token: this.config.token,
        serverURL: this.config.url.toString(),
        keepAlive: true,
      });
    }
    const opVault = await this.client.getVaultByTitle(vault);
    if (!opVault) {
      return {};
    }
    const opItem = await this.client.getItemByTitle(opVault.id, itemName);
    if (!opItem) {
      return {};
    }
    return {
      username: this.username(opItem),
      password: this.password(opItem),
      otp: this.otp(opItem),
    };
  }

  getField(item: FullItem, purpose: FullItemAllOfFields.PurposeEnum) {
    return item.fields?.find((f) => f.purpose === purpose)?.value;
  }

  username(item: FullItem) {
    return this.getField(item, FullItemAllOfFields.PurposeEnum.Username);
  }

  password(item: FullItem) {
    return this.getField(item, FullItemAllOfFields.PurposeEnum.Password);
  }

  otp(item: FullItem) {
    return item.fields?.find((f) => f.type === FullItemAllOfFields.TypeEnum.Otp)
      ?.otp;
  }
}

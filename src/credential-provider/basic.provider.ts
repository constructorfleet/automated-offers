import {
  BasicCredentialProviderConfig,
  BasicCredentialProviderType,
  BasicCredentialsConfig,
} from "src/config";
import { Credentials, CredentialsProvider } from "./credential-provider";
import {
  InjectConfig,
  RegisterCredentialProvider,
} from "./credential-provider.providers";

@RegisterCredentialProvider(BasicCredentialProviderType)
export class BasicCredentialsProvider extends CredentialsProvider<
  BasicCredentialProviderConfig,
  BasicCredentialsConfig
> {
  constructor(
    @InjectConfig(BasicCredentialProviderType)
    config: BasicCredentialProviderConfig
  ) {
    super(config);
  }

  async getCredentials(args: BasicCredentialsConfig): Promise<Credentials> {
    return {
      username: args.username,
      password: args.password,
    };
  }
}
